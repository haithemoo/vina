#!/usr/bin/env node
/**
 * Réinitialise les données de test (produits, variantes, commandes, lignes de commande).
 * Après exécution, redémarrez le serveur : les 38 produits et 8 commandes de test seront recréés au démarrage.
 *
 * Usage: node scripts/seed-reset.mjs
 * (charge .env depuis la racine du projet)
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant. Définissez-la dans .env à la racine du projet.");
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
    const tables = ["orderItems", "orders", "productVariants", "productImages", "products"];
    for (const table of tables) {
      try {
        await conn.execute(`DELETE FROM \`${table}\``);
        const [r] = await conn.execute("SELECT ROW_COUNT() as n");
        const n = r[0]?.n ?? 0;
        console.log(`  ${table}: ${n} ligne(s) supprimée(s).`);
      } catch (e) {
        if (e.message?.includes("doesn't exist") || e.message?.includes("Unknown table")) {
          console.log(`  ${table}: table absente (ignorée).`);
        } else {
          throw e;
        }
      }
    }
    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("\nDonnées de test supprimées. Redémarrez le serveur (npm run dev) pour recréer les 38 produits et 8 commandes.");
  } catch (e) {
    console.error("Erreur:", e.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
