-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 11, 2026 at 05:45 PM
-- Server version: 11.4.9-MariaDB
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ehubph_pms`
--
-- CREATE DATABASE IF NOT EXISTS `ehubph_pms` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
-- USE `ehubph_pms`;

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `cost_per_unit` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `added_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `project_id`, `name`, `description`, `quantity`, `unit`, `cost_per_unit`, `total_cost`, `added_at`) VALUES
('material-1', 'project-1', 'Steel Beams', 'Structural steel beams for foundation', 10.00, 'pieces', 500.00, 5000.00, '2026-01-08 03:22:46'),
('material-2', 'project-1', 'Concrete', 'Ready-mix concrete for foundation', 50.00, 'cubic meters', 200.00, 10000.00, '2026-01-08 03:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('planning','pending-assignment','in-progress','completed','cancelled') DEFAULT 'planning',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `progress` int(11) DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `client_id` varchar(255) DEFAULT NULL,
  `supervisor_id` varchar(255) DEFAULT NULL,
  `fabricator_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fabricator_ids`)),
  `pending_supervisors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pending_supervisors`)),
  `pending_assignments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`pending_assignments`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `description`, `status`, `priority`, `progress`, `start_date`, `due_date`, `budget`, `client_id`, `supervisor_id`, `fabricator_ids`, `pending_supervisors`, `pending_assignments`, `created_at`, `updated_at`) VALUES
('project-1', 'Sample Construction Project', 'A sample construction project for testing the system', 'planning', 'high', 0, '2024-01-15', '2024-06-15', 50000.00, 'client-1', 'supervisor-1', NULL, NULL, NULL, '2026-01-08 03:22:46', '2026-01-08 03:22:46'),
('project-1767848514', 'Test Project', 'meow meow', '', 'urgent', 0, '2026-01-08', '2026-02-08', 25000.00, NULL, 'supervisor-1', '[\"user-1767848348\",\"fabricator-1\"]', NULL, NULL, '2026-01-08 05:01:54', '2026-01-08 05:01:54');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in-progress','completed','cancelled') DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `assigned_to` varchar(255) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `estimated_hours` decimal(5,2) DEFAULT NULL,
  `actual_hours` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `status`, `priority`, `assigned_to`, `created_by`, `due_date`, `estimated_hours`, `actual_hours`, `created_at`, `updated_at`) VALUES
('task-1', 'project-1', 'Project Planning', 'Create detailed project plan and timeline', 'pending', 'high', 'fabricator-1', 'supervisor-1', '2024-02-01', 8.00, 0.00, '2026-01-08 03:22:46', '2026-01-08 03:22:46'),
('task-2', 'project-1', 'Material Procurement', 'Order and organize required materials', 'pending', 'medium', 'fabricator-1', 'supervisor-1', '2024-02-15', 4.00, 0.00, '2026-01-08 03:22:46', '2026-01-08 03:22:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','supervisor','fabricator','client') NOT NULL,
  `school` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gcash_number` varchar(20) DEFAULT NULL,
  `secure_id` varchar(50) DEFAULT NULL,
  `employee_number` varchar(50) DEFAULT NULL,
  `client_project_id` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `school`, `phone`, `gcash_number`, `secure_id`, `employee_number`, `client_project_id`, `is_active`, `created_at`, `updated_at`) VALUES
('admin-1', 'System Administrator', 'admin@ehub.com', '$2y$10$5/NZqGqddNtQdQcal2b23ONnY855uy6XvkCA/GpYdMhrH8B6l/tga', 'admin', NULL, NULL, NULL, 'ADM001', 'EMP001', NULL, 1, '2026-01-08 03:22:46', '2026-01-08 08:10:39'),
('client-1', 'Sarah Client', 'client@ehub.com', '$2y$10$5/NZqGqddNtQdQcal2b23ONnY855uy6XvkCA/GpYdMhrH8B6l/tga', 'client', NULL, NULL, NULL, 'CLI001', NULL, NULL, 1, '2026-01-08 03:22:46', '2026-01-08 08:10:39'),
('fabricator-1', 'Mike Fabricator', 'fabricator@ehub.com', '$2y$10$5/NZqGqddNtQdQcal2b23ONnY855uy6XvkCA/GpYdMhrH8B6l/tga', 'fabricator', NULL, NULL, NULL, 'FAB001', 'EMP003', NULL, 1, '2026-01-08 03:22:46', '2026-01-08 08:10:39'),
('supervisor-1', 'John Supervisor', 'supervisor@ehub.com', '$2y$10$5/NZqGqddNtQdQcal2b23ONnY855uy6XvkCA/GpYdMhrH8B6l/tga', 'supervisor', NULL, NULL, NULL, 'SUP001', 'EMP002', NULL, 1, '2026-01-08 03:22:46', '2026-01-08 08:10:39'),
('user-1767864667', 'Allen Ray Pregillana', 'allenraypregillana0905@gmail.com', '$2y$10$yduQP5Zy.Ld3drgW7Vrx/On8jyfqDPYTiq0kYOu.fpWGZuEuRybtW', 'fabricator', 'Ehub University', '+639275966381', '+639275966381', 'FABT8JH3U5E7', 'EMP864666453', NULL, 1, '2026-01-08 09:31:07', '2026-01-08 09:31:07'),
('user-1768142585', 'Prince Ramirez', 'princeramirezpv@gmail.com', '$2y$10$iueZe/YoRboJSV54W/ntiOzV9vov6mMrg3zNjRCCmQrZxCz2clrR.', 'fabricator', 'Other', '09499355711', '09499355711', 'FABT8PFJT48C', 'EMP142585455', NULL, 1, '2026-01-11 14:43:05', '2026-01-11 14:43:05');

-- --------------------------------------------------------

--
-- Table structure for table `work_logs`
--

CREATE TABLE `work_logs` (
  `id` varchar(255) NOT NULL,
  `project_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `hours_worked` decimal(5,2) NOT NULL,
  `description` text DEFAULT NULL,
  `progress_percentage` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_supervisor_id` (`supervisor_id`),
  ADD KEY `idx_projects_created_at` (`created_at`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tasks_due_date` (`due_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `secure_id` (`secure_id`),
  ADD UNIQUE KEY `employee_number` (`employee_number`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_secure_id` (`secure_id`),
  ADD KEY `idx_employee_number` (`employee_number`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `work_logs`
--
ALTER TABLE `work_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_project_id` (`project_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_work_logs_user_date` (`user_id`,`date`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
