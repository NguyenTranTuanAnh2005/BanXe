import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# MySQL Configuration Credentials
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "root@123")
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "tuananh_auto")

# URL encode password to handle special characters like '@'
ENCODED_PASSWORD = quote_plus(MYSQL_PASSWORD)
DEFAULT_MYSQL_URL = f"mysql+pymysql://{MYSQL_USER}:{ENCODED_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"

DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

Base = declarative_base()

def init_engine_and_session():
    """Initializes SQLAlchemy Engine with auto-test and fallback to SQLite if MySQL is offline."""
    db_url = DATABASE_URL
    is_sqlite = db_url.startswith("sqlite")

    if not is_sqlite:
        try:
            temp_engine = create_engine(db_url, pool_recycle=3600, pool_pre_ping=True)
            # Test direct connection
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[SUCCESS] Connection to MySQL Server succeeded ({MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB})!")
            engine = temp_engine
        except Exception as e:
            print("\n" + "=" * 75)
            print(f"[WARNING] Could not connect to MySQL Server at {MYSQL_HOST}:{MYSQL_PORT}.")
            print(f"[REASON] {e}")
            print("[FALLBACK] Automatically switching to local SQLite file ('tuananh_auto.db') so FastAPI starts smoothly!")
            print("[INFO] Once MySQL server is running, import database.sql to switch to MySQL.")
            print("=" * 75 + "\n")

            db_url = "sqlite:///./tuananh_auto.db"
            engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, SessionLocal

def auto_migrate_schema(engine):
    """Ensures new columns like body_type, seller fields and user profiles exist in database tables."""
    try:
        with engine.connect() as conn:
            is_sqlite = str(engine.url).startswith("sqlite")
            if is_sqlite:
                # 1. Migrate cars table
                result = conn.execute(text("PRAGMA table_info(cars)"))
                car_cols = [row[1] for row in result.fetchall()]
                if car_cols:
                    if "body_type" not in car_cols:
                        conn.execute(text("ALTER TABLE cars ADD COLUMN body_type VARCHAR(50) DEFAULT 'Sedan'"))
                    if "seller_id" not in car_cols:
                        conn.execute(text("ALTER TABLE cars ADD COLUMN seller_id INTEGER NULL"))
                    if "contact_phone" not in car_cols:
                        conn.execute(text("ALTER TABLE cars ADD COLUMN contact_phone VARCHAR(20) NULL"))
                    if "contact_name" not in car_cols:
                        conn.execute(text("ALTER TABLE cars ADD COLUMN contact_name VARCHAR(100) NULL"))
                
                # 2. Migrate users table
                result_users = conn.execute(text("PRAGMA table_info(users)"))
                user_cols = [row[1] for row in result_users.fetchall()]
                if user_cols:
                    if "full_name" not in user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NULL"))
                    if "phone" not in user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL"))
                    if "avatar_url" not in user_cols:
                        conn.execute(text("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL"))
                
                conn.commit()
            else:
                # MySQL Migration
                def add_col_if_missing(table, col, col_def):
                    res = conn.execute(text(f"SHOW COLUMNS FROM {table} LIKE '{col}'"))
                    if not res.fetchone():
                        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}"))

                # cars columns
                add_col_if_missing("cars", "body_type", "VARCHAR(50) DEFAULT 'Sedan'")
                add_col_if_missing("cars", "seller_id", "INT NULL")
                add_col_if_missing("cars", "contact_phone", "VARCHAR(20) NULL")
                add_col_if_missing("cars", "contact_name", "VARCHAR(100) NULL")

                # users columns
                add_col_if_missing("users", "full_name", "VARCHAR(100) NULL")
                add_col_if_missing("users", "phone", "VARCHAR(20) NULL")
                add_col_if_missing("users", "avatar_url", "VARCHAR(500) NULL")

                conn.commit()
    except Exception as err:
        print(f"[SCHEMA MIGRATION WARNING] {err}")

engine, SessionLocal = init_engine_and_session()
auto_migrate_schema(engine)

def get_db():
    """Dependency for obtaining database sessions per API request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
