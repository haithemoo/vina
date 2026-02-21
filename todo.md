# TODO - Corrections des problèmes identifiés

## Étape 1: server/routers.ts
- [x] Ajouter cookie de session JWT dans auth.login
- [x] Ajouter cookie de session JWT dans auth.register
- [x] Corriger les catégories dans products.create, products.update, products.getByCategory

## Étape 2: server/db.ts
- [x] Corriger createUser pour retourner l'utilisateur créé (fetch après insert)

## Étape 3: client/src/pages/Auth.tsx
- [x] Remplacer Firebase par tRPC (trpc.auth.login, trpc.auth.register)
- [x] Passer registerName dans la mutation register
- [x] Supprimer les imports Firebase inutilisés
- [x] Supprimer/corriger le lien "Mot de passe oublié" (route inexistante)
- [x] Supprimer les boutons Google (non supportés par le backend tRPC)

## Étape 4: client/src/pages/ProductDetail.tsx
- [x] Corriger la devise: $ → DT
- [x] Corriger les labels de catégories (shirts/pants → women/men/children/...)

## Étape 5: client/src/pages/Cart.tsx
- [x] Corriger la devise: $ → DT (prix article, sous-total, frais, total)
- [x] Corriger la navigation: window.location.href → setLocation (wouter)

---

## Résumé des changements

### server/db.ts
- `createUser`: remplace `return result` (résultat MySQL brut) par un `SELECT` après l'`INSERT` pour retourner l'objet utilisateur complet.

### server/routers.ts
- Ajout des imports `ONE_YEAR_MS` (depuis `@shared/const`) et `sdk` (depuis `./_core/sdk`)
- `auth.login`: ajout de `ctx` dans les paramètres, création du token JWT via `sdk.createSessionToken()`, pose du cookie via `ctx.res.cookie(COOKIE_NAME, token, {...cookieOptions, maxAge: ONE_YEAR_MS})`
- `auth.register`: idem + vérification que `user` n'est pas `undefined` avant de créer le token
- `products.getByCategory`, `products.create`, `products.update`: enum catégories corrigé → `["women","men","children","dresses","suits","sportswear","accessories","shoes","bags","jewelry","other"]`

### client/src/pages/Auth.tsx
- Suppression des imports Firebase (`signInWithPopup`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `auth`, `googleProvider`)
- Ajout de `trpc` et `trpc.useUtils()`
- Remplacement des handlers Firebase par `trpc.auth.login.useMutation()` et `trpc.auth.register.useMutation()`
- `registerName` correctement passé dans `registerMutation.mutate({ name: registerName, ... })`
- Invalidation de `auth.me` après succès + redirection via `setLocation`
- Suppression des boutons "Continuer avec Google" et "S'inscrire avec Google"
- Lien `/forgot-password` remplacé par un `toast.info()`
- Ajout de `activeTab` state pour contrôler les onglets (remplace le `document.querySelector().click()` cassé)

### client/src/pages/ProductDetail.tsx
- `${product.price}` → `{product.price} DT`
- Labels catégories mis à jour: `shirts/pants` → `women/men/children/dresses/suits/sportswear/accessories/shoes/bags/jewelry/other`

### client/src/pages/Cart.tsx
- `${item.product?.price}` → `{item.product?.price} DT`
- `${total.toFixed(2)}` → `{total.toFixed(2)} DT` (sous-total, frais, total)
- `$0.00` → `0.00 DT`
- `window.location.href = "/checkout"` → `setLocation("/checkout")` (import `useLocation` depuis wouter)
