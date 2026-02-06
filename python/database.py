from sqlalchemy import create_engine, Column, String, Boolean, Integer, DateTime, JSON
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import datetime
from dotenv import load_dotenv

# Load env
load_dotenv()

# ====================================================================
# CẤU HÌNH DATABASE CHUẨN
# ====================================================================
# Ưu tiên lấy từ biến môi trường PYTHON_DB_PATH (được set cứng trong Docker)
# Nếu không có (chạy local), dùng ./data/viral_game.sqlite tương đối từ root
# ====================================================================

# 1. Xác định đường dẫn file
# Mặc định cho Local Development (nếu chạy python main.py trực tiếp ở ngoài)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_LOCAL_PATH = os.path.join(BASE_DIR, "data", "viral_game.sqlite")

# Lấy từ ENV (Docker sẽ truyền vào /app/data/viral_game.sqlite)
DB_FILE = os.getenv("PYTHON_DB_PATH", DEFAULT_LOCAL_PATH)

# 2. Đảm bảo thư mục tồn tại và có quyền ghi
db_dir = os.path.dirname(DB_FILE)
if db_dir:
    if not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
            print(f"📦 [Database] Init: Đã tạo thư mục {db_dir}")
        except OSError as e:
            print(f"❌ [Database] Không thể tạo thư mục {db_dir}: {e}")
            DB_FILE = "/tmp/viral_game.sqlite"

    # Robust Write Check: Thử ghi file
    try:
        test_file = os.path.join(db_dir if db_dir else ".", ".perm_test")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        print(f"✅ [Database] Kiểm tra quyền ghi OK tại: {DB_FILE}")
    except Exception as e:
        print(f"⚠️ [Database] Thư mục READ-ONLY hoặc lỗi quyền ({e})")
        print(f"👉 [Database] Chuyển sang chế độ FALLBACK: /tmp/viral_game.sqlite")
        DB_FILE = "/tmp/viral_game.sqlite"

print(f"📦 [Database] Đường dẫn DB: {DB_FILE}")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

# 3. Kết nối
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# ====================================================================
# MODELS
# ====================================================================

class Tenant(Base):
    __tablename__ = "tenant"

    id = Column(String, primary_key=True, index=True)
    shop_name = Column(String)
    access_token = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    config = Column(JSON, nullable=True)
    
    totalSpins = Column(Integer, default=0)
    totalPrizes = Column(Integer, default=0)
    totalUsers = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoice"
    
    id = Column(String, primary_key=True, index=True)
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
