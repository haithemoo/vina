# Plan de refonte du frontend - Style mabrouk.tn

## Analyse du projet actuel

### Structure existante
- **Projet**: VINA - Plateforme e-commerce pour produits numériques (vêtements, accessoires)
- **Technologies**: React, TypeScript, TailwindCSS, tRPC, Drizzle ORM, MySQL
- **Page actuelle**: Home.tsx avec catégories basiques et grille de produits

### Fichiers clés identifiés
- `client/src/pages/Home.tsx` - Page principale à modifier
- `drizzle/schema.ts` - Schéma de base de données (catégories: shirts, pants, accessories, shoes)
- `shared/const.ts` - Constantes partagées
- `client/src/components/` - Composants UI réutilisables

## Plan de refonte

### 1. Mise à jour des catégories de produits
**Fichier**: `drizzle/schema.ts`
- Ajouter de nouvelles catégories pour correspondre à un site de mode complet
- Catégories suggérées: Robes, Costumes, Sport, Enfants, Accessoires, Chaussures

### 2. Refonte de la page d'accueil Home.tsx
**Fichier**: `client/src/pages/Home.tsx`

Structure proposée style mabrouk.tn:
- **Navigation principale**: Barre de navigation avec logo, recherche, panier, compte
- **Hero Section**: Bannière promotionnelle avec CTA
- **Onglets de catégories**: Navigation par onglets horizontaux (Femmes, Hommes, Enfants, Accessoires, etc.)
- **Sections de produits**: Grilles de produits par catégorie avec:
  - Images de qualité
  - Prix et promotions
  - Badges "Nouveau", "Soldes"
  - Filtres latéraux
- **Bandeau promotions**: Offres speciales
- **Footer**: Liens utiles, newsletter, réseaux sociaux

### 3. Amélioration des composants
- Créer des composants pour les cartes produits améliorées
- Ajouter des animations et transitions
- Optimiser le responsive design

### 4. Ajout de données de démonstration
- Ajouter des produits d'exemple dans chaque catégorie
- Préparer des images placeholder de qualité

## Étapes de mise en oeuvre

1. [ ] Mettre à jour le schéma avec nouvelles catégories
2. [ ] Refondre la structure Home.tsx avec nouveaux onglets
3. [ ] Créer des composants produit améliorés
4. [ ] Ajouter des sections promotionnelles
5. [ ] Tester et optimiser le responsive

