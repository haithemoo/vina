# Guide de déploiement gratuit - Vina

Ce guide explique comment déployer votre application Vina gratuitement pour que votre client puisse tester le site.

## Services recommandés (gratuits)

### Option 1: Render + PlanetScale (Recommandé)

| Service | Plan Gratuit | Usage |
|---------|--------------|-------|
| [Render](https://render.com) | ✓ Gratuit | Hébergement du serveur Node.js |
| [PlanetScale](https://planetscale.com) | ✓ Gratuit | Base de données MySQL |

---

## Étape 0: Prérequis - Compte GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Créez un nouveau dépôt (New Repository)
3. Nommez-le `vina` (ou autre)
4. **Ne cochez pas** "Initialize with README"
5. Cliquez "Create repository"

---

## Étape 1: Connecter le projet à GitHub

Dans votre terminal, à la racine du projet:

```bash
# Ajouter le remote GitHub (remplacez par votre username)
git remote add origin https://github.com/VOTRE_USERNAME/vina.git

# Pousser le code
git add .
git commit -m "Initial deployment"
git branch -M main
git push -u origin main
```

---

## Étape 2: Créer une base de données (PlanetScale)

1. Allez sur [planetscale.com](https://planetscale.com) et cliquez "Sign Up"
2. Connectez-vous avec GitHub
3. Créez une nouvelle base de données:
   - Name: `vina`
   - Region: `eu (Paris)` ou autre proche de vous
4. Cliquez sur "Branches" → "main" → "Connect"
5. Cliquez "Prisma" et copiez la chaîne de connexion
   - Elle ressemble à: `mysql://username:password@aws.connect.psdb.cloud/vina?sslaccept=strict`

---

## Étape 3: Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet:

```bash
# Base de données (collez votre chaîne PlanetScale)
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/vina?sslaccept=strict"

# Secret JWT (générez avec: openssl rand -base64 32)
JWT_SECRET="votre-secret-tres-long-et-aleatoire-ici"

# Configuration
NODE_ENV=production
PORT=3000

# URL de votre application (remplacez par votre URL Render après déploiement)
APP_URL="https://vina-votre-nom.onrender.com"
```

---

## Étape 4: Déployer sur Render

1. Allez sur [render.com](https://render.com) et cliquez "Sign Up"
2. Connectez-vous avec GitHub
3. Cliquez "New +" → "Web Service"
4. Sélectionnez votre dépôt `vina`
5. Configurez:
   - **Name**: `vina`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
6. Cliquez "Advanced"
7. Dans "Environment Variables", ajoutez:
   - `DATABASE_URL` = votre chaîne PlanetScale
   - `JWT_SECRET` = votre secret
   - `NODE_ENV` = `production`
   - `PORT` = `3000`
   - `APP_URL` = URL que Render vous donnera (vous pouvez ajouter après)
8. Cliquez "Create Web Service"

---

## Étape 5: Attendre le déploiement

- Le déploiement prend ~5-10 minutes
- Une fois terminé, vous aurez une URL comme: `https://vina-xxxx.onrender.com`

---

## Étape 6: Créer les tables de base de données

Après le déploiement, allez dans:
1. Render → Votre service → "Shell"
2. Tapez: `pnpm db:push`
3. Appuyez sur Entrée

---

## Résumé des variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne de connexion MySQL (PlanetScale) |
| `JWT_SECRET` | Secret aléatoire pour les cookies |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `APP_URL` | URL de votre application Render |

---

## Commandes utiles

```bash
# Développement local
pnpm dev

# Build pour production
pnpm build

# Démarrer en production
pnpm start

# Mettre à jour la base de données
pnpm db:push
```

