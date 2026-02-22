# Déploiement Vina (Render, Railway, Fly.io, etc.)

## Prérequis

- **Racine du projet** : la commande de build et la commande de start doivent être exécutées **depuis la racine du dépôt** (là où se trouvent `package.json`, `client/`, `server/`, `admin/`).
- **Root Directory** : sur la plateforme, laisser **vide** (ou `.`) pour que la racine soit bien le dépôt.
- **Pas de répertoire statique** : ne pas configurer de « Publish Directory » / « Static Web » pointant vers `dist`. Seul le **serveur Node** doit tourner ; c’est lui qui sert le client depuis `dist/public`. Si la plateforme sert `dist/` en statique, le fichier `dist/index.js` (code serveur) peut s’afficher dans le navigateur à la place du site.

## Build

Le build produit :

- `dist/public/` — front (client)
- `dist/admin/` — back office
- `dist/index.js` — serveur Node

Commandes à utiliser :

- **pnpm** : `pnpm install && pnpm run build`
- **npm** : `npm install && npm run build`

## Start

- **pnpm** : `pnpm run start`
- **npm** : `npm run start`

Le serveur lit le port via **PORT** (défini automatiquement par Render/Railway/Fly).

## Variables d’environnement

À configurer sur la plateforme :

| Variable          | Obligatoire | Description                    |
|-------------------|-------------|--------------------------------|
| `NODE_ENV`        | oui         | `production`                   |
| `PORT`            | auto        | Généralement défini par l’hébergeur |
| `DATABASE_URL`    | oui         | URL MySQL (ex. PlanetScale, Render MySQL) |
| `JWT_SECRET`      | oui         | Secret pour les sessions       |
| `OAUTH_SERVER_URL`| selon usage | URL du serveur OAuth si utilisé |
| `APP_URL`         | recommandé  | URL publique du site (ex. `https://vina-1.onrender.com`) |

## Render.com

1. Créer un **Web Service**, branche sur ton dépôt.
2. **Build Command** : `pnpm install && pnpm run build`
3. **Start Command** : `pnpm run start`
4. **Root Directory** : laisser **vide**.
5. Dans **Environment** : ajouter `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `APP_URL` (et les autres si besoin).
6. Déployer.

Si le dépôt contient un `render.yaml`, Render peut appliquer ces réglages automatiquement.

## En cas de problème

- **503 « Site en cours de déploiement »** : le build n’a pas créé `dist/public`. Vérifier que la commande de build s’exécute bien et que le Root Directory est la racine du dépôt.
- **Not Found** sur les routes (/, /produits, etc.) : normalement corrigé par le fallback SPA. Redéployer avec la dernière version du code.
- **Erreur base de données** : vérifier `DATABASE_URL` et que la BDD accepte les connexions depuis l’IP de l’hébergeur.
