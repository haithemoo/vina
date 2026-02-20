import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { products } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
      }))
      .mutation(async ({ input }) => {
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
      .mutation(async ({ input }) => {
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

    getByCategory: publicProcedure
      .input(z.object({
        category: z.enum(["shirts", "pants", "accessories", "shoes", "other"]),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.category, input.limit, input.offset);
      }),

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
        category: z.enum(["shirts", "pants", "accessories", "shoes", "other"]),
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
        category: z.enum(["shirts", "pants", "accessories", "shoes", "other"]).optional(),
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
      .input(z.number())
      .mutation(async ({ input: productId, ctx }) => {
        // Check if product exists
        const product = await db.getProductById(productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }

        // Check if already in cart
        const existing = await db.getCartItems(ctx.user.id);
        if (existing.some(item => item.productId === productId)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Product already in cart" });
        }

        return db.addToCart(ctx.user.id, productId);
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
