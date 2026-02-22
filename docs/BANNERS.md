# Gestion des bannières (Marketing)

Système centralisé de bannières pour la page d'accueil, les catégories et les filtres. Aucune modification de code nécessaire pour mettre à jour les visuels.

## Accès Back Office

- **Modification (créer / modifier / supprimer)** : rôles **Administrateur** et **Designer graphique** uniquement.
- **Lecture** : tout rôle ayant accès au back office peut voir la liste des bannières.

Menu : **Bannières** (section Marketing). Chemin : `/admin/banners`.

## Utilisation rapide

1. Aller dans **Admin → Bannières**.
2. **Nouvelle bannière** : titre, image (upload ou URL), optionnellement sous-titre, description, bouton (texte + lien).
3. **Type de page** : Accueil, Catégorie, Sous-catégorie, Filtre, Promotion.
4. **Page (identifiant)** : pour une catégorie, choisir l’identifiant (ex. `women`, `men`, `shoes`) ou laisser « Par défaut » pour toutes les pages de ce type.
5. **Ordre d’affichage** : nombre (plus petit = affiché en premier).
6. **Début / Fin** : dates optionnelles d’activation ; au-delà de la date de fin, la bannière n’est plus affichée.
7. **Statut** : Actif / Inactif.

## Comportement côté site

- **Page d’accueil** : slider des bannières de type « Page d’accueil », rotation automatique (4 s), flèches et points de navigation, lazy loading des images.
- **Pages catégories** (ex. Femme, Homme, Chaussures) : chargement des bannières associées à la catégorie ; si plusieurs → mini-slider ; si aucune → bannière par défaut (bandeau avec nom de la catégorie).

## Migration base de données

Pour activer le système avancé (types de page, dates, etc.), exécuter la migration :

```bash
# Si vous utilisez les migrations manuelles
mysql -u root -p vina < drizzle/0007_banner_management.sql
```

Ou via `npm run db:push` si Drizzle gère les migrations.

## Règles métier

- Une page peut avoir **plusieurs bannières** (affichage en slider).
- Une bannière est liée à **une seule page** (type + identifiant).
- Si **aucune bannière active** pour une page → affichage du **fallback** (bandeau par défaut).
- Si la **date de fin est dépassée** → la bannière n’est plus affichée (désactivation automatique à l’affichage).
