-- Add passwordHash to users (login by email/password)
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) NULL;
