from services import TenantService
from database import SessionLocal, Tenant
import sys

# Add current directory to path
sys.path.append('.')

print("🚀 Checking SQLite Database...")

try:
    db = SessionLocal()
    tenants = db.query(Tenant).all()
    
    print(f"\nFound {len(tenants)} tenants in database:")
    for t in tenants:
        print(f" - ID: {t.id}")
        print(f"   Name: {t.shop_name}")
        print(f"   Active: {t.is_active}")
        print(f"   Config: {t.config}")
        print(f"   Stats: Spins={t.totalSpins}, Prizes={t.totalPrizes}")
        print("-" * 20)
        
    db.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
