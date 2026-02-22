# Compte administrateur principal (back office VINA)

Au premier démarrage du serveur, un compte administrateur est créé automatiquement **s'il n'existe encore aucun admin** en base.

## Identifiants par défaut

| Champ      | Valeur                  |
|-----------|--------------------------|
| **Email** | `admin@vina.com`         |
| **Mot de passe** | `AdminVina2025!` |

## Connexion

1. Ouvrir le site : `http://localhost:3000/login` (ou votre URL).
2. Pour accéder au back office directement après connexion : `http://localhost:3000/login?redirect=%2Fadmin`
3. Se connecter avec l’email et le mot de passe ci-dessus.
4. Vous serez redirigé vers le tableau de bord admin (`/admin`).

## Personnaliser (optionnel)

Vous pouvez définir d’autres identifiants au premier lancement via des variables d’environnement :

- `ADMIN_INITIAL_EMAIL` – email du compte admin (défaut : `admin@vina.com`)
- `ADMIN_INITIAL_PASSWORD` – mot de passe (défaut : `AdminVina2025!`)
- `ADMIN_INITIAL_NAME` – nom affiché (défaut : `Administrateur principal`)

Exemple dans `.env` :

```
ADMIN_INITIAL_EMAIL=monemail@example.com
ADMIN_INITIAL_PASSWORD=MonMotDePasseSecret
```

**Important :** le compte n’est créé qu’une seule fois (lorsqu’il n’y a aucun utilisateur avec le rôle `admin`). Pour changer le mot de passe ensuite, utilisez la gestion des utilisateurs dans le back office (si une fonction de modification est disponible) ou la base de données.

## Sous-comptes back office

L’administrateur principal peut créer d’autres comptes (avec le rôle **admin** ou **user**) depuis le back office : **Utilisateurs** → **Créer un compte**.
