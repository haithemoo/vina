-- Rôles back office : stock (stock uniquement), sales (commandes), purchase (stock + produits), designer (bannières + produits)
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','creator','stock','sales','purchase','designer') NOT NULL DEFAULT 'user';
