-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: ezchefdb
-- ------------------------------------------------------
-- Server version    8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Create database (added at top)
CREATE DATABASE IF NOT EXISTS ezchefdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ezchefdb;

--
-- Original table definitions continue below...
-- [Keep all existing table definitions from your original file]
--

--
-- Table structure for table `recipe`
--
DROP TABLE IF EXISTS `recipe`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe` (
  `recipe_id` int NOT NULL AUTO_INCREMENT,
  `recipe_name` varchar(50) NOT NULL,
  `recipe_description` text NOT NULL,
  `date_added` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recipe_difficulty` tinyint unsigned DEFAULT NULL,
  PRIMARY KEY (`recipe_id`),
  CONSTRAINT `chk_diff` CHECK ((`recipe_difficulty` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- MODIFIED: Date change and category FK (added after recipe table creation)
ALTER TABLE recipe
MODIFY COLUMN date_added DATE null
COMMENT 'only stores the date (time truncated)';

ALTER TABLE recipe
ADD COLUMN category_id int null,
ADD CONSTRAINT fk_recipe_category
FOREIGN KEY (category_id)
REFERENCES category(category_id)
ON UPDATE no action
ON DELETE no action;

--
-- Table structure for table `identified_by`
--
DROP TABLE IF EXISTS `identified_by`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `identified_by` (
  `ib_r_id` int DEFAULT NULL,
  `ib_c_id` int DEFAULT NULL,
  KEY `ib_r_id` (`ib_r_id`),
  KEY `ib_c_id` (`ib_c_id`),
  CONSTRAINT `identified_by_ibfk_1` FOREIGN KEY (`ib_r_id`) REFERENCES `recipe` (`recipe_id`),
  CONSTRAINT `identified_by_ibfk_2` FOREIGN KEY (`ib_c_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- MODIFIED: Add primary key and unique constraint (added after identified_by table creation)
ALTER TABLE identified_by
ADD COLUMN id int not null auto_increment primary key first,
ADD CONSTRAINT uq_identified_by unique (ib_r_id, ib_c_id);

--
-- [Keep all remaining original table definitions and data]
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
