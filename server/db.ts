import { eq, desc, and, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, creators, products, cartItems, orders, orderItems, reviews } from "../drizzle/schema";
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
  const result = await db.insert(creators).values({
    userId,
    displayName,
  });
  return result;
}

// Cart queries
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

export async function addToCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(cartItems).values({ userId, productId });
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
  return result.length > 0 ? result[0] : undefined;
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
