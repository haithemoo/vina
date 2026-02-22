import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with role field to distinguish creators from regular users.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "creator", "stock", "sales", "purchase", "designer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Creators table - extended profile for users with creator role
 */
export const creators = mysqlTable("creators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  bannerUrl: varchar("bannerUrl", { length: 512 }),
  totalSales: int("totalSales").default(0).notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 10, scale: 2 }).default("0").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Creator = typeof creators.$inferSelect;
export type InsertCreator = typeof creators.$inferInsert;

/**
 * Products table - digital assets for sale
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId").notNull(),
  reference: varchar("reference", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "women",      // Femmes
    "men",        // Hommes
    "children",   // Enfants
    "dresses",   // Robes
    "suits",     // Costumes
    "sportswear", // Sport
    "accessories", // Accessoires
    "shoes",     // Chaussures
    "bags",      // Sacs
    "jewelry",   // Bijoux
    "other"      // Autres
  ]).notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  previewImageUrl: varchar("previewImageUrl", { length: 512 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileSize: int("fileSize"),
  fileType: varchar("fileType", { length: 50 }),
  downloads: int("downloads").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
  reviewCount: int("reviewCount").default(0).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  salePrice: decimal("salePrice", { precision: 8, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product variants - taille, couleur, stock (référence par variante)
 */
export const productVariants = mysqlTable("productVariants", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  sku: varchar("sku", { length: 64 }).notNull(),
  size: varchar("size", { length: 32 }),
  color: varchar("color", { length: 64 }),
  stock: int("stock").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = typeof productVariants.$inferInsert;

/**
 * Product images - galerie (plusieurs images par produit)
 */
export const productImages = mysqlTable("productImages", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProductImage = typeof productImages.$inferSelect;
export type InsertProductImage = typeof productImages.$inferInsert;

/**
 * Cart items table - user shopping carts
 */
export const cartItems = mysqlTable("cartItems", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  variantId: int("variantId"),
  quantity: int("quantity").default(1).notNull(),
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table - completed purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).unique(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "completed", "failed", "refunded", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  shippingAddress: text("shippingAddress"),
  shippingPhone: varchar("shippingPhone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table - individual products in an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  creatorId: int("creatorId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  downloadedAt: timestamp("downloadedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Reviews table - product reviews from buyers
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/** Types de page pour le ciblage des bannières */
export const bannerPageTypeEnum = ["home", "category", "subcategory", "filter", "promotion"] as const;
export type BannerPageType = (typeof bannerPageTypeEnum)[number];

/** Statut d'affichage (active = visible, inactive = masquée) */
export const bannerStatusEnum = ["active", "inactive"] as const;
export type BannerStatus = (typeof bannerStatusEnum)[number];

/**
 * Banners table - système centralisé (accueil, catégories, filtres, promotions)
 */
export const banners = mysqlTable("banners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  buttonText: varchar("buttonText", { length: 128 }),
  buttonLink: varchar("buttonLink", { length: 512 }),
  /** @deprecated Utiliser buttonLink */
  linkUrl: varchar("linkUrl", { length: 512 }),
  pageType: mysqlEnum("pageType", bannerPageTypeEnum).default("home").notNull(),
  pageIdentifier: varchar("pageIdentifier", { length: 128 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  status: mysqlEnum("status", bannerStatusEnum).default("active").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Banner images - plusieurs photos par bannière (carousel)
 */
export const bannerImages = mysqlTable("bannerImages", {
  id: int("id").autoincrement().primaryKey(),
  bannerId: int("bannerId").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BannerImage = typeof bannerImages.$inferSelect;
export type InsertBannerImage = typeof bannerImages.$inferInsert;

/**
 * Site settings - key/value (site name, contact email, etc.)
 */
export const siteSettings = mysqlTable("siteSettings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
