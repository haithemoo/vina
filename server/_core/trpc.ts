import { UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

const ADMIN_ROLES = ["admin", "stock", "sales", "purchase", "designer"] as const;
const BANNER_WRITE_ROLES = ["admin", "designer"] as const;

// Accès back office : admin (tout), stock (stock), sales (commandes), purchase (stock+produits), designer (bannières+produits)
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Connexion requise." });
    }
    const role = ctx.user.role as string;
    if (!ADMIN_ROLES.includes(role as any)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé au back office." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);

// Modification des bannières : réservé à Administrateur et Designer graphique (lecture pour les autres rôles admin)
export const bannerWriteProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Connexion requise." });
    }
    const role = ctx.user.role as string;
    if (!ADMIN_ROLES.includes(role as any)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Accès back office requis." });
    }
    if (!BANNER_WRITE_ROLES.includes(role as any)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Seuls Administrateur et Designer peuvent modifier les bannières." });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  }),
);
