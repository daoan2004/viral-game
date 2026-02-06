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
            print(f"Error getting tenant: {e}")
            return None
        finally:
            db.close()

    @staticmethod
    def get_or_create_tenant(page_id: str):
        """Tự động tạo tenant mặc định nếu chưa có (cho mục đích test)"""
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter(Tenant.id == page_id).first()
            if not tenant:
                # Create Default Tenant
                print(f"⚠️ [TenantService] Page {page_id} chưa có config. Đang tạo Default...")
                default_config = {
                    "prizes": [
                        {"name": "Voucher 10k", "rate": 0.5},
                        {"name": "Voucher 20k", "rate": 0.3},
                        {"name": "Voucher 50k", "rate": 0.2},
                    ],
                    "messages": {
                        "welcome": "Chào {name}! Gửi ảnh hóa đơn để quay thưởng nhé.",
                        "invalid": "Hóa đơn không hợp lệ.",
                        "used": "Hóa đơn này đã được sử dụng rồi.",
                        "success": "Chúc mừng! Bạn trúng {prize}."
                    },
                    "shop_patterns": ["WinMart", "Circle K", "FamilyMart", "7-Eleven"]
                }
                
                tenant = Tenant(
                    id=page_id,
                    shop_name=f"Shop Demo {page_id[-4:]}",
                    is_active=True,
                    config=default_config,
                    created_at=datetime.utcnow()
                )
                db.add(tenant)
                db.commit()
                db.refresh(tenant)
                print(f"✅ [TenantService] Đã tạo Default Tenant cho Page {page_id}")

            # Return as dict
            tenant_dict = {
                "id": tenant.id,
                "shop_name": tenant.shop_name,
                "access_token": tenant.access_token,
                "is_active": tenant.is_active,
                "prizes": tenant.config.get("prizes", []) if tenant.config else [],
                "messages": tenant.config.get("messages", {}) if tenant.config else {},
                "shop_patterns": tenant.config.get("shop_patterns", []) if tenant.config else [],
            }
            return tenant_dict
        except Exception as e:
            print(f"Error creating tenant: {e}")
            db.rollback()
            return None
        finally:
            db.close()

    @staticmethod
    def update_token(page_id: str, new_token: str) -> bool:
        db = SessionLocal()
        try:
            tenant = db.query(Tenant).filter(Tenant.id == page_id).first()
            if not tenant:
                return False
            
            tenant.access_token = new_token
            db.commit()
            return True
        except Exception as e:
            print(f"Error updating token: {e}")
            db.rollback()
            return False
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
