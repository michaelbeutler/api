export const queries: string[] = [
  "CREATE DATABASE IF NOT EXISTS `dev`",
  "CREATE TABLE IF NOT EXISTS `dev`.`todos` (  `id` INT NOT NULL AUTO_INCREMENT,  `text` VARCHAR(45) NOT NULL,  `done` TINYINT NOT NULL DEFAULT '0',  PRIMARY KEY (`id`));",
];
