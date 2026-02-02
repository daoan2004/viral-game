"""
File: graph.py
Mục đích: Xây dựng LangGraph workflow cho việc xử lý hóa đơn và quay thưởng

Workflow flow (Multi-tenant):
START -> Load Tenant -> OCR -> Validate Invoice -> Lucky Draw -> Send Message -> END

Mô tả các bước:
0. Load Tenant: Lấy config từ Firebase theo page_id
1. OCR: Tải ảnh và trích xuất text
2. Validate Invoice: Gọi DeepSeek AI kiểm tra theo patterns của tenant
3. Lucky Draw: Kiểm tra trùng (Firebase) + quay thưởng theo config tenant
4. Send Message: Gửi kết quả về Messenger bằng token của tenant
"""

from langgraph.graph import StateGraph, END
from state import InvoiceState
from nodes import (
    load_tenant_node,
    download_and_ocr_node,
    validate_invoice_node,
    lucky_draw_node,
    send_message_node,
)


def create_invoice_graph():
    """
    Tạo và compile StateGraph cho invoice processing workflow
    
    Workflow:
        Load Tenant -> OCR -> Validate -> Lucky Draw -> Send Message -> END
    
    Returns:
        Compiled graph có thể invoke với InvoiceState
    """
    
    # Khởi tạo StateGraph với InvoiceState
    workflow = StateGraph(InvoiceState)
    
    # ========================================
    # THÊM CÁC NODES VÀO GRAPH
    # ========================================
    
    # Node 0: Load Tenant - Lấy config từ Firebase
    workflow.add_node("load_tenant", load_tenant_node)
    
    # Node 1: OCR - Tải ảnh và trích xuất text
    workflow.add_node("ocr", download_and_ocr_node)
    
    # Node 2: Validate Invoice - Gọi DeepSeek AI kiểm tra
    workflow.add_node("validate_invoice", validate_invoice_node)
    
    # Node 3: Lucky Draw - Kiểm tra trùng + quay thưởng
    workflow.add_node("lucky_draw", lucky_draw_node)
    
    # Node 4: Send Message - Gửi kết quả về Messenger
    workflow.add_node("send_message", send_message_node)
    
    # ========================================
    # ĐỊNH NGHĨA LUỒNG XỬ LÝ (EDGES)
    # ========================================
    
    # Entry point: Bắt đầu từ Load Tenant
    workflow.set_entry_point("load_tenant")
    
    # Load Tenant -> OCR
    workflow.add_edge("load_tenant", "ocr")
    
    # OCR -> Validate Invoice
    workflow.add_edge("ocr", "validate_invoice")
    
    # Validate Invoice -> Lucky Draw
    workflow.add_edge("validate_invoice", "lucky_draw")
    
    # Lucky Draw -> Send Message
    workflow.add_edge("lucky_draw", "send_message")
    
    # Send Message -> END
    workflow.add_edge("send_message", END)
    
    # ========================================
    # COMPILE GRAPH
    # ========================================
    
    app_graph = workflow.compile()
    
    print("✅ [Graph] LangGraph workflow đã được compile thành công")
    print("   Flow: Load Tenant -> OCR -> Validate -> Lucky Draw -> Send Message -> END")
    
    return app_graph


# Tạo graph instance để sử dụng trong main.py
app_graph = create_invoice_graph()
