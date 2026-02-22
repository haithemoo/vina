-- Plusieurs photos par bannière (carousel page d'accueil)
CREATE TABLE IF NOT EXISTS `bannerImages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `bannerId` int NOT NULL,
  `imageUrl` varchar(512) NOT NULL,
  `sortOrder` int DEFAULT 0 NOT NULL,
  `createdAt` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  CONSTRAINT `bannerImages_id` PRIMARY KEY(`id`)
);
