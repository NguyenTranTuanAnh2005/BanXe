-- ============================================================
-- SQL Script khởi tạo Database MySQL cho TuanAnh Auto
-- Chạy script này trong MySQL Workbench, phpMyAdmin hoặc Command Line
-- ============================================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS `tuananh_auto` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tuananh_auto`;

-- 2. Bảng users (Tài khoản người dùng & Admin)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) DEFAULT 'admin',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng cars (Thông tin chi tiết ô tô)
CREATE TABLE IF NOT EXISTS `cars` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `brand` VARCHAR(50) NOT NULL,
    `price` DOUBLE NOT NULL,
    `year` INT NOT NULL,
    `fuel_type` VARCHAR(30) NOT NULL DEFAULT 'Xăng',
    `body_type` VARCHAR(50) NOT NULL DEFAULT 'Sedan',
    `image_url` VARCHAR(500) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Có sẵn',
    `description` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_brand` (`brand`),
    INDEX `idx_fuel` (`fuel_type`),
    INDEX `idx_body` (`body_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng test_drives (Yêu cầu đăng ký lái thử)
CREATE TABLE IF NOT EXISTS `test_drives` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `car_id` INT NOT NULL,
    `preferred_date` VARCHAR(50) NOT NULL,
    `note` TEXT NULL,
    `status` VARCHAR(30) DEFAULT 'Chờ xác nhận',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_testdrives_cars` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Nạp dữ liệu xe mẫu ban đầu (Seed Data)
INSERT INTO `cars` (`id`, `name`, `brand`, `price`, `year`, `fuel_type`, `body_type`, `image_url`, `status`, `description`) VALUES
(1, 'Mercedes-Benz C300 AMG', 'Mercedes-Benz', 2099000000, 2024, 'Xăng', 'Sedan', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800', 'Có sẵn', 'Mẫu sedan hạng sang thể thao với động cơ 2.0L Turbo 258 mã lực, gói ngoại thất AMG năng động.'),
(2, 'BMW 330i M Sport', 'BMW', 1879000000, 2024, 'Xăng', 'Sedan', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800', 'Có sẵn', 'Thiết kế đậm chất thể thao, vận hành mạnh mẽ linh hoạt chuẩn cảm giác lái BMW.'),
(3, 'Porsche Taycan 4S', 'Porsche', 5700000000, 2024, 'Điện', 'Thể thao', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800', 'Có sẵn', 'Xe thể thao thuần điện 100% đẳng cấp thế giới, tăng tốc 0-100 km/h chỉ trong 4.0s.'),
(4, 'Toyota Camry 2.5Q', 'Toyota', 1220000000, 2023, 'Hybrid', 'Sedan', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800', 'Có sẵn', 'Sedan sang trọng tiết kiệm nhiên liệu tối ưu với động cơ Hybrid tiên tiến.'),
(5, 'Ford Ranger Wildtrak 2.0L', 'Ford', 979000000, 2024, 'Dầu', 'Bán tải', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800', 'Có sẵn', 'Vua bán tải đa dụng, công nghệ hiện đại vượt trội và khả năng off-road đỉnh cao.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 6. Nạp tài khoản Admin mẫu
INSERT INTO `users` (`username`, `email`, `hashed_password`, `role`) VALUES
('admin', 'admin@tuananhauto.vn', 'admin123_hashed_placeholder', 'admin')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);
