import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, bannerWriteProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { products, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadsPath = path.join(projectRoot, "uploads");

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Email ou mot de passe incorrect" });
        }
        
        if (!user.passwordHash) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Ce compte utilise une autre méthode de connexion" });
        }
        
        // Verify password
        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
        }

        // Create session token and set cookie
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
        name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if user already exists
        const existing = await db.getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Un compte avec cet email existe déjà" });
        }
        
        // Hash password
        const bcrypt = await import("bcryptjs");
        const passwordHash = await bcrypt.hash(input.password, 10);
        
        // Create user
        const openId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = await db.createUser({
          openId,
          email: input.email,
          name: input.name,
          passwordHash,
          loginMethod: "email",
        });

        if (!user) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erreur lors de la création du compte" });
        }

        // Create session token and set cookie
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products router
  products: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getProducts(input.limit, input.offset);
      }),

    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const product = await db.getProductById(input);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    getVariants: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getProductVariants(input)),

    getImages: publicProcedure
      .input(z.number())
      .query(({ input }) => db.getProductImages(input)),

    getByCategory: publicProcedure
      .input(z.object({
        category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.category, input.limit, input.offset);
      }),

    getCategoryFilters: publicProcedure
      .input(z.object({ category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]) }))
      .query(({ input }) => db.getCategoryFilters(input.category)),

    listByCategoryFiltered: publicProcedure
      .input(z.object({
        category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]),
        priceMin: z.number().optional(),
        priceMax: z.number().optional(),
        colors: z.array(z.string()).optional(),
        sizes: z.array(z.string()).optional(),
        onSale: z.boolean().optional(),
        limit: z.number().default(100),
      }))
      .query(({ input }) => db.getProductsByCategoryFiltered(input.category, {
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        colors: input.colors,
        sizes: input.sizes,
        onSale: input.onSale,
        limit: input.limit,
      })),

    search: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.searchProducts(input.query, input.limit, input.offset);
      }),

    getFeatured: publicProcedure
      .input(z.object({
        limit: z.number().default(8),
      }))
      .query(async ({ input }) => {
        return db.getFeaturedProducts(input.limit);
      }),

    getByCreator: publicProcedure
      .input(z.object({
        creatorId: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getCreatorProducts(input.creatorId, input.limit, input.offset);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]),
        price: z.string(),
        previewImageUrl: z.string(),
        fileUrl: z.string(),
        fileSize: z.number().optional(),
        fileType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const creator = await db.getCreatorByUserId(ctx.user.id);
        if (!creator) {
          throw new TRPCError({ code: "FORBIDDEN", message: "User is not a creator" });
        }

        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const result = await dbInstance.insert(products).values({
          creatorId: creator.id,
          name: input.name,
          description: input.description,
          category: input.category,
          price: input.price as any,
          previewImageUrl: input.previewImageUrl,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          fileType: input.fileType,
        });

        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]).optional(),
        price: z.string().optional(),
        previewImageUrl: z.string().optional(),
        fileUrl: z.string().optional(),
        fileSize: z.number().optional(),
        fileType: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if product exists and belongs to user
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const creator = await db.getCreatorByUserId(ctx.user.id);
        if (!creator || product.creatorId !== creator.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to update this product" });
        }

        const updateData: any = { ...input };
        delete updateData.id;

        const result = await dbInstance.update(products).set(updateData).where(eq(products.id, input.id));
        return result;
      }),

    delete: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: productId, ctx }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if product exists and belongs to user
        const product = await db.getProductById(productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        const creator = await db.getCreatorByUserId(ctx.user.id);
        if (!creator || product.creatorId !== creator.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized to delete this product" });
        }

        const result = await dbInstance.delete(products).where(eq(products.id, productId));
        return result;
      }),
  }),

  // Creators router
  creators: router({
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getCreatorById(input);
      }),

    getFeatured: publicProcedure
      .input(z.object({
        limit: z.number().default(6),
      }))
      .query(async ({ input }) => {
        return db.getFeaturedCreators(input.limit);
      }),

    getProfile: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getCreatorByUserId(ctx.user.id);
      }),

    setupCreator: protectedProcedure
      .input(z.object({
        displayName: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getCreatorByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "User is already a creator" });
        }
        return db.createCreator(ctx.user.id, input.displayName);
      }),
  }),

  // Cart router
  cart: router({
    getItems: protectedProcedure
      .query(async ({ ctx }) => {
        const items = await db.getCartItems(ctx.user.id);
        // Fetch product details for each cart item
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await db.getProductById(item.productId);
            return { ...item, product };
          })
        );
        return itemsWithProducts;
      }),

    add: protectedProcedure
      .input(z.object({ productId: z.number(), variantId: z.number().optional(), quantity: z.number().min(1).optional() }))
      .mutation(async ({ input, ctx }) => {
        const { productId, variantId, quantity = 1 } = input;
        const product = await db.getProductById(productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        const existing = await db.getCartItems(ctx.user.id);
        if (existing.some(item => item.productId === productId && (item.variantId ?? null) === (variantId ?? null))) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Ce produit (cette variante) est déjà dans le panier" });
        }
        return db.addToCart(ctx.user.id, productId, variantId, quantity);
      }),

    remove: protectedProcedure
      .input(z.number())
      .mutation(async ({ input: cartItemId, ctx }) => {
        return db.removeFromCart(cartItemId);
      }),

    clear: protectedProcedure
      .mutation(async ({ ctx }) => {
        return db.clearCart(ctx.user.id);
      }),
  }),

  // Orders router
  orders: router({
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input, ctx }) => {
        return db.getUserOrders(ctx.user.id, input.limit, input.offset);
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input, ctx }) => {
        const order = await db.getOrderById(input);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        const items = await db.getOrderItems(input);
        return { ...order, items };
      }),

    create: protectedProcedure
      .input(z.object({
        totalAmount: z.string(),
        stripePaymentIntentId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createOrder(ctx.user.id, input.totalAmount, input.stripePaymentIntentId);
        return result;
      }),

    createCheckoutSession: protectedProcedure
      .input(z.object({
        items: z.array(z.object({
          productId: z.number(),
          price: z.string(),
          name: z.string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
        
        if (!stripeSecretKey) {
          throw new TRPCError({ 
            code: "INTERNAL_SERVER_ERROR", 
            message: "Stripe is not configured. Please contact the administrator." 
          });
        }

        // Dynamic import to avoid loading Stripe on server start
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(stripeSecretKey, {
          apiVersion: "2023-10-16",
        });

        // Calculate total amount
        const totalAmount = input.items.reduce((sum, item) => {
          return sum + parseFloat(item.price);
        }, 0);

        // Create line items for Stripe
        const lineItems = input.items.map(item => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(parseFloat(item.price) * 100), // Convert to cents
          },
          quantity: 1,
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${ENV.appUrl}/orders?success=true`,
          cancel_url: `${ENV.appUrl}/cart?canceled=true`,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "completed", "failed", "refunded"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify ownership
        const order = await db.getOrderById(input.orderId);
        if (!order || order.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        return db.updateOrderStatus(input.orderId, input.status);
      }),
  }),

  // Admin router (back office — les modifications sont publiées sur le site)
  admin: router({
    products: router({
      list: adminProcedure
        .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
        .query(({ input }) => db.getProductsAdmin(input.limit, input.offset)),
      create: adminProcedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]),
          price: z.string().min(1),
          salePrice: z.string().optional(),
          reference: z.string().optional(),
          previewImageUrl: z.string().min(1),
          fileUrl: z.string().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const created = await db.createProductAdmin({
              name: input.name,
              description: input.description,
              category: input.category,
              price: input.price,
              salePrice: input.salePrice,
              reference: input.reference,
              previewImageUrl: input.previewImageUrl,
              fileUrl: input.fileUrl ?? "",
              isFeatured: input.isFeatured ?? false,
              isActive: input.isActive ?? true,
            });
            if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de données indisponible ou tables manquantes (products/creators). Exécutez les migrations." });
            return created;
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("doesn't exist") || msg.includes("Unknown table")) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Table products ou creators manquante. Exécutez les migrations SQL (drizzle)." });
            }
            throw e;
          }
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          reference: z.string().optional().nullable(),
          name: z.string().optional(),
          description: z.string().optional().nullable(),
          category: z.enum(["women", "men", "children", "dresses", "suits", "sportswear", "accessories", "shoes", "bags", "jewelry", "other"]).optional(),
          price: z.string().optional(),
          salePrice: z.string().optional().nullable(),
          previewImageUrl: z.string().optional(),
          fileUrl: z.string().optional(),
          isFeatured: z.boolean().optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          const dbInstance = await db.getDb();
          if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const { id, ...rest } = input;
          const updateData: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(rest)) if (v !== undefined) updateData[k] = v;
          if (Object.keys(updateData).length === 0) return db.getProductById(id);
          await dbInstance.update(products).set(updateData as any).where(eq(products.id, id));
          return db.getProductById(id);
        }),
      delete: adminProcedure
        .input(z.number())
        .mutation(async ({ input: productId }) => {
          const dbInstance = await db.getDb();
          if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          await dbInstance.delete(products).where(eq(products.id, productId));
          return { success: true };
        }),
      variants: router({
        list: adminProcedure.input(z.number()).query(({ input }) => db.getProductVariants(input)),
        create: adminProcedure
          .input(z.object({ productId: z.number(), sku: z.string(), size: z.string().optional(), color: z.string().optional(), stock: z.number().optional() }))
          .mutation(({ input }) => db.createProductVariant(input)),
        update: adminProcedure
          .input(z.object({ id: z.number(), sku: z.string().optional(), size: z.string().optional(), color: z.string().optional(), stock: z.number().optional() }))
          .mutation(async ({ input }) => {
            const { id, ...rest } = input;
            return db.updateProductVariant(id, rest);
          }),
        delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteProductVariant(input)),
      }),
      images: router({
        list: adminProcedure.input(z.number()).query(({ input }) => db.getProductImages(input)),
        add: adminProcedure.input(z.object({ productId: z.number(), imageUrl: z.string(), sortOrder: z.number().optional() })).mutation(({ input }) => db.addProductImage(input.productId, input.imageUrl, input.sortOrder)),
        delete: adminProcedure.input(z.number()).mutation(({ input }) => db.deleteProductImage(input)),
      }),
    }),
    stock: router({
      list: adminProcedure
        .input(z.object({ size: z.string().optional(), color: z.string().optional() }).optional())
        .query(({ input }) => db.getAllVariantsForAdmin(input)),
      updateVariant: adminProcedure
        .input(z.object({ id: z.number(), stock: z.number().optional(), sku: z.string().optional(), size: z.string().optional(), color: z.string().optional() }))
        .mutation(async ({ input }) => {
          const { id, ...rest } = input;
          return db.updateProductVariant(id, rest);
        }),
    }),
    upload: adminProcedure
      .input(z.object({ dataUrl: z.string().min(1), folder: z.enum(["products", "banners", "settings"]) }))
      .mutation(({ input }) => {
        const match = input.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Format dataUrl invalide" });
        const mime = match[1];
        const ext = mime === "image/png" ? "png" : mime === "image/jpeg" || mime === "image/jpg" ? "jpg" : mime === "image/webp" ? "webp" : "png";
        const buf = Buffer.from(match[2], "base64");
        const dir = path.join(uploadsPath, input.folder);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
        const filePath = path.join(dir, name);
        fs.writeFileSync(filePath, buf);
        return { url: `/uploads/${input.folder}/${name}` };
      }),
    users: router({
      list: adminProcedure
        .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
        .query(({ input }) => db.getAllUsers(input.limit, input.offset)),
      create: adminProcedure
        .input(z.object({
          email: z.string().email(),
          password: z.string().min(6),
          name: z.string().min(1),
          role: z.enum(["admin", "sales", "stock", "designer"]),
        }))
        .mutation(async ({ input }) => {
          const existing = await db.getUserByEmail(input.email);
          if (existing) throw new TRPCError({ code: "CONFLICT", message: "Un compte avec cet email existe déjà" });
          const bcrypt = await import("bcryptjs");
          const passwordHash = await bcrypt.hash(input.password, 10);
          const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
          await db.createUser({
            openId,
            email: input.email,
            name: input.name,
            passwordHash,
            loginMethod: "email",
          });
          const user = await db.getUserByEmail(input.email);
          if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          const dbInstance = await db.getDb();
          if (dbInstance) await dbInstance.update(users).set({ role: input.role }).where(eq(users.id, user.id));
          return db.getUserByEmail(input.email);
        }),
    }),
    orders: router({
      list: adminProcedure
        .input(z.object({
          limit: z.number().default(100),
          offset: z.number().default(0),
          status: z.enum(["pending", "confirmed", "shipped", "completed", "failed", "refunded", "cancelled"]).optional(),
        }))
        .query(({ input }) => db.getAllOrders(input.limit, input.offset, input.status)),
      getById: adminProcedure
        .input(z.number())
        .query(async ({ input }) => {
          const order = await db.getOrderById(input);
          if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Commande introuvable" });
          const items = await db.getOrderItems(input);
          return { ...order, items };
        }),
      updateStatus: adminProcedure
        .input(z.object({ orderId: z.number(), status: z.enum(["pending", "confirmed", "shipped", "completed", "failed", "refunded", "cancelled"]) }))
        .mutation(({ input }) => db.updateOrderStatus(input.orderId, input.status)),
    }),
    banners: router({
      list: adminProcedure
        .input(z.object({
          pageType: z.string().optional(),
          status: z.string().optional(),
          pageIdentifier: z.string().optional(),
          dateFrom: z.string().optional(),
          dateTo: z.string().optional(),
        }).optional())
        .query(({ input }) => db.getBannersAll(input)),
      create: bannerWriteProcedure
        .input(z.object({
          title: z.string().min(1),
          imageUrl: z.string().min(1),
          subtitle: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
          buttonText: z.string().optional().nullable(),
          buttonLink: z.string().optional().nullable(),
          linkUrl: z.string().optional().nullable(),
          pageType: z.enum(["home", "category", "subcategory", "filter", "promotion"]).optional(),
          pageIdentifier: z.string().optional().nullable(),
          sortOrder: z.number().optional(),
          startDate: z.string().optional().nullable(),
          endDate: z.string().optional().nullable(),
          status: z.enum(["active", "inactive"]).optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ input }) => {
          try {
            const created = await db.createBanner(input);
            if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de données indisponible ou table banners manquante." });
            return created;
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            if (msg.includes("doesn't exist") || msg.includes("Unknown table")) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Table banners manquante. Exécutez la migration drizzle/0007_banner_management.sql." });
            }
            throw e;
          }
        }),
      update: bannerWriteProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().min(1).optional(),
          imageUrl: z.string().min(1).optional(),
          subtitle: z.string().optional().nullable(),
          description: z.string().optional().nullable(),
          buttonText: z.string().optional().nullable(),
          buttonLink: z.string().optional().nullable(),
          linkUrl: z.string().optional().nullable(),
          pageType: z.enum(["home", "category", "subcategory", "filter", "promotion"]).optional(),
          pageIdentifier: z.string().optional().nullable(),
          sortOrder: z.number().optional(),
          startDate: z.string().optional().nullable(),
          endDate: z.string().optional().nullable(),
          status: z.enum(["active", "inactive"]).optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(({ input }) => {
          const { id, ...rest } = input;
          return db.updateBanner(id, rest);
        }),
      delete: bannerWriteProcedure.input(z.number()).mutation(({ input }) => db.deleteBanner(input)),
      images: router({
        list: adminProcedure.input(z.number()).query(({ input }) => db.getBannerImages(input)),
        add: bannerWriteProcedure.input(z.object({ bannerId: z.number(), imageUrl: z.string(), sortOrder: z.number().optional() })).mutation(({ input }) => db.addBannerImage(input.bannerId, input.imageUrl, input.sortOrder)),
        delete: bannerWriteProcedure.input(z.number()).mutation(({ input }) => db.deleteBannerImage(input)),
      }),
    }),
    settings: router({
      get: adminProcedure.query(() => db.getSiteSettings()),
      update: adminProcedure
        .input(z.record(z.string(), z.string()))
        .mutation(async ({ input }) => {
          for (const [k, v] of Object.entries(input)) await db.setSiteSetting(k, v);
          return db.getSiteSettings();
        }),
    }),
  }),

  // Banners (public - accueil + pages catégories/filtres)
  banners: router({
    list: publicProcedure.query(() => db.getBannersActiveWithImages()),
    getForPage: publicProcedure
      .input(z.object({ pageType: z.string(), pageIdentifier: z.string().optional().nullable() }))
      .query(({ input }) => db.getBannersForPage(input.pageType, input.pageIdentifier)),
    getForPageWithImages: publicProcedure
      .input(z.object({ pageType: z.string(), pageIdentifier: z.string().optional().nullable() }))
      .query(async ({ input }) => {
        const list = await db.getBannersForPage(input.pageType, input.pageIdentifier);
        const result = [];
        for (const b of list) {
          const extra = await db.getBannerImages(b.id);
          const images = [b.imageUrl, ...extra.map((i) => i.imageUrl)];
          result.push({
            ...b,
            images,
            buttonText: (b as any).buttonText ?? null,
            buttonLink: (b as any).buttonLink ?? (b as any).linkUrl ?? null,
          });
        }
        return result;
      }),
  }),

  // Site settings (public - nom du site, email contact, etc.)
  siteSettings: router({
    get: publicProcedure.query(() => db.getSiteSettings()),
  }),

  // Reviews router
  reviews: router({
    getByProduct: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return db.getProductReviews(input);
      }),

    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createReview(input.productId, ctx.user.id, input.rating, input.comment);
      }),
  }),
});

// Re-export for convenience
export { products };
export type AppRouter = typeof appRouter;
