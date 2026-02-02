import json
from datetime import datetime
from database import SessionLocal, Tenant, Invoice

class TenantService:
    @staticmethod
    def get_tenant_by_page_id(page_id: str):
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter(Tenant.id == page_id).first()
            if not tenant:
                return None
            
            # Convert SQLAlchemy object to dict
            tenant_dict = {
                "id": tenant.id,
                "shop_name": tenant.shop_name,
                "access_token": tenant.access_token,
                "is_active": tenant.is_active,
                # JSON config fields
                "prizes": tenant.config.get("prizes", []) if tenant.config else [],
                "messages": tenant.config.get("messages", {}) if tenant.config else {},
                "shop_patterns": tenant.config.get("shop_patterns", []) if tenant.config else [],
            }
            return tenant_dict
        except Exception as e:
            print(f"Error getting tenant: {e}")
            return None
        finally:
            db.close()

class InvoiceService:
    @staticmethod
    def is_invoice_used(invoice_id: str, page_id: str) -> bool:
        db = SessionLocal()
        try:
            # Check if invoice exists for this page
            exists = db.query(Invoice).filter(
                Invoice.id == invoice_id, 
                Invoice.page_id == page_id
            ).first()
            return exists is not None
        except Exception as e:
            print(f"Error checking invoice: {e}")
            return False
        finally:
            db.close()

    @staticmethod
    def mark_invoice_used(invoice_id: str, page_id: str, sender_id: str, prize_won: str):
        db = SessionLocal()
        try:
            new_invoice = Invoice(
                id=invoice_id,
                page_id=page_id,
                sender_id=sender_id,
                prize_won=prize_won,
                created_at=datetime.utcnow()
            )
            db.add(new_invoice)
            
            # Update stats
            tenant = db.query(Tenant).filter(Tenant.id == page_id).first()
            if tenant:
                tenant.totalSpins = (tenant.totalSpins or 0) + 1
                tenant.totalPrizes = (tenant.totalPrizes or 0) + 1
                tenant.totalUsers = (tenant.totalUsers or 0) + 1 # Simplified logic
            
            db.commit()
            return True
        except Exception as e:
            print(f"Error saving invoice: {e}")
            db.rollback()
            return False
        finally:
            db.close()
