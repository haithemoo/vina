# Plan de mise à jour - Respect de la charte graphique VINA

## Analyse de la charte graphique VINA

### Couleurs principales (Beige, Taupe, Gris-vert)
- **Primary**: #8c8070 (Taupe)
- **Primary Foreground**: #f5f2ee (Beige clair)
- **Background**: oklch(0.97 0.003 65) (Beige très clair)
- **Foreground**: oklch(0.35 0.02 65) (Taupe foncé)
- **Secondary**: #b4aa9b (Gris-vert)
- **Accent**: #8c8070 (Taupe)
- **Border**: #c8bfb0 (Beige gris)

### Polices
- **Titres**: Playfair Display
- **Corps**: Lato

## Modifications à effectuer

### 1. Mise à jour du menu principal (comme mabrouk.tn)
**Fichier**: `client/src/pages/Home.tsx`

Structure du menu :
- **Homme** (sous-catégories: Pantalons, T-shirts, Chemises, Vestes, Costumes)
- **Femme** (sous-catégories: Robes, Tops, Pantalons, Jupes, Manteaux)
- **Accessoires** (sous-catégories: Sacs, Ceintures, Écharpes, Bijoux)
- **Soldes**

### 2. Créer page Connexion/Inscription
**Fichier**: `client/src/pages/Auth.tsx`

- Formulaire de connexion (email, mot de passe)
- Formulaire d'inscription (nom, email, mot de passe)
- Design cohérent avec la charte graphique

### 3. Mettre à jour les routes
**Fichier**: `client/src/App.tsx`

- Ajouter route `/login` et `/register`

### 4. Mettre à jour les couleurs dans Home.tsx
- Remplacer toutes les couleurs emerald par la palette VINA
- Utiliser les variables CSS existantes

### 5. Ajouter la page de connexion dans le header
- Modifier le header pour inclure le lien vers /login

## Étapes de mise en oeuvre

1. [ ] Refaire le menu avec structure mabrouk.tn (Homme, Femme, Accessoires, Soldes)
2. [ ] Créer page Auth.tsx avec connexion et inscription
3. [ ] Ajouter routes dans App.tsx
4. [ ] Mettre à jour les couleurs vers la palette VINA
5. [ ] Ajouter lien connexion dans le header

