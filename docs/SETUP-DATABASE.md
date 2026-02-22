# Configurer la base de données MySQL (installation manuelle)

Après avoir installé MySQL (installeur .dmg ou autre), suivez ces étapes.

## 1. Démarrer MySQL

- **Préférences Système** → **MySQL** → **Start MySQL Server**  
  ou en terminal :
  ```bash
  sudo /usr/local/mysql/support-files/mysql.server start
  ```

## 2. Créer la base et un utilisateur (optionnel)

Ouvrez le client MySQL (Terminal ou MySQL Workbench) :

```bash
# Connexion en root (mot de passe demandé à l’installation)
/usr/local/mysql/bin/mysql -u root -p
```

Puis dans MySQL :

```sql
-- Créer la base pour le projet
CREATE DATABASE IF NOT EXISTS vina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- (Optionnel) Créer un utilisateur dédié
CREATE USER IF NOT EXISTS 'vina'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON vina.* TO 'vina'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

Si vous gardez **root**, vous n’avez pas besoin de créer un autre utilisateur.

## 3. Fichier `.env` à la racine du projet

Créez ou modifiez `.env` (copiez depuis `.env.example` si besoin) :

```env
# Remplacez root / password par votre utilisateur et mot de passe MySQL
# Remplacez vina par le nom de la base si vous en avez créé une autre
DATABASE_URL=mysql://root:votre_mot_de_passe@localhost:3306/vina

JWT_SECRET=un-secret-long-et-aleatoire
APP_URL=http://localhost:3000
```

Format : `mysql://UTILISATEUR:MOT_DE_PASSE@localhost:3306/NOM_DE_LA_BASE`

## 4. Créer les tables (migrations)

À la racine du projet :

```bash
npm run db:push
```

Cela crée les tables (users, products, orders, banners, bannerImages, etc.) dans la base.

Migrations SQL manuelles (dans l’ordre) : `0000_*`, `0001_*`, `0002_*` (banners/siteSettings), `0003_*` (productVariants/productImages), `0004_*` (passwordHash), `0005_*` (rôles admin), `0006_*` (bannerImages), `0007_banner_management.sql` (bannières avancées : pageType, pageIdentifier, dates, statut).

## 5. Données de test (produits et commandes)

Au **premier démarrage** du serveur, les produits et commandes de test sont créés automatiquement **si la table `products` est vide**.

Pour tout réinitialiser et recréer les données de test :

```bash
npm run db:seed-reset
npm run dev
```

## Vérifier que tout fonctionne

- Le serveur affiche par exemple :  
  `[Database] Produits de test créés (38).`  
  `[Database] Commandes de test créées (8).`
- Sur le site : produits visibles par catégorie.
- En admin : **Commandes** avec des exemples.

Si vous voyez `ECONNREFUSED` ou "DATABASE_URL manquant", vérifiez que MySQL tourne et que `.env` contient bien `DATABASE_URL`.
