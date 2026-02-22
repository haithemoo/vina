-- Référence produit et prix soldes (exécuter une seule fois ; si les colonnes existent, ignorer les erreurs)
ALTER TABLE `products` ADD COLUMN `reference` varchar(64) NULL;
ALTER TABLE `products` ADD COLUMN `salePrice` decimal(8,2) NULL;

-- Variantes produit (taille, couleur, stock, SKU)
CREATE TABLE IF NOT EXISTS `productVariants` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `sku` varchar(64) NOT NULL,
  `size` varchar(32),
  `color` varchar(64),
  `stock` int DEFAULT 0 NOT NULL,
  `createdAt` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updatedAt` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `productVariants_id` PRIMARY KEY(`id`),
  CONSTRAINT `productVariants_productId` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Galerie images produit
CREATE TABLE IF NOT EXISTS `productImages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `productId` int NOT NULL,
  `imageUrl` varchar(512) NOT NULL,
  `sortOrder` int DEFAULT 0 NOT NULL,
  `createdAt` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  CONSTRAINT `productImages_id` PRIMARY KEY(`id`),
  CONSTRAINT `productImages_productId` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Panier: variante et quantité
ALTER TABLE `cartItems` ADD COLUMN `variantId` int NULL;
ALTER TABLE `cartItems` ADD COLUMN `quantity` int DEFAULT 1 NOT NULL;
