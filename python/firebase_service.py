"""
File: firebase_service.py
Muc dich: Ket noi va thao tac voi Firebase Firestore

Collections:
- tenants: Luu config cua tung Page/cua hang
- used_invoices: Luu cac hoa don da su dung (chong gian lan)
"""

import os
import sys
from datetime import datetime
from typing import Optional, Dict, Any, List

# Fix Windows encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

import firebase_admin
from firebase_admin import credentials, firestore

# ============================================================================
# KHỞI TẠO FIREBASE
# ============================================================================

# Đường dẫn đến file Service Account JSON
# Ưu tiên lấy từ biến môi trường (cho Docker/Deploy)
FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")

# Nếu không có env, dùng đường dẫn tương đối (cho Local Dev)
if not FIREBASE_KEY_PATH:
    FIREBASE_KEY_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "firebase-key.json")

print(f"[Firebase] Key path resolved to: {FIREBASE_KEY_PATH}")
if not os.path.exists(FIREBASE_KEY_PATH):
    print(f"❌ [Firebase] ERROR: Key file not found at {FIREBASE_KEY_PATH}")
    # List directory to help debugging
    dir_path = os.path.dirname(FIREBASE_KEY_PATH)
    if os.path.exists(dir_path):
        print(f"   Contents of {dir_path}: {os.listdir(dir_path)}")
    else:
        print(f"   Directory {dir_path} does not exist")

# Khởi tạo Firebase App (chỉ chạy 1 lần)
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("[Firebase] Ket noi Firebase thanh cong")

# Khởi tạo Firestore client
db = firestore.client()


# ============================================================================
# TENANT SERVICE - Quản lý cửa hàng/Page
# ============================================================================

class TenantService:
    """
    Service quản lý thông tin tenant (cửa hàng/Page)
    
    Collection: tenants
    Document ID: page_id
    """
    
    COLLECTION = "tenants"
    
    @staticmethod
    def get_tenant_by_page_id(page_id: str) -> Optional[Dict[str, Any]]:
        """
        Lấy thông tin tenant theo Page ID
        
        Args:
            page_id: Facebook Page ID
            
        Returns:
            Dict chứa config của tenant hoặc None nếu không tìm thấy
        """
        try:
            doc_ref = db.collection(TenantService.COLLECTION).document(page_id)
            doc = doc_ref.get()
            
            if doc.exists:
                tenant_data = doc.to_dict()
                tenant_data["page_id"] = page_id  # Thêm page_id vào data
                
                # Fix: Xử lý trường hợp field names có khoảng trắng thừa
                # VD: "prizes " -> "prizes", " name" -> "name"
                cleaned_data = {}
                for key, value in tenant_data.items():
                    clean_key = key.strip()
                    # Nếu value là list, clean các dict bên trong
                    if isinstance(value, list):
                        cleaned_list = []
                        for item in value:
                            if isinstance(item, dict):
                                cleaned_item = {k.strip(): v for k, v in item.items()}
                                cleaned_list.append(cleaned_item)
                            else:
                                cleaned_list.append(item)
                        cleaned_data[clean_key] = cleaned_list
                    else:
                        cleaned_data[clean_key] = value
                
                print(f"[TenantService] Tim thay tenant: {cleaned_data.get('shop_name')}")
                return cleaned_data
            else:
                print(f"[TenantService] Khong tim thay tenant voi page_id: {page_id}")
                return None
                
        except Exception as e:
            print(f"[TenantService] Loi khi lay tenant: {str(e)}")
            return None
    
    @staticmethod
    def create_tenant(page_id: str, tenant_data: Dict[str, Any]) -> bool:
        """
        Tạo tenant mới
        
        Args:
            page_id: Facebook Page ID (dùng làm document ID)
            tenant_data: Dict chứa thông tin tenant
            
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            # Thêm timestamp
            tenant_data["created_at"] = datetime.now()
            tenant_data["updated_at"] = datetime.now()
            
            doc_ref = db.collection(TenantService.COLLECTION).document(page_id)
            doc_ref.set(tenant_data)
            
            print(f"✅ [TenantService] Tạo tenant thành công: {page_id}")
            return True
            
        except Exception as e:
            print(f"❌ [TenantService] Lỗi khi tạo tenant: {str(e)}")
            return False
    
    @staticmethod
    def update_tenant(page_id: str, update_data: Dict[str, Any]) -> bool:
        """
        Cập nhật thông tin tenant
        """
        try:
            update_data["updated_at"] = datetime.now()
            
            doc_ref = db.collection(TenantService.COLLECTION).document(page_id)
            doc_ref.update(update_data)
            
            print(f"✅ [TenantService] Cập nhật tenant thành công: {page_id}")
            return True
            
        except Exception as e:
            print(f"❌ [TenantService] Lỗi khi cập nhật tenant: {str(e)}")
            return False
    
    @staticmethod
    def get_all_active_tenants() -> List[Dict[str, Any]]:
        """
        Lấy tất cả tenant đang active
        """
        try:
            docs = db.collection(TenantService.COLLECTION).where(
                "is_active", "==", True
            ).stream()
            
            tenants = []
            for doc in docs:
                tenant_data = doc.to_dict()
                tenant_data["page_id"] = doc.id
                tenants.append(tenant_data)
            
            print(f"✅ [TenantService] Tìm thấy {len(tenants)} tenant active")
            return tenants
            
        except Exception as e:
            print(f"❌ [TenantService] Lỗi khi lấy danh sách tenant: {str(e)}")
            return []


# ============================================================================
# INVOICE SERVICE - Quản lý hóa đơn đã sử dụng
# ============================================================================

class InvoiceService:
    """
    Service quản lý hóa đơn đã sử dụng (chống gian lận)
    
    Collection: used_invoices
    Document ID: {invoice_id}_{page_id} (để tránh trùng giữa các tenant)
    """
    
    COLLECTION = "used_invoices"
    
    @staticmethod
    def is_invoice_used(invoice_id: str, page_id: str) -> bool:
        """
        Kiểm tra hóa đơn đã được sử dụng chưa
        
        Args:
            invoice_id: Mã hóa đơn
            page_id: Facebook Page ID
            
        Returns:
            True nếu đã sử dụng, False nếu chưa
        """
        try:
            # Tạo document ID unique cho mỗi tenant
            doc_id = f"{invoice_id.strip().upper()}_{page_id}"
            
            doc_ref = db.collection(InvoiceService.COLLECTION).document(doc_id)
            doc = doc_ref.get()
            
            if doc.exists:
                print(f"⚠️ [InvoiceService] Hóa đơn đã sử dụng: {invoice_id}")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ [InvoiceService] Lỗi khi kiểm tra hóa đơn: {str(e)}")
            # Trả về True để an toàn (không cho quay thưởng nếu lỗi)
            return True
    
    @staticmethod
    def mark_invoice_used(
        invoice_id: str,
        page_id: str,
        sender_id: str,
        prize_won: str
    ) -> bool:
        """
        Đánh dấu hóa đơn đã sử dụng
        
        Args:
            invoice_id: Mã hóa đơn
            page_id: Facebook Page ID
            sender_id: Facebook User ID của người chơi
            prize_won: Tên giải thưởng đã trúng
            
        Returns:
            True nếu thành công, False nếu thất bại
        """
        try:
            # Tạo document ID unique
            doc_id = f"{invoice_id.strip().upper()}_{page_id}"
            
            invoice_data = {
                "invoice_id": invoice_id,
                "page_id": page_id,
                "sender_id": sender_id,
                "prize_won": prize_won,
                "created_at": datetime.now(),
            }
            
            doc_ref = db.collection(InvoiceService.COLLECTION).document(doc_id)
            doc_ref.set(invoice_data)
            
            print(f"✅ [InvoiceService] Đã ghi nhận hóa đơn: {invoice_id}")
            return True
            
        except Exception as e:
            print(f"❌ [InvoiceService] Lỗi khi ghi nhận hóa đơn: {str(e)}")
            return False
    
    @staticmethod
    def get_invoices_by_page(page_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Lấy danh sách hóa đơn đã sử dụng của một Page
        
        Args:
            page_id: Facebook Page ID
            limit: Số lượng tối đa
            
        Returns:
            List các hóa đơn
        """
        try:
            docs = db.collection(InvoiceService.COLLECTION).where(
                "page_id", "==", page_id
            ).order_by(
                "created_at", direction=firestore.Query.DESCENDING
            ).limit(limit).stream()
            
            invoices = [doc.to_dict() for doc in docs]
            
            print(f"✅ [InvoiceService] Tìm thấy {len(invoices)} hóa đơn cho page {page_id}")
            return invoices
            
        except Exception as e:
            print(f"❌ [InvoiceService] Lỗi khi lấy danh sách hóa đơn: {str(e)}")
            return []
    
    @staticmethod
    def get_stats_by_page(page_id: str) -> Dict[str, Any]:
        """
        Lấy thống kê hóa đơn của một Page
        
        Returns:
            Dict với total_plays, prizes_count
        """
        try:
            docs = db.collection(InvoiceService.COLLECTION).where(
                "page_id", "==", page_id
            ).stream()
            
            total_plays = 0
            prizes_count = {}
            
            for doc in docs:
                total_plays += 1
                data = doc.to_dict()
                prize = data.get("prize_won", "Unknown")
                prizes_count[prize] = prizes_count.get(prize, 0) + 1
            
            return {
                "total_plays": total_plays,
                "prizes_count": prizes_count
            }
            
        except Exception as e:
            print(f"❌ [InvoiceService] Lỗi khi lấy thống kê: {str(e)}")
            return {"total_plays": 0, "prizes_count": {}}
