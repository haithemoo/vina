#!/usr/bin/env node
/**
 * Ajoute la colonne passwordHash à la table users (connexion email/mot de passe).
 * À lancer une fois si la connexion échoue avec "Unknown column 'passwordHash'".
 *
 * Usage: node scripts/add-password-hash-column.mjs
 * (charge .env depuis la racine du projet si présent)
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant. Définissez-la ou ajoutez un fichier .env à la racine.");
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    await conn.execute("ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) NULL");
    console.log("Colonne users.passwordHash ajoutée avec succès.");
  } catch (e) {
    if (e.message?.includes("Duplicate column") || e.message?.includes("already exists")) {
      console.log("La colonne passwordHash existe déjà.");
      process.exit(0);
    }
    console.error("Erreur:", e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
