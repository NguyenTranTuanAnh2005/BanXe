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
    """Ensures new columns like body_type exist in database tables."""
    try:
        with engine.connect() as conn:
            is_sqlite = str(engine.url).startswith("sqlite")
            if is_sqlite:
                result = conn.execute(text("PRAGMA table_info(cars)"))
                cols = [row[1] for row in result.fetchall()]
                if cols and "body_type" not in cols:
                    conn.execute(text("ALTER TABLE cars ADD COLUMN body_type VARCHAR(50) DEFAULT 'Sedan'"))
                    conn.commit()
            else:
                result = conn.execute(text("SHOW COLUMNS FROM cars LIKE 'body_type'"))
                if not result.fetchone():
                    conn.execute(text("ALTER TABLE cars ADD COLUMN body_type VARCHAR(50) DEFAULT 'Sedan'"))
                    conn.commit()
    except Exception as err:
        pass

engine, SessionLocal = init_engine_and_session()
auto_migrate_schema(engine)

def get_db():
    """Dependency for obtaining database sessions per API request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
