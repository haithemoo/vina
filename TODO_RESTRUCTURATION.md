# Plan de restructuration VINA - Front Office & Back Office

## Objectif
Séparer clairement le Front Office (client) du Back Office (admin) avec un Backend partagé.

## Structure cible

```
vina/
├── client/                    # Front Office (Interface client)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Page d'accueil
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Auth.tsx
│   │   │   ├── OrderHistory.tsx
│   │   │   └── CreatorProfile.tsx
│   │   └── ...
│   └── index.html
│
├── admin/                     # Back Office (Interface admin)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx  # Statistiques
│   │   │   ├── Products.tsx   # Gestion produits
│   │   │   ├── Orders.tsx     # Gestion commandes
│   │   │   ├── Users.tsx      # Gestion utilisateurs
│   │   │   ├── Banners.tsx   # Gestion bannières
│   │   │   └── Settings.tsx   # Paramètres
│   │   └── ...
│   └── index.html
│
├── server/                    # Backend API (Express + tRPC)
│   ├── _core/
│   │   ├── index.ts
│   │   ├── context.ts
│   │   └── ...
│   ├── routers/
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── users.ts
│   │   ├── banners.ts
│   │   └── ...
│   └── db.ts
│
└── shared/                    # Code partagé
    └── const.ts
```

## Étapes d'implémentation

### Étape 1: Créer le dossier admin et configuration
- Créer admin/index.html
- Configurer Vite pour admin
- Créer la structure de base

### Étape 2: Créer les pages du Back Office
- Dashboard (statistiques)
- Products (CRUD + filtres: nouveautés, soldes)
- Orders (gestion commandes)
- Users (gestion utilisateurs)
- Banners (gestion bannières homepage)

### Étape 3: Mettre à jour le Backend
- Ajouter router pour banners
- Ajouter endpoints admin nécessaires
- Séparer les routers frontend/admin

### Étape 4: Configuration de build et déploiement
- Mettre à jour package.json
- Configurer render.yaml

## Statut: EN ATTENTE DE CONFIRMATION

