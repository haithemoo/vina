-- Banners (bannières page d'accueil)
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int AUTO_INCREMENT NOT NULL,
  `title` varchar(255) NOT NULL,
  `imageUrl` varchar(512) NOT NULL,
  `linkUrl` varchar(512),
  `sortOrder` int DEFAULT 0 NOT NULL,
  `isActive` boolean DEFAULT true NOT NULL,
  `createdAt` timestamp DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  `updatedAt` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `banners_id` PRIMARY KEY(`id`)
);

-- Paramètres du site (clé-valeur)
CREATE TABLE IF NOT EXISTS `siteSettings` (
  `key` varchar(64) NOT NULL,
  `value` text,
  `updatedAt` timestamp DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `siteSettings_key` PRIMARY KEY(`key`)
);
