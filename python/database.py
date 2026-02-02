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
# Đảm bảo trỏ đúng vào thư mục data/ ở root
DB_FILE = os.path.join(BASE_DIR, "data", "viral_game.sqlite")
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
