import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("should list products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.list({ limit: 10, offset: 0 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should search products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.search({
      query: "sticker",
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get featured products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getFeatured({ limit: 8 });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter products by category", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.products.getByCategory({
      category: "stickers",
      limit: 10,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("creators router", () => {
  it("should get featured creators", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.creators.getFeatured({ limit: 6 });

    expect(Array.isArray(result)).toBe(true);
  });
});
