# Réinitialiser les données de test (produits et commandes)

Si **rien ne change** après les mises à jour (38 produits par catégorie, 8 commandes, catégories / soldes sur le front), c’est parce que le seed ne s’exécute que lorsque la table `products` est **vide**.

## Étapes

1. **Vérifier que MySQL tourne** et que ton fichier **`.env`** à la racine contient bien **`DATABASE_URL`** (ex. `mysql://user:pass@localhost:3306/vina`).

2. **Réinitialiser les données de test** (supprime produits, variantes, commandes et lignes de commande) :
   ```bash
   npm run db:seed-reset
   ```

3. **Redémarrer le serveur** :
   ```bash
   npm run dev
   ```
   Au démarrage, le serveur recrée automatiquement les 38 produits de test et les 8 commandes.

4. **Rafraîchir le site** (front office) et l’**admin** : tu devrais voir les produits par catégorie, le filtre Soldes, et les commandes dans Back office → Commandes.

---

En cas d’erreur `ECONNREFUSED` sur `npm run db:seed-reset`, MySQL n’est pas joignable : démarre MySQL ou corrige `DATABASE_URL` dans `.env`.
