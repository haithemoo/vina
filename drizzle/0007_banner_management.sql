-- Système avancé de gestion des bannières (page_type, page_identifier, dates, statut)
-- À exécuter une seule fois. Si les colonnes existent déjà, ignorer les erreurs ou exécuter les ALTER un par un.

ALTER TABLE `banners`
  ADD COLUMN `subtitle` varchar(255) DEFAULT NULL,
  ADD COLUMN `description` text DEFAULT NULL,
  ADD COLUMN `buttonText` varchar(128) DEFAULT NULL,
  ADD COLUMN `buttonLink` varchar(512) DEFAULT NULL,
  ADD COLUMN `pageType` enum('home','category','subcategory','filter','promotion') DEFAULT 'home' NOT NULL,
  ADD COLUMN `pageIdentifier` varchar(128) DEFAULT NULL,
  ADD COLUMN `startDate` date DEFAULT NULL,
  ADD COLUMN `endDate` date DEFAULT NULL,
  ADD COLUMN `status` enum('active','inactive') DEFAULT 'active' NOT NULL;
