-- ============================================================
-- SQL Script khởi tạo Database MySQL cho TuanAnh Auto
-- Chạy script này trong MySQL Workbench, phpMyAdmin hoặc Command Line
-- ============================================================

-- 1. Tạo Database
CREATE DATABASE IF NOT EXISTS `tuananh_auto` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tuananh_auto`;

-- 2. Bảng users (Tài khoản người dùng: Khách hàng, Người bán xe, Admin)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `hashed_password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NULL,
    `phone` VARCHAR(20) NULL,
    `role` VARCHAR(20) DEFAULT 'customer', -- 'customer', 'seller', 'admin'
    `avatar_url` VARCHAR(500) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng cars (Thông tin chi tiết ô tô kèm mô tả chi tiết & người bán)
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
    `seller_id` INT NULL,
    `contact_phone` VARCHAR(20) NULL,
    `contact_name` VARCHAR(100) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_brand` (`brand`),
    INDEX `idx_fuel` (`fuel_type`),
    INDEX `idx_body` (`body_type`),
    INDEX `idx_seller` (`seller_id`),
    CONSTRAINT `fk_cars_users` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng messages (Khách hàng gửi tin nhắn cho người bán xe)
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `car_id` INT NOT NULL,
    `sender_id` INT NULL,
    `sender_name` VARCHAR(100) NOT NULL,
    `sender_phone` VARCHAR(20) NULL,
    `sender_email` VARCHAR(100) NULL,
    `content` TEXT NOT NULL,
    `seller_id` INT NULL,
    `is_read` INT DEFAULT 0,
    `reply` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_messages_cars` FOREIGN KEY (`car_id`) REFERENCES `cars` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_messages_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng test_drives (Yêu cầu đăng ký lái thử)
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

-- 6. Nạp tài khoản mẫu ban đầu (Khách hàng, Người bán, Admin)
INSERT INTO `users` (`id`, `username`, `email`, `hashed_password`, `full_name`, `phone`, `role`) VALUES
(1, 'admin', 'admin@tuananhauto.vn', 'admin123', 'Quản Trị Viên Tuấn Anh', '19006868', 'admin'),
(2, 'nguoiban', 'dealer@tuananhauto.vn', '123456', 'Tuấn Anh Auto Showroom', '0988776655', 'seller'),
(3, 'khachhang', 'khachhang@gmail.com', '123456', 'Nguyễn Văn Khách', '0912345678', 'customer')
ON DUPLICATE KEY UPDATE `username` = VALUES(`username`);

-- 7. Nạp dữ liệu xe mẫu ban đầu (Seed Data)
INSERT INTO `cars` (`id`, `name`, `brand`, `price`, `year`, `fuel_type`, `body_type`, `image_url`, `status`, `description`, `seller_id`, `contact_phone`, `contact_name`) VALUES
(1, 'Mercedes-Benz C300 AMG', 'Mercedes-Benz', 2099000000, 2024, 'Xăng', 'Sedan', 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=800', 'Có sẵn', 'Mẫu sedan hạng sang thể thao đỉnh cao với động cơ 2.0L Turbo 258 mã lực, mô-men xoắn 400 Nm, hộp số tự động 9 cấp 9G-TRONIC. Gói ngoại thất thể thao AMG Line, đèn Digital Light tối tân, mâm xe AMG 19 inch đa chấu, cửa sổ trời toàn cảnh Panoramic. Nội thất bọc da cao cấp, hệ thống âm thanh vòm Burmester 3D 15 loa cực đỉnh.', 2, '0988776655', 'Tuấn Anh Auto Showroom'),
(2, 'BMW 330i M Sport', 'BMW', 1879000000, 2024, 'Xăng', 'Sedan', 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800', 'Có sẵn', 'Đỉnh cao cảm giác lái thuần chất xứ Bavaria. Động cơ BMW TwinPower Turbo 2.0L sản sinh 258hp, tăng tốc 0-100 km/h trong 5.8 giây. Trang bị gói thể thao M Sport bao gồm treo thích ứng M, phanh hiệu năng cao M Sport kẹp phanh xanh, vô lăng M và dàn âm thanh vòm Harman Kardon 16 loa công suất 464W.', 2, '0988776655', 'Tuấn Anh Auto Showroom'),
(3, 'Porsche Taycan 4S', 'Porsche', 5700000000, 2024, 'Điện', 'Thể thao', 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800', 'Có sẵn', 'Siêu xe thể thao thuần điện 100% dẫn đầu kỷ nguyên điện hóa. Công suất cực đại lên tới 530 mã lực với Overboost và Launch Control, bứt tốc 0-100 km/h chỉ vỏn vẹn 4.0 giây. Kiến trúc điện áp 800V cho phép sạc từ 5% lên 80% chỉ trong 22.5 phút. Hệ dẫn động 4 bánh toàn thời gian AWD, đánh lái trục sau thông minh.', 2, '0988776655', 'Tuấn Anh Auto Showroom'),
(4, 'Toyota Camry 2.5Q', 'Toyota', 1220000000, 2023, 'Hybrid', 'Sedan', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=800', 'Có sẵn', 'Sedan chuẩn mực dành cho doanh nhân thành đạt. Hệ thống động cơ xăng lai điện Hybrid thế hệ thứ 4 êm ái tuyệt đối, mức tiêu hao nhiên liệu ấn tượng chỉ khoảng 4.4L/100km. Gói công nghệ an toàn chủ động Toyota Safety Sense 2.0, hàng ghế sau chỉnh điện ngả lưng tích hợp cụm điều khiển cảm ứng trung tâm sang trọng.', 2, '0988776655', 'Tuấn Anh Auto Showroom'),
(5, 'Ford Ranger Wildtrak 2.0L', 'Ford', 979000000, 2024, 'Dầu', 'Bán tải', 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800', 'Có sẵn', 'Vua bán tải Việt Nam sở hữu động cơ 2.0L Bi-Turbo Diesel kết hợp hộp số tự động 10 cấp điện tử. Hệ dẫn động 4x4 với 6 chế độ lái địa hình linh hoạt. Màn hình cảm ứng 12 inch SYNC 4A kết nối không dây Apple CarPlay/Android Auto, camera 360 độ sắc nét cùng hệ thống kiểm soát hành trình thích ứng Adaptive Cruise Control.', 2, '0988776655', 'Tuấn Anh Auto Showroom')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
