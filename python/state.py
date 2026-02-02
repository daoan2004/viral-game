"""
File: state.py
Mục đích: Định nghĩa State cho LangGraph workflow

State này sẽ lưu trữ toàn bộ thông tin trong quá trình xử lý hóa đơn,
từ khi nhận ảnh cho đến khi gửi kết quả về Messenger.

Hỗ trợ Multi-tenant: Mỗi Page có config riêng được load từ Firebase.
"""

from typing import TypedDict, Optional, List


class TenantConfig(TypedDict):
    """
    Config của một tenant (cửa hàng/Page)
    Được load từ Firebase Firestore collection 'tenants'
    """
    
    page_id: str
    shop_name: str
    shop_patterns: List[str]  # Các từ khóa để nhận diện hóa đơn
    page_access_token: str
    is_active: bool
    
    # Cấu hình giải thưởng
    prizes: List[dict]  # [{name, rate, emoji, instruction}]
    
    # Tin nhắn tùy chỉnh (optional)
    messages: Optional[dict]  # {invalid, duplicate, thank_you}


class InvoiceState(TypedDict):
    """
    State object cho LangGraph workflow xử lý hóa đơn.
    
    Attributes:
        # Thông tin cơ bản
        sender_id: Facebook User ID của người gửi
        page_id: Facebook Page ID (để xác định tenant)
        image_url: URL của ảnh hóa đơn cần xử lý
        
        # Tenant config (load từ Firebase)
        tenant_config: Config của cửa hàng tương ứng với page_id
        
        # Kết quả xử lý
        ocr_raw_text: Text thô được trích xuất từ OCR (Step 1)
        validation_result: Kết quả validation từ DeepSeek AI (Step 2)
            Format: {"valid": bool, "reason": str, "data": {"invoice_id": str, "shop_name": str}}
        final_response: Tin nhắn cuối cùng gửi về cho user
        
        # Error handling
        error: Lưu thông tin lỗi nếu có (optional)
    """
    
    # Thông tin cơ bản
    sender_id: str
    page_id: str
    image_url: str
    
    # Tenant config
    tenant_config: Optional[TenantConfig]
    
    # Kết quả xử lý
    ocr_raw_text: Optional[str]
    validation_result: Optional[dict]
    final_response: Optional[str]
    
    # Error
    error: Optional[str]
