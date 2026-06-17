-- MySQL dump 10.13  Distrib 8.0.46, for Linux (aarch64)
--
-- Host: localhost    Database: plsp_db
-- ------------------------------------------------------
-- Server version	8.0.46

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

--
-- Table structure for table `answers`
--

DROP TABLE IF EXISTS `answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `answers` (
  `id` varchar(36) NOT NULL,
  `selected_value` int NOT NULL,
  `submission_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_0d1b656c68dd42b88b5e264e95b` (`submission_id`),
  KEY `FK_677120094cf6d3f12df0b9dc5d3` (`question_id`),
  CONSTRAINT `FK_0d1b656c68dd42b88b5e264e95b` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_677120094cf6d3f12df0b9dc5d3` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `audit-log`
--

DROP TABLE IF EXISTS `audit-log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit-log` (
  `id` varchar(36) NOT NULL,
  `employee_id` int NOT NULL,
  `action` enum('CREATE','UPDATE','DELETE','EXPORT','OPEN','CLOSE','GENERATE','PERMISSION_CHANGE') NOT NULL,
  `module` enum('EMPLOYEE','QUESTIONNAIRE','QUESTION','CATEGORY','STATUS','CLASSIFICATION_RULE','SUBMISSION','RESULT') NOT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `details` json DEFAULT NULL,
  `status` enum('SUCCESS','FAILED') NOT NULL DEFAULT 'SUCCESS',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `timestamp` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `FK_343ec3171f5f3d01ed11b40bdc9` (`employee_id`),
  CONSTRAINT `FK_343ec3171f5f3d01ed11b40bdc9` FOREIGN KEY (`employee_id`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_23c05c292c439d77b0de816b50` (`name`),
  KEY `FK_68c078584a67703b28a510583de` (`created_by`),
  KEY `FK_997af3ae726489a7e5f20087f63` (`updated_by`),
  KEY `FK_0833d95e7bfb19a9d6fe66dac2e` (`deleted_by`),
  CONSTRAINT `FK_0833d95e7bfb19a9d6fe66dac2e` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_68c078584a67703b28a510583de` FOREIGN KEY (`created_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_997af3ae726489a7e5f20087f63` FOREIGN KEY (`updated_by`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `classification_rules`
--

DROP TABLE IF EXISTS `classification_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classification_rules` (
  `id` varchar(36) NOT NULL,
  `label` varchar(50) NOT NULL,
  `min_score` int NOT NULL,
  `max_score` int NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `category_id` varchar(36) NOT NULL,
  `created_by` int NOT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e7e6c2812e229613ce92e91763a` (`category_id`),
  KEY `FK_d555771449158ee36c067b3d9c1` (`created_by`),
  KEY `FK_34d80191bde9fd84bfc5556638a` (`updated_by`),
  KEY `FK_55ca8b924e39a1bfd5530951990` (`deleted_by`),
  CONSTRAINT `FK_34d80191bde9fd84bfc5556638a` FOREIGN KEY (`updated_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_55ca8b924e39a1bfd5530951990` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_d555771449158ee36c067b3d9c1` FOREIGN KEY (`created_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_e7e6c2812e229613ce92e91763a` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employee_uuid` varchar(36) NOT NULL,
  `employee_id` int NOT NULL,
  `employee_code` varchar(10) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `title_th` varchar(100) DEFAULT NULL,
  `firstname` varchar(100) NOT NULL,
  `middlename` varchar(100) DEFAULT NULL,
  `lastname` varchar(100) NOT NULL,
  `title_en` varchar(100) DEFAULT NULL,
  `firstname_en` varchar(100) DEFAULT NULL,
  `middlename_en` varchar(100) DEFAULT NULL,
  `lastname_en` varchar(100) DEFAULT NULL,
  `institute_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `position_type` int DEFAULT NULL,
  `position_special` int DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `last_seen_at` datetime DEFAULT NULL,
  `education_level` tinyint DEFAULT NULL,
  `mobile` varchar(10) DEFAULT NULL,
  `work_phone` varchar(10) DEFAULT NULL,
  `synced_at` datetime DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `is_active` enum('0','1') NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_db275b28074454c1f05dc5403c` (`employee_uuid`),
  UNIQUE KEY `IDX_817d1d427138772d47eca04885` (`email`),
  UNIQUE KEY `IDX_45af99d6ae576d97ca2bfa9142` (`employee_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questionnaires`
--

DROP TABLE IF EXISTS `questionnaires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questionnaires` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `open_date` timestamp NULL DEFAULT NULL,
  `close_date` timestamp NULL DEFAULT NULL,
  `is_allow_multi_submit` tinyint NOT NULL DEFAULT '0',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `status_id` varchar(36) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_797ba6f50e504ccd54c00dcf134` (`status_id`),
  KEY `FK_a664e1ed1459e94282820e925a8` (`created_by`),
  KEY `FK_259694dd62b6247422a8b6c0909` (`updated_by`),
  KEY `FK_d62baae31d82b3526480899fdfc` (`deleted_by`),
  CONSTRAINT `FK_259694dd62b6247422a8b6c0909` FOREIGN KEY (`updated_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_797ba6f50e504ccd54c00dcf134` FOREIGN KEY (`status_id`) REFERENCES `status` (`id`),
  CONSTRAINT `FK_a664e1ed1459e94282820e925a8` FOREIGN KEY (`created_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_d62baae31d82b3526480899fdfc` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` varchar(36) NOT NULL,
  `question_text` text NOT NULL,
  `order_no` int NOT NULL,
  `is_required` tinyint NOT NULL DEFAULT '1',
  `weight` int NOT NULL DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `questionnaire_id` varchar(36) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_63701a17ec60c100d5d87ba2953` (`questionnaire_id`),
  KEY `FK_6004e23393f2a8efe414480b75d` (`category_id`),
  KEY `FK_7d0fdceddfeebcc65d61b2f4c70` (`created_by`),
  KEY `FK_82018a0a41a1452b357463f4b3e` (`updated_by`),
  KEY `FK_c3104a78e3039fdf0e8bda2f82f` (`deleted_by`),
  CONSTRAINT `FK_6004e23393f2a8efe414480b75d` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `FK_63701a17ec60c100d5d87ba2953` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`),
  CONSTRAINT `FK_7d0fdceddfeebcc65d61b2f4c70` FOREIGN KEY (`created_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_82018a0a41a1452b357463f4b3e` FOREIGN KEY (`updated_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_c3104a78e3039fdf0e8bda2f82f` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `results`
--

DROP TABLE IF EXISTS `results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `results` (
  `id` varchar(36) NOT NULL,
  `rawTotalScore` decimal(10,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `classification` varchar(20) NOT NULL,
  `calculated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `deleted_at` timestamp(6) NULL DEFAULT NULL,
  `submission_id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `classification_rule_id` varchar(36) DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_7529f774b6277b5e6945d343ce` (`submission_id`,`category_id`),
  KEY `FK_db27d3ff21a38a0a617a62d34d6` (`category_id`),
  KEY `FK_900e9d5f74ee25ccbd5e1b7657b` (`classification_rule_id`),
  KEY `FK_c27d4c14b88b4b1bc291b0046c5` (`deleted_by`),
  CONSTRAINT `FK_900e9d5f74ee25ccbd5e1b7657b` FOREIGN KEY (`classification_rule_id`) REFERENCES `classification_rules` (`id`),
  CONSTRAINT `FK_95612df6725b23956bfb8eee287` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `FK_c27d4c14b88b4b1bc291b0046c5` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_db27d3ff21a38a0a617a62d34d6` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_95ff138b88fdd8a7c9ebdb97a3` (`name`),
  KEY `FK_114e3ddec6490433181753d58f1` (`created_by`),
  KEY `FK_c9c1198e54947cf4d8e648292eb` (`updated_by`),
  KEY `FK_4c5d37b790f5a4aff83197e791f` (`deleted_by`),
  CONSTRAINT `FK_114e3ddec6490433181753d58f1` FOREIGN KEY (`created_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_4c5d37b790f5a4aff83197e791f` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_c9c1198e54947cf4d8e648292eb` FOREIGN KEY (`updated_by`) REFERENCES `employee` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` varchar(36) NOT NULL,
  `anonymous_session_id` varchar(64) NOT NULL,
  `submitted_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `deleted_at` datetime(6) DEFAULT NULL,
  `questionnaire_id` varchar(36) NOT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_f21dcde4566f4b045993cc88ca` (`questionnaire_id`,`anonymous_session_id`),
  KEY `FK_98f833c9aad69748963e28e4127` (`deleted_by`),
  CONSTRAINT `FK_98f833c9aad69748963e28e4127` FOREIGN KEY (`deleted_by`) REFERENCES `employee` (`id`),
  CONSTRAINT `FK_ecfc64ed7c68c96edc4d11cf7b7` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-17  2:42:11
