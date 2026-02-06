from sqlalchemy import create_engine, Column, String, Boolean, Integer, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import datetime
from dotenv import load_dotenv

# Xác định đường dẫn gốc project (Viral game)
# File này ở: .../Viral game/python/database.py
# Root là: .../Viral game/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load .env từ root
env_path = os.path.join(BASE_DIR, ".env")
load_dotenv(env_path)

# Cấu hình đường dẫn DB
# 1. Check for dedicated Python env var (PYTHON_DB_PATH)
env_python_db_path = os.getenv("PYTHON_DB_PATH")
# 2. Check for global DATABASE_PATH (only if absolute - Docker)
env_db_path = os.getenv("DATABASE_PATH")

if env_python_db_path:
    DB_FILE = env_python_db_path
elif env_db_path and os.path.isabs(env_db_path):
    DB_FILE = env_db_path
else:
    # 3. Local fallback (same directory as this file to ensure permissions)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    DB_FILE = os.path.join(current_dir, "viral_game.sqlite")

# Ensure directory exists loop
db_dir = os.path.dirname(DB_FILE)
if db_dir and not os.path.exists(db_dir):
    try:
        os.makedirs(db_dir)
        print(f"📦 [Database] Created directory: {db_dir}")
    except OSError as e:
        print(f"⚠️ [Database] Could not create directory {db_dir}: {e}")
        # Fallback to /tmp in worst case
        DB_FILE = "/tmp/viral_game.sqlite"
        print(f"📦 [Database] Fallback to: {DB_FILE}")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

print(f"📦 [Database] Connecting to SQLite at: {DB_FILE}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Tenant(Base):
    __tablename__ = "tenant"

    id = Column(String, primary_key=True, index=True)
    shop_name = Column(String)
    access_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    config = Column(JSON, nullable=True) # Stores prizes, messages, patterns
    
    totalSpins = Column(Integer, default=0)
    totalPrizes = Column(Integer, default=0)
    totalUsers = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoice"
    
    id = Column(String, primary_key=True, index=True) # invoice_id
    page_id = Column(String, index=True)
    sender_id = Column(String, index=True)
    prize_won = Column(String)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
