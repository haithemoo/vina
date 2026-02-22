import { eq, desc, asc, and, like, inArray, sql, or, lte, gte, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, creators, products, cartItems, orders, orderItems, reviews, banners, bannerImages, siteSettings, productVariants, productImages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(userData: {
  openId: string;
  email: string;
  name: string;
  passwordHash: string;
  loginMethod: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return undefined;
  }

  await db.insert(users).values({
    openId: userData.openId,
    email: userData.email.toLowerCase(),
    name: userData.name,
    passwordHash: userData.passwordHash,
    loginMethod: userData.loginMethod,
    role: "user",
  });

  // Fetch and return the created user
  const created = await db.select().from(users).where(eq(users.openId, userData.openId)).limit(1);
  return created.length > 0 ? created[0] : undefined;
}

/** Ajoute la colonne passwordHash à la table users si elle n'existe pas (pour connexion email/mdp). */
export async function ensureUsersPasswordHashColumn(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Database] DATABASE_URL manquant, colonne passwordHash non ajoutée.");
    return;
  }
  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(url);
    try {
      await conn.execute("ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) NULL");
      console.log("[Database] Colonne users.passwordHash ajoutée.");
    } catch (alterErr: unknown) {
      const msg = alterErr instanceof Error ? alterErr.message : String(alterErr);
      if (!msg.includes("Duplicate column") && !msg.includes("already exists")) {
        console.warn("[Database] ensureUsersPasswordHashColumn ALTER:", alterErr);
      }
    } finally {
      await conn.end();
    }
  } catch (e) {
    console.warn("[Database] ensureUsersPasswordHashColumn:", e);
  }
}

/** Crée le compte administrateur principal s'il n'existe aucun admin. À appeler au démarrage. */
export async function ensureFirstAdmin(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")).limit(1);
  if (admins.length > 0) return;
  const bcrypt = await import("bcryptjs");
  const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminVina2025!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  await db.insert(users).values({
    openId: `admin_${Date.now()}`,
    email: (process.env.ADMIN_INITIAL_EMAIL || "admin@vina.com").toLowerCase(),
    name: process.env.ADMIN_INITIAL_NAME || "Administrateur principal",
    passwordHash,
    loginMethod: "email",
    role: "admin",
  });
  console.log("[Database] Compte administrateur principal créé. Email:", process.env.ADMIN_INITIAL_EMAIL || "admin@vina.com");
}

/** Admin: tous les utilisateurs (sans mot de passe) */
export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: users.id,
    openId: users.openId,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    lastSignedIn: users.lastSignedIn,
  }).from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

// Products queries
export async function getProducts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(eq(products.isActive, true)).limit(limit).offset(offset);
}

export async function getProductsByCategory(category: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(eq(products.category, category as any), eq(products.isActive, true)))
    .limit(limit)
    .offset(offset);
}

/** Filtres disponibles pour une catégorie (couleurs et tailles depuis les variantes) */
export async function getCategoryFilters(category: string): Promise<{ colors: string[]; sizes: string[] }> {
  const db = await getDb();
  if (!db) return { colors: [], sizes: [] };
  const rows = await db
    .selectDistinct({ color: productVariants.color, size: productVariants.size })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(and(eq(products.category, category as any), eq(products.isActive, true)));
  const colors = Array.from(new Set(rows.map((r) => r.color).filter((x): x is string => Boolean(x)))).sort();
  const sizes = Array.from(new Set(rows.map((r) => r.size).filter((x): x is string => Boolean(x)))).sort();
  return { colors, sizes };
}

/** Produits d'une catégorie avec filtres optionnels (prix, couleurs, tailles, soldes) */
export async function getProductsByCategoryFiltered(
  category: string,
  opts: { priceMin?: number; priceMax?: number; colors?: string[]; sizes?: string[]; onSale?: boolean; limit?: number }
) {
  const db = await getDb();
  if (!db) return [];
  const limit = opts.limit ?? 100;
  const conditions = [eq(products.category, category as any), eq(products.isActive, true)];
  if (opts.onSale) {
    conditions.push(sql`${products.salePrice} IS NOT NULL` as any);
    conditions.push(sql`${products.salePrice} > 0` as any);
  }
  if (opts.priceMin != null) conditions.push(sql`${products.price} >= ${opts.priceMin}` as any);
  if (opts.priceMax != null) conditions.push(sql`${products.price} <= ${opts.priceMax}` as any);

  if ((opts.colors?.length ?? 0) > 0 || (opts.sizes?.length ?? 0) > 0) {
    const variantConds = [eq(products.category, category as any), eq(products.isActive, true)];
    if (opts.colors?.length) variantConds.push(inArray(productVariants.color, opts.colors));
    if (opts.sizes?.length) variantConds.push(inArray(productVariants.size, opts.sizes));
    const productIds = await db
      .selectDistinct({ productId: productVariants.productId })
      .from(productVariants)
      .innerJoin(products, eq(products.id, productVariants.productId))
      .where(and(...variantConds));
    const ids = productIds.map((r) => r.productId);
    if (ids.length === 0) return [];
    const idConds = [inArray(products.id, ids), eq(products.isActive, true)];
    if (opts.onSale) idConds.push(sql`${products.salePrice} IS NOT NULL` as any, sql`${products.salePrice} > 0` as any);
    if (opts.priceMin != null) idConds.push(sql`${products.price} >= ${opts.priceMin}` as any);
    if (opts.priceMax != null) idConds.push(sql`${products.price} <= ${opts.priceMax}` as any);
    return db.select().from(products).where(and(...idConds)).limit(limit);
  }

  return db.select().from(products).where(and(...conditions)).limit(limit);
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(like(products.name, `%${query}%`), eq(products.isActive, true)))
    .limit(limit)
    .offset(offset);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedProducts(limit = 8) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
    .limit(limit);
}

export async function getCreatorProducts(creatorId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products)
    .where(and(eq(products.creatorId, creatorId), eq(products.isActive, true)))
    .limit(limit)
    .offset(offset);
}

/** Admin: tous les produits (actifs et inactifs) */
export async function getProductsAdmin(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).orderBy(desc(products.updatedAt)).limit(limit).offset(offset);
}

// Product variants (taille, couleur, stock, SKU)
export async function getProductVariants(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

export async function getProductVariantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(productVariants).where(eq(productVariants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProductVariant(data: { productId: number; sku: string; size?: string; color?: string; stock?: number }) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(productVariants).values({
    productId: data.productId,
    sku: data.sku,
    size: data.size ?? null,
    color: data.color ?? null,
    stock: data.stock ?? 0,
  });
  const rows = await db.select().from(productVariants).where(eq(productVariants.productId, data.productId)).orderBy(desc(productVariants.id)).limit(1);
  return rows[0];
}

export async function updateProductVariant(id: number, data: { sku?: string; size?: string; color?: string; stock?: number }) {
  const db = await getDb();
  if (!db) return undefined;
  const updateData: Record<string, unknown> = {};
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.size !== undefined) updateData.size = data.size;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.stock !== undefined) updateData.stock = data.stock;
  if (Object.keys(updateData).length === 0) return getProductVariantById(id);
  await db.update(productVariants).set(updateData as any).where(eq(productVariants.id, id));
  return getProductVariantById(id);
}

/** Admin: toutes les variantes avec le nom du produit (pour la page Stock). */
export async function getAllVariantsForAdmin(filters?: { size?: string; color?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.size) conditions.push(eq(productVariants.size, filters.size));
  if (filters?.color) conditions.push(eq(productVariants.color, filters.color));
  const base = db
    .select({
      id: productVariants.id,
      productId: productVariants.productId,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
      stock: productVariants.stock,
      productName: products.name,
      productReference: products.reference,
    })
    .from(productVariants)
    .leftJoin(products, eq(productVariants.productId, products.id));
  const ordered = conditions.length > 0
    ? base.where(and(...conditions)).orderBy(desc(productVariants.productId), asc(productVariants.id))
    : base.orderBy(desc(productVariants.productId), asc(productVariants.id));
  return ordered;
}

export async function deleteProductVariant(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(productVariants).where(eq(productVariants.id, id));
}

// Product images (galerie)
export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder), desc(productImages.id));
}

export async function addProductImage(productId: number, imageUrl: string, sortOrder?: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(productImages).values({ productId, imageUrl, sortOrder: sortOrder ?? 0 });
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(productImages).where(eq(productImages.id, id));
}

// Creators queries
export async function getCreatorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creators).where(eq(creators.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCreatorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(creators).where(eq(creators.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedCreators(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(creators)
    .where(eq(creators.isVerified, true))
    .orderBy(desc(creators.totalSales))
    .limit(limit);
}

export async function createCreator(userId: number, displayName: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(creators).values({ userId, displayName });
  const list = await db.select().from(creators).where(eq(creators.userId, userId)).limit(1);
  return list[0];
}

/** Retourne le premier créateur ou en crée un (pour les produits créés depuis l’admin). */
export async function getOrCreateDefaultCreator(): Promise<number | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const existing = await db.select({ id: creators.id }).from(creators).limit(1);
  if (existing.length > 0) return existing[0].id;
  const usersList = await db.select({ id: users.id }).from(users).limit(1);
  if (usersList.length === 0) return undefined;
  const created = await createCreator(usersList[0].id, "VINA Boutique");
  return created?.id;
}

/** Admin: créer un produit (utilise le créateur par défaut). */
export async function createProductAdmin(data: {
  name: string;
  description?: string;
  category: string;
  price: string;
  salePrice?: string;
  reference?: string;
  previewImageUrl: string;
  fileUrl?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return undefined;
  const creatorId = await getOrCreateDefaultCreator();
  if (creatorId == null) return undefined;
  await db.insert(products).values({
    creatorId,
    name: data.name,
    description: data.description ?? null,
    category: data.category as any,
    price: data.price as any,
    salePrice: data.salePrice ?? null,
    reference: data.reference ?? null,
    previewImageUrl: data.previewImageUrl,
    fileUrl: data.fileUrl ?? "",
    isFeatured: data.isFeatured ?? false,
    isActive: data.isActive ?? true,
  });
  const list = await db.select().from(products).where(eq(products.creatorId, creatorId)).orderBy(desc(products.id)).limit(1);
  return list[0];
}

/** Met à jour l'enum category de la table products si nécessaire (anciennes migrations : stickers, bitmojis...). */
export async function ensureProductsCategoryEnum(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(url);
    try {
      await conn.execute(`
        ALTER TABLE \`products\` MODIFY COLUMN \`category\` enum(
          'women','men','children','dresses','suits','sportswear','accessories','shoes','bags','jewelry','other'
        ) NOT NULL
      `);
      console.log("[Database] Enum category produits à jour.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes("Unknown column") && !msg.includes("Duplicate column")) {
        console.warn("[Database] ensureProductsCategoryEnum:", e);
      }
    } finally {
      await conn.end();
    }
  } catch (e) {
    console.warn("[Database] ensureProductsCategoryEnum:", e);
  }
}

/** Crée les tables banners et siteSettings si elles n'existent pas (évite erreur "table doesn't exist"). */
export async function ensureBannersAndSettingsTables(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  try {
    const mysql = await import("mysql2/promise");
    const conn = await mysql.createConnection(url);
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`banners\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`title\` varchar(255) NOT NULL,
          \`subtitle\` varchar(255),
          \`description\` text,
          \`imageUrl\` varchar(512) NOT NULL,
          \`buttonText\` varchar(128),
          \`buttonLink\` varchar(512),
          \`linkUrl\` varchar(512),
          \`pageType\` enum('home','category','subcategory','filter','promotion') DEFAULT 'home' NOT NULL,
          \`pageIdentifier\` varchar(128),
          \`sortOrder\` int DEFAULT 0 NOT NULL,
          \`startDate\` date,
          \`endDate\` date,
          \`status\` enum('active','inactive') DEFAULT 'active' NOT NULL,
          \`isActive\` boolean DEFAULT true NOT NULL,
          \`createdAt\` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
          \`updatedAt\` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
          CONSTRAINT \`banners_id\` PRIMARY KEY(\`id\`)
        )
      `);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`siteSettings\` (
          \`key\` varchar(64) NOT NULL,
          \`value\` text,
          \`updatedAt\` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
          CONSTRAINT \`siteSettings_key\` PRIMARY KEY(\`key\`)
        )
      `);
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`bannerImages\` (
          \`id\` int AUTO_INCREMENT NOT NULL,
          \`bannerId\` int NOT NULL,
          \`imageUrl\` varchar(512) NOT NULL,
          \`sortOrder\` int DEFAULT 0 NOT NULL,
          \`createdAt\` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
          CONSTRAINT \`bannerImages_id\` PRIMARY KEY(\`id\`)
        )
      `);
    } finally {
      await conn.end();
    }
  } catch (e) {
    console.warn("[Database] ensureBannersAndSettingsTables:", e);
  }
}

export async function getBannerImages(bannerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bannerImages).where(eq(bannerImages.bannerId, bannerId)).orderBy(asc(bannerImages.sortOrder), asc(bannerImages.id));
}

export async function addBannerImage(bannerId: number, imageUrl: string, sortOrder?: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(bannerImages).values({ bannerId, imageUrl, sortOrder: sortOrder ?? 0 });
}

export async function deleteBannerImage(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(bannerImages).where(eq(bannerImages.id, id));
}

// Photos réelles (Unsplash) pour les produits de démo — w=600&h=800
const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=600&h=800&fit=crop`;

const SEED_PRODUCTS: Array<{ name: string; category: "women" | "men" | "children" | "dresses" | "suits" | "sportswear" | "accessories" | "shoes" | "bags" | "jewelry" | "other"; price: string; salePrice?: string; reference?: string; previewImageUrl: string; isFeatured?: boolean }> = [
  // Femme (women)
  { name: "Robe d'été légère", category: "women", price: "89.00", salePrice: "69.00", reference: "VINA-W-001", previewImageUrl: U("1595776625786-0f2a2f28c5c7"), isFeatured: true },
  { name: "Blouse fluide", category: "women", price: "45.00", reference: "VINA-W-002", previewImageUrl: U("1564257631407-69179c2e0342") },
  { name: "Jupe midi plissée", category: "women", price: "52.00", salePrice: "39.00", reference: "VINA-W-003", previewImageUrl: U("1583496661160-43b8c0a53e24") },
  { name: "Pull en cachemire", category: "women", price: "78.00", reference: "VINA-W-004", previewImageUrl: U("1576566588028-4147f3842f27") },
  // Homme (men)
  { name: "Pantalon slim homme", category: "men", price: "75.00", reference: "VINA-M-001", previewImageUrl: U("1624378514722-3232e4f1c9ca") },
  { name: "Chemise casual", category: "men", price: "55.00", salePrice: "44.00", reference: "VINA-M-002", previewImageUrl: U("1596755094516-36706a8d2e88") },
  { name: "Veste en jean", category: "men", price: "89.00", reference: "VINA-M-003", previewImageUrl: U("1551028719-00167b16eac5"), isFeatured: true },
  { name: "Polo coton", category: "men", price: "42.00", reference: "VINA-M-004", previewImageUrl: U("1583743815036-c34e0c4b1f1e") },
  // Enfants (children)
  { name: "T-shirt enfant", category: "children", price: "22.00", reference: "VINA-C-001", previewImageUrl: U("1519237190454-2d1d2f6a2c3d") },
  { name: "Robe fille", category: "children", price: "35.00", salePrice: "28.00", reference: "VINA-C-002", previewImageUrl: U("1518831959646-742c3c14eb87") },
  { name: "Sweat à capuche enfant", category: "children", price: "38.00", reference: "VINA-C-003", previewImageUrl: U("1503919545889-a7f842cc8c2b") },
  // Robes (dresses)
  { name: "Robe cocktail", category: "dresses", price: "120.00", reference: "VINA-D-001", previewImageUrl: U("1595776625786-0f2a2f28c5c7"), isFeatured: true },
  { name: "Robe soirée", category: "dresses", price: "185.00", salePrice: "149.00", reference: "VINA-D-002", previewImageUrl: U("1564257631407-69179c2e0342") },
  { name: "Robe midi imprimée", category: "dresses", price: "68.00", reference: "VINA-D-003", previewImageUrl: U("1583496661160-43b8c0a53e24") },
  // Costumes (suits)
  { name: "Costume deux pièces", category: "suits", price: "199.00", reference: "VINA-S-001", previewImageUrl: U("1507676342108-0f91b94542cf") },
  { name: "Blazer femme", category: "suits", price: "145.00", salePrice: "119.00", reference: "VINA-S-002", previewImageUrl: U("1594938298603-9baa7c2f7b2a") },
  { name: "Pantalon tailleur", category: "suits", price: "79.00", reference: "VINA-S-003", previewImageUrl: U("1624378514722-3232e4f1c9ca") },
  // Sport (sportswear)
  { name: "Short de sport", category: "sportswear", price: "35.00", reference: "VINA-SP-001", previewImageUrl: U("1517836356593-567426e2a291") },
  { name: "Legging running", category: "sportswear", price: "48.00", reference: "VINA-SP-002", previewImageUrl: U("1506629082955-6b9c9e0e0c5a") },
  { name: "Débardeur fitness", category: "sportswear", price: "28.00", salePrice: "22.00", reference: "VINA-SP-003", previewImageUrl: U("1571019614242-e5f477e77392") },
  // Accessoires (accessories)
  { name: "Sac à main cuir", category: "accessories", price: "120.00", reference: "VINA-A-001", previewImageUrl: U("1584917860122-85925e493f45") },
  { name: "Écharpe laine", category: "accessories", price: "38.00", reference: "VINA-A-002", previewImageUrl: U("1520903928072-90b4b2ba3936") },
  { name: "Ceinture cuir", category: "accessories", price: "45.00", reference: "VINA-A-003", previewImageUrl: U("1551028719-00167b16eac5") },
  { name: "Lunettes de soleil", category: "accessories", price: "65.00", salePrice: "49.00", reference: "VINA-A-004", previewImageUrl: U("1511499767150-a48a79f2e7ba") },
  // Chaussures (shoes)
  { name: "Baskets urbaines", category: "shoes", price: "95.00", salePrice: "79.00", reference: "VINA-SH-001", previewImageUrl: U("1542296834-5a2c2e8e4c5d") },
  { name: "Sandales été", category: "shoes", price: "42.00", reference: "VINA-SH-002", previewImageUrl: U("1603487742137-ae714f649636") },
  { name: "Bottines cuir", category: "shoes", price: "125.00", reference: "VINA-SH-003", previewImageUrl: U("1614252234311-2c9d0a2b3e4f"), isFeatured: true },
  { name: "Escarpins noirs", category: "shoes", price: "78.00", reference: "VINA-SH-004", previewImageUrl: U("1543163521-1a3e3c5e6b7c") },
  // Sacs (bags)
  { name: "Sac à dos", category: "bags", price: "65.00", reference: "VINA-B-001", previewImageUrl: U("1553062407-8c3f2e6e8d9e") },
  { name: "Pochette soirée", category: "bags", price: "55.00", salePrice: "44.00", reference: "VINA-B-002", previewImageUrl: U("1584917860122-85925e493f45") },
  { name: "Cabas toile", category: "bags", price: "48.00", reference: "VINA-B-003", previewImageUrl: U("1591569012125-31d0a8c5e5f6") },
  // Bijoux (jewelry)
  { name: "Collier perles", category: "jewelry", price: "28.00", reference: "VINA-J-001", previewImageUrl: U("1515562141207-7be879c83e6c") },
  { name: "Bracelet cuir", category: "jewelry", price: "18.00", reference: "VINA-J-002", previewImageUrl: U("1515562141207-7be879c83e6c") },
  { name: "Boucles d'oreilles", category: "jewelry", price: "24.00", reference: "VINA-J-003", previewImageUrl: U("1496747611176-843222e1e57c") },
  { name: "Montre élégante", category: "jewelry", price: "95.00", salePrice: "79.00", reference: "VINA-J-004", previewImageUrl: U("1524594152302-2c2c2c2c2c2c") },
  // Autres (other)
  { name: "Cintre premium", category: "other", price: "12.00", reference: "VINA-O-001", previewImageUrl: U("1496747611176-843222e1e57c") },
  { name: "Boîte cadeau", category: "other", price: "8.00", reference: "VINA-O-002", previewImageUrl: U("1496747611176-843222e1e57c") },
  { name: "Sachet parfumé", category: "other", price: "6.00", reference: "VINA-O-003", previewImageUrl: U("1496747611176-843222e1e57c") },
];

/** Données de test : produits par catégorie, variantes (stock), commandes. */
export async function ensureSeedData(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Database] ensureSeedData: pas de connexion DB (DATABASE_URL?).");
      return;
    }
    const creatorId = await getOrCreateDefaultCreator();
    if (creatorId == null) {
      console.warn("[Database] ensureSeedData: aucun utilisateur/créateur (créateur par défaut non créé).");
      return;
    }

    const existingProducts = await db.select({ id: products.id }).from(products).limit(1);
    if (existingProducts.length === 0) {
      const insertedIds: number[] = [];
      for (const s of SEED_PRODUCTS) {
        await db.insert(products).values({
          creatorId,
          name: s.name,
          category: s.category,
          price: s.price as any,
          salePrice: s.salePrice ?? null,
          reference: s.reference ?? null,
          previewImageUrl: s.previewImageUrl,
          fileUrl: "",
          isActive: true,
          isFeatured: s.isFeatured ?? false,
        });
        const last = await db.select({ id: products.id }).from(products).where(eq(products.creatorId, creatorId)).orderBy(desc(products.id)).limit(1);
        if (last[0]) insertedIds.push(last[0].id);
      }
      console.log("[Database] Produits de test créés (" + insertedIds.length + ").");

      // Ajouter des variantes (stock) pour les premiers produits
      const sizes = ["S", "M", "L", "XL"];
      const colors = ["Noir", "Blanc", "Bleu", "Beige"];
      for (let i = 0; i < Math.min(insertedIds.length, 18); i++) {
        const productId = insertedIds[i];
        for (let si = 0; si < 2; si++) {
          for (let ci = 0; ci < 2; ci++) {
            const size = sizes[si];
            const color = colors[ci];
            const stock = 5 + Math.floor(Math.random() * 20);
            await db.insert(productVariants).values({
              productId,
              sku: `VINA-${productId}-${size}-${color.replace(/\s/g, "")}`,
              size,
              color,
              stock,
            });
          }
        }
      }
      console.log("[Database] Variantes (stock) de test créées.");

      // Ajouter des images galerie pour les premiers produits (2 images par produit)
      const extraImageUrls = [
        "https://placehold.co/600x800/e8e0d5/8c8070?text=Detail",
        "https://placehold.co/600x800/d4c4b0/5c5348?text=Variante",
      ];
      for (let i = 0; i < Math.min(insertedIds.length, 20); i++) {
        const productId = insertedIds[i];
        for (let j = 0; j < extraImageUrls.length; j++) {
          await db.insert(productImages).values({ productId, imageUrl: extraImageUrls[j], sortOrder: j });
        }
      }
      console.log("[Database] Images galerie de test ajoutées.");
    }

    const existingOrders = await db.select({ id: orders.id }).from(orders).limit(1);
    if (existingOrders.length === 0) {
      const firstUser = await db.select({ id: users.id }).from(users).limit(1);
      const productList = await db.select().from(products).where(eq(products.creatorId, creatorId)).limit(40);
      if (firstUser.length > 0 && productList.length > 0) {
        const userId = firstUser[0].id;
        const ordersToCreate = [
          { total: "164.00", status: "completed" as const, itemIndexes: [0, 1, 2] },
          { total: "95.00", status: "completed" as const, itemIndexes: [4] },
          { total: "257.00", status: "pending" as const, itemIndexes: [3, 5, 6] },
          { total: "42.00", status: "completed" as const, itemIndexes: [11] },
          { total: "188.00", status: "completed" as const, itemIndexes: [7, 8] },
          { total: "312.00", status: "completed" as const, itemIndexes: [10, 12, 15] },
          { total: "76.00", status: "pending" as const, itemIndexes: [20, 22] },
          { total: "145.00", status: "completed" as const, itemIndexes: [16, 18] },
        ];
        for (const o of ordersToCreate) {
          await db.insert(orders).values({
            userId,
            totalAmount: o.total as any,
            status: o.status,
          });
          const orderRows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.id)).limit(1);
          if (orderRows.length > 0) {
            const orderId = orderRows[0].id;
            for (const idx of o.itemIndexes) {
              if (idx >= productList.length) continue;
              const p = productList[idx];
              await db.insert(orderItems).values({
                orderId,
                productId: p.id,
                creatorId: p.creatorId,
                productName: p.name,
                price: p.price as any,
                fileUrl: p.fileUrl || "",
              });
            }
          }
        }
        console.log("[Database] Commandes de test créées (" + ordersToCreate.length + ").");
      }
    }
  } catch (e) {
    console.warn("[Database] ensureSeedData:", e);
  }
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number, variantId?: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(cartItems).values({ userId, productId, variantId: variantId ?? null, quantity });
}

export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(cartItems).where(eq(cartItems.id, cartItemId));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(cartItems).where(eq(cartItems.userId, userId));
}

// Orders queries
export async function createOrder(userId: number, totalAmount: string, stripePaymentIntentId?: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(orders).values({
    userId,
    totalAmount: totalAmount as any,
    stripePaymentIntentId,
    status: "pending",
  });
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  const order = result.length > 0 ? result[0] : undefined;
  if (!order) return undefined;
  const user = await getUserById(order.userId);
  return {
    ...order,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    shippingAddress: (order as any).shippingAddress ?? null,
    shippingPhone: (order as any).shippingPhone ?? null,
  };
}

export async function getUserOrders(userId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

/** Admin: toutes les commandes avec nom et email utilisateur */
export async function getAllOrders(limit = 100, offset = 0, statusFilter?: string) {
  const db = await getDb();
  if (!db) return [];
  const sel = {
    id: orders.id,
    userId: orders.userId,
    totalAmount: orders.totalAmount,
    status: orders.status,
    createdAt: orders.createdAt,
    userName: users.name,
    userEmail: users.email,
  };
  if (statusFilter) {
    return db
      .select(sel)
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.status, statusFilter as any))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);
  }
  return db
    .select(sel)
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return undefined;
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

// Order items queries
export async function createOrderItem(orderId: number, productId: number, creatorId: number, productName: string, price: string, fileUrl: string) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(orderItems).values({
    orderId,
    productId,
    creatorId,
    productName,
    price: price as any,
    fileUrl,
  });
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// Reviews queries
export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.productId, productId));
}

export async function createReview(productId: number, userId: number, rating: number, comment?: string) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(reviews).values({
    productId,
    userId,
    rating,
    comment,
  });
}

// Banners (public: active only; admin: full CRUD avec filtres par page)
const today = () => sql<string>`CURDATE()`;

/** Conditions "actif" : isActive/status et plage de dates (si date dépassée → exclu) */
function bannerActiveConditions() {
  return and(
    or(eq(banners.isActive, true), eq(banners.status, "active")),
    or(isNull(banners.startDate), lte(banners.startDate, today())),
    or(isNull(banners.endDate), gte(banners.endDate, today()))
  );
}

export async function getBannersActive() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(banners)
      .where(bannerActiveConditions())
      .orderBy(asc(banners.sortOrder), asc(banners.id));
  } catch {
    return [];
  }
}

/** Bannières pour une page donnée (home, category, subcategory, filter). Retourne les bannières ciblant cette page, ou liste vide. */
/** Bannières pour une page donnée : celles qui ciblent cette page (pageIdentifier) ou la valeur par défaut (pageIdentifier null). */
export async function getBannersForPage(pageType: string, pageIdentifier?: string | null) {
  try {
    const db = await getDb();
    if (!db) return [];
    const conditions = [
      bannerActiveConditions(),
      eq(banners.pageType, pageType as any),
    ];
    if (pageIdentifier != null && pageIdentifier !== "") {
      conditions.push(or(eq(banners.pageIdentifier, pageIdentifier), isNull(banners.pageIdentifier)));
    } else {
      conditions.push(isNull(banners.pageIdentifier));
    }
    const rows = await db
      .select()
      .from(banners)
      .where(and(...conditions))
      .orderBy(asc(banners.sortOrder), asc(banners.id));
    return rows;
  } catch {
    return [];
  }
}

/** Bannières actives pour la page d'accueil (pageType=home), avec images carousel */
export async function getBannersActiveWithImages(): Promise<Array<{ id: number; title: string; subtitle: string | null; description: string | null; imageUrl: string; buttonText: string | null; buttonLink: string | null; linkUrl: string | null; sortOrder: number; isActive: boolean; status: string; images: string[] }>> {
  try {
    const list = await getBannersForPage("home");
    if (list.length === 0) {
      const fallback = await getBannersActive();
      const homeFallback = fallback.filter((b) => (b as any).pageType === "home" || !(b as any).pageType);
      const listToUse = homeFallback.length > 0 ? homeFallback : fallback;
      const result = [];
      for (const b of listToUse) {
        const extra = await getBannerImages(b.id);
        const images = [b.imageUrl, ...extra.map((i) => i.imageUrl)];
        result.push({
          ...b,
          images,
          buttonText: (b as any).buttonText ?? null,
          buttonLink: (b as any).buttonLink ?? b.linkUrl ?? null,
          subtitle: (b as any).subtitle ?? null,
          description: (b as any).description ?? null,
          status: (b as any).status ?? "active",
        });
      }
      return result;
    }
    const result = [];
    for (const b of list) {
      const extra = await getBannerImages(b.id);
      const images = [b.imageUrl, ...extra.map((i) => i.imageUrl)];
      result.push({
        ...b,
        images,
        buttonText: (b as any).buttonText ?? null,
        buttonLink: (b as any).buttonLink ?? b.linkUrl ?? null,
        subtitle: (b as any).subtitle ?? null,
        description: (b as any).description ?? null,
        status: (b as any).status ?? "active",
      });
    }
    return result;
  } catch {
    return [];
  }
}

export type BannersListFilters = {
  pageType?: string;
  status?: string;
  pageIdentifier?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function getBannersAll(filters?: BannersListFilters) {
  try {
    const db = await getDb();
    if (!db) return [];
    const conditions = [];
    if (filters?.pageType) conditions.push(eq(banners.pageType, filters.pageType as any));
    if (filters?.status) conditions.push(eq(banners.status, filters.status as any));
    if (filters?.pageIdentifier) conditions.push(eq(banners.pageIdentifier, filters.pageIdentifier));
    if (filters?.dateFrom) conditions.push(gte(banners.startDate, filters.dateFrom as any));
    if (filters?.dateTo) conditions.push(lte(banners.endDate, filters.dateTo as any));
    const base = conditions.length > 0
      ? db.select().from(banners).where(and(...conditions))
      : db.select().from(banners);
    return await base.orderBy(asc(banners.sortOrder), asc(banners.id));
  } catch {
    return [];
  }
}

export async function getBannerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export type CreateBannerData = {
  title: string;
  imageUrl: string;
  subtitle?: string | null;
  description?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  linkUrl?: string | null;
  pageType?: string;
  pageIdentifier?: string | null;
  sortOrder?: number;
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  isActive?: boolean;
};

export async function createBanner(data: CreateBannerData) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(banners).values({
    title: data.title,
    imageUrl: data.imageUrl,
    subtitle: data.subtitle ?? null,
    description: data.description ?? null,
    buttonText: data.buttonText ?? null,
    buttonLink: data.buttonLink ?? data.linkUrl ?? null,
    linkUrl: data.linkUrl ?? null,
    pageType: (data.pageType as any) ?? "home",
    pageIdentifier: data.pageIdentifier ?? null,
    sortOrder: data.sortOrder ?? 0,
    startDate: data.startDate as any ?? null,
    endDate: data.endDate as any ?? null,
    status: (data.status as any) ?? "active",
    isActive: data.isActive ?? true,
  });
  const created = await db.select().from(banners).orderBy(desc(banners.id)).limit(1);
  return created.length > 0 ? created[0] : undefined;
}

export type UpdateBannerData = Partial<CreateBannerData>;

export async function updateBanner(id: number, data: UpdateBannerData) {
  const db = await getDb();
  if (!db) return undefined;
  const updateData: Record<string, unknown> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.subtitle !== undefined) updateData.subtitle = data.subtitle;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.buttonText !== undefined) updateData.buttonText = data.buttonText;
  if (data.buttonLink !== undefined) updateData.buttonLink = data.buttonLink;
  if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl;
  if (data.pageType !== undefined) updateData.pageType = data.pageType;
  if (data.pageIdentifier !== undefined) updateData.pageIdentifier = data.pageIdentifier;
  if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (Object.keys(updateData).length === 0) return getBannerById(id);
  await db.update(banners).set(updateData as any).where(eq(banners.id, id));
  return getBannerById(id);
}

export async function deleteBanner(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.delete(banners).where(eq(banners.id, id));
}

// Site settings (key-value)
export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return {};
  const rows = await db.select().from(siteSettings);
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value ?? "";
  return out;
}

export async function getSiteSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
  return result.length > 0 ? (result[0].value ?? "") : undefined;
}

export async function setSiteSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db.insert(siteSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value, updatedAt: new Date() } });
  return getSiteSetting(key);
}
