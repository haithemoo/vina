-- Commandes : statuts étendus (Confirmée, Expédiée, Annulée) + adresse et téléphone livraison
ALTER TABLE `orders`
  MODIFY COLUMN `status` enum('pending','confirmed','shipped','completed','failed','refunded','cancelled') DEFAULT 'pending' NOT NULL,
  ADD COLUMN `shippingAddress` text DEFAULT NULL,
  ADD COLUMN `shippingPhone` varchar(32) DEFAULT NULL;
