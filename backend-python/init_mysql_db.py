import os
import pymysql

MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root@123")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))
MYSQL_DB = os.getenv("MYSQL_DB", "tuananh_auto")

def create_mysql_database():
    """Tự động kết nối đến MySQL và khởi tạo database tuananh_auto kèm dữ liệu mẫu."""
    print(f"Dang ket noi den MySQL Server tai {MYSQL_HOST}:{MYSQL_PORT} voi user '{MYSQL_USER}'...")
    try:
        connection = pymysql.connect(
            host=MYSQL_HOST,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            port=MYSQL_PORT,
            autocommit=True
        )
        with connection.cursor() as cursor:
            # Tạo database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DB}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            print(f"[OK] Da tao thanh cong Database MySQL: `{MYSQL_DB}`!")
        
        connection.select_db(MYSQL_DB)

        # Đọc và thực thi nội dung file database.sql
        sql_file_path = os.path.join(os.path.dirname(__file__), 'database.sql')
        if os.path.exists(sql_file_path):
            with open(sql_file_path, 'r', encoding='utf-8') as f:
                sql_script = f.read()

            commands = sql_script.split(';')
            with connection.cursor() as cursor:
                for command in commands:
                    cmd = command.strip()
                    if cmd:
                        cursor.execute(cmd)
            print("[OK] Da tao toan bo cac bang (`users`, `cars`, `test_drives`) va nap du lieu o to mau vao MySQL thanh cong!")
        else:
            print("[WARNING] Khong tim thay file database.sql")
            
        connection.close()
    except Exception as e:
        print(f"[ERROR] Loi khi khoi tao MySQL: {e}")
        print("Meo: Hay dam bao dich vu MySQL Server (XAMPP/MySQL Service) da duoc bat tren may tinh cua ban.")

if __name__ == "__main__":
    create_mysql_database()
