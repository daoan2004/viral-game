"""
File: nodes.py
Mục đích: Chứa các node functions cho LangGraph workflow

Pipeline xử lý hóa đơn (Multi-tenant):
1. Load Tenant: Lấy config từ Firebase theo page_id
2. OCR Node: Tải ảnh và trích xuất text
3. Validate Invoice Node: Gọi DeepSeek AI validate theo tenant patterns
4. Lucky Draw Node: Kiểm tra trùng (Firebase) + quay thưởng theo tenant config
5. Send Message Node: Gửi tin nhắn bằng token của tenant
"""

import os
import json
import random
from typing import Dict, Any
import requests

# Import LangChain components
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from state import InvoiceState
from services import TenantService, InvoiceService

# ============================================================================
# IMPORT DEPENDENCIES
# ============================================================================
import os
import json
import random
from typing import Dict, Any
import requests

# Import LangChain components
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

from state import InvoiceState
from services import TenantService, InvoiceService



# ============================================================================
# NODE 0: LOAD TENANT CONFIG (Mới)
# ============================================================================

def load_tenant_node(state: InvoiceState) -> Dict[str, Any]:
    """
    Node 0: Load config của tenant từ Firebase theo page_id
    
    Args:
        state: InvoiceState chứa page_id
        
    Returns:
        Dict với key 'tenant_config' chứa config của tenant
    """
    print(f"🏪 [Load Tenant Node] Đang load config cho page: {state['page_id']}")
    
    page_id = state.get("page_id")
    
    if not page_id:
        return {
            "tenant_config": None,
            "error": "Không xác định được Page ID"
        }
    
    # Load tenant từ Firebase
    tenant_config = TenantService.get_tenant_by_page_id(page_id)
    
    if not tenant_config:
        return {
            "tenant_config": None,
            "error": f"Không tìm thấy cấu hình cho Page ID: {page_id}"
        }
    
    if not tenant_config.get("is_active", False):
        return {
            "tenant_config": None,
            "error": f"Page {page_id} đã bị vô hiệu hóa"
        }
    
    print(f"✅ [Load Tenant Node] Loaded: {tenant_config.get('shop_name')}")
    
    return {"tenant_config": tenant_config, "error": None}


# ============================================================================
# NODE 1: OCR NODE
# ============================================================================

def download_and_ocr_node(state: InvoiceState) -> Dict[str, Any]:
    """
    Node 1: Sử dụng Google Gemini Vision API để OCR ảnh hóa đơn
    
    Args:
        state: InvoiceState chứa image_url
        
    Returns:
        Dict với key 'ocr_raw_text' chứa kết quả OCR
    """
    print(f"📥 [OCR Node] Đang xử lý ảnh từ: {state['image_url']}")
    
    # Kiểm tra có lỗi từ bước trước không
    if state.get("error"):
        return {"ocr_raw_text": None}
    
    try:
        # Sử dụng Google Gemini Vision API
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage
        import base64
        
        # Get Gemini API key
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise ValueError("GEMINI_API_KEY not found in environment")
        
        # Download and encode image
        img_response = requests.get(state["image_url"], timeout=10)
        img_response.raise_for_status()
        img_base64 = base64.b64encode(img_response.content).decode('utf-8')
        
        # Initialize Gemini model
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",  # Fast and free
            google_api_key=gemini_key,
            temperature=0
        )
        
        # Create message with image
        message = HumanMessage(
            content=[
                {
                    "type": "text",
                    "text": """Bạn là một OCR expert. Hãy trích xuất TẤT CẢ text từ ảnh hóa đơn này.

Yêu cầu:
- Giữ nguyên format và layout của hóa đơn
- Bao gồm: tên cửa hàng, địa chỉ, số hóa đơn, danh sách món, giá tiền
- Đọc chính xác các số tiền (quan trọng!)
- Không bỏ sót bất kỳ thông tin nào
- CHỈ trả về text đã OCR, KHÔNG giải thích thêm

VÍ DỤ OUTPUT:
```
Em An Tinh Nghịch
Địa chỉ: 123 Đường ABC
Số HĐ: HD-123456
------------------------
1x Trà sữa       45.000đ
2x Bánh flan     30.000đ
------------------------
Tổng cộng:       75.000đ
```"""
                },
                {
                    "type": "image_url",
                    "image_url": f"data:image/jpeg;base64,{img_base64}"
                }
            ]
        )
        
        # Call Gemini API
        response = llm.invoke([message])
        ocr_text = response.content
        
        # Validate response
        if not ocr_text or len(ocr_text) < 20:
            raise ValueError("Gemini returned empty or invalid OCR result")
        
        print(f"✅ [OCR Node] OCR thành công với Gemini Vision")
        print(f"📝 [OCR Node] === RAW OCR TEXT ===")
        print(ocr_text[:500] if len(ocr_text) > 500 else ocr_text)
        print(f"📝 [OCR Node] === END OCR TEXT ===")
        
        return {"ocr_raw_text": ocr_text.strip(), "error": None}
        
    except Exception as e:
        error_msg = f"Lỗi OCR với Gemini: {str(e)}"
        print(f"❌ [OCR Node] {error_msg}")
        return {"ocr_raw_text": None, "error": error_msg}





# ============================================================================
# NODE 2: VALIDATE INVOICE NODE (Dynamic theo tenant)
# ============================================================================

def validate_invoice_node(state: InvoiceState) -> Dict[str, Any]:
    """
    Node 2: Gọi DeepSeek AI để validate hóa đơn theo patterns của tenant

    Args:
        state: InvoiceState chứa ocr_raw_text và tenant_config

    Returns:
        Dict với key 'validation_result' chứa kết quả từ AI
    """
    print(f"🤖 [Validate Node] Đang gọi DeepSeek AI để validate...")

    # Kiểm tra có lỗi từ bước trước không
    if state.get("error"):
        return {
            "validation_result": {
                "valid": False,
                "reason": state.get("error", "Lỗi hệ thống"),
                "data": {"invoice_id": None, "shop_name": None}
            }
        }

    # Kiểm tra có tenant config không
    tenant = state.get("tenant_config")
    if not tenant:
        return {
            "validation_result": {
                "valid": False,
                "reason": "Không tìm thấy cấu hình cửa hàng",
                "data": {"invoice_id": None, "shop_name": None}
            }
        }

    # Kiểm tra có ocr_raw_text không
    ocr_text = state.get("ocr_raw_text")
    if not ocr_text:
        return {
            "validation_result": {
                "valid": False,
                "reason": "Không thể đọc được nội dung ảnh. Vui lòng gửi ảnh rõ hơn.",
                "data": {"invoice_id": None, "shop_name": None}
            }
        }

    try:
        # Khởi tạo DeepSeek client
        deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")

        if not deepseek_api_key:
            raise ValueError("DEEPSEEK_API_KEY không được cấu hình")

        llm = ChatOpenAI(
            model="deepseek-chat",
            api_key=deepseek_api_key,
            base_url="https://api.deepseek.com",
            temperature=0.1,
        )

        # Lấy thông tin tenant để tạo prompt động
        shop_name = tenant.get("shop_name", "Cửa hàng")
        shop_patterns = tenant.get("shop_patterns", [shop_name])
        patterns_str = ", ".join([f'"{p}"' for p in shop_patterns])

        # System prompt ĐỘNG theo tenant
        system_prompt = f"""Bạn là AI kiểm duyệt hóa đơn cho chương trình khuyến mãi của "{shop_name}".

NHIỆM VỤ:

1. KIỂM TRA TÊN QUÁN (quan trọng nhất):
   - Tìm tên quán/nhà hàng/cửa hàng trong text (thường ở đầu hóa đơn)
   - So khớp với các từ khóa: {patterns_str}
   - Lưu ý: OCR có thể sai chính tả nhẹ, hãy linh hoạt nhận dạng
   - VD: "Em An Tinh Nghịch" có thể bị OCR thành "Em An Tĩnh Nghịch", "Em An Tinh Nghich" - vẫn chấp nhận
   - Nếu KHÔNG tìm thấy tên quán khớp với từ khóa -> valid: false

2. TRÍCH XUẤT MÃ HÓA ĐƠN:
   - Tìm số hóa đơn/mã đơn hàng trong text
   - Các pattern thường gặp:
     * "Số HĐ:", "Mã HĐ:", "Hóa đơn số:", "Invoice:", "Bill No:", "#"
     * "Đơn hàng:", "Order:", "Mã đơn:"
     * Dãy số/chữ duy nhất ở đầu hoặc cuối hóa đơn
   - Nếu không tìm thấy mã cụ thể, tạo mã từ thông tin có sẵn (ngày + giờ + tổng tiền)
   - VÍ DỤ: Nếu thấy "27/01/2026 14:30" và "Tổng: 150.000đ" -> invoice_id = "270126-1430-150K"

3. QUY TẮC OUTPUT:
   - valid = true: Chỉ khi tên quán khớp với từ khóa
   - valid = false: Khi không tìm thấy tên quán hoặc tên quán khác
   - invoice_id: KHÔNG ĐƯỢC để null nếu valid=true, phải tạo mã nếu không tìm thấy
   - shop_name: Tên quán phát hiện được trên hóa đơn

QUAN TRỌNG: Chỉ trả về JSON thuần, không markdown, không giải thích thêm.

OUTPUT FORMAT:
{{
    "valid": true/false,
    "reason": "Hóa đơn hợp lệ" hoặc "Lý do từ chối cụ thể",
    "data": {{
        "invoice_id": "mã hóa đơn (bắt buộc nếu valid=true)",
        "shop_name": "tên quán phát hiện được"
    }}
}}"""

        # User message chứa OCR text
        user_message = f"Kiểm tra hóa đơn sau:\n\n{ocr_text}"

        # Gọi DeepSeek
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message),
        ]

        response = llm.invoke(messages)
        response_text = response.content.strip()

        print(f"📝 [Validate Node] === AI RESPONSE ===")
        print(response_text)
        print(f"📝 [Validate Node] === END AI RESPONSE ===")

        # Parse JSON response
        json_text = response_text
        if "```json" in json_text:
            json_text = json_text.split("```json")[1].split("```")[0].strip()
        elif "```" in json_text:
            json_text = json_text.split("```")[1].split("```")[0].strip()

        validation_result = json.loads(json_text)

        # Đảm bảo có đủ các field cần thiết
        if "valid" not in validation_result:
            validation_result["valid"] = False
        if "reason" not in validation_result:
            validation_result["reason"] = "Không xác định"
        if "data" not in validation_result:
            validation_result["data"] = {"invoice_id": None, "shop_name": None}

        print(f"✅ [Validate Node] Kết quả: valid={validation_result['valid']}")

        return {"validation_result": validation_result, "error": None}

    except json.JSONDecodeError as e:
        error_msg = f"Không thể parse JSON từ AI: {str(e)}"
        print(f"❌ [Validate Node] {error_msg}")
        return {
            "validation_result": {
                "valid": False,
                "reason": "Hệ thống đang bận, vui lòng thử lại sau.",
                "data": {"invoice_id": None, "shop_name": None}
            },
            "error": error_msg,
        }
    except Exception as e:
        error_msg = f"Lỗi khi gọi DeepSeek API: {str(e)}"
        print(f"❌ [Validate Node] {error_msg}")
        return {
            "validation_result": {
                "valid": False,
                "reason": "Hệ thống đang bận, vui lòng thử lại sau.",
                "data": {"invoice_id": None, "shop_name": None}
            },
            "error": error_msg,
        }


# ============================================================================
# NODE 3: LUCKY DRAW NODE (Dùng Firebase + Dynamic prizes)
# ============================================================================

def lucky_draw_node(state: InvoiceState) -> Dict[str, Any]:
    """
    Node 3: Kiểm tra trùng lặp (Firebase) và quay thưởng theo config của tenant

    Args:
        state: InvoiceState chứa validation_result và tenant_config

    Returns:
        Dict với key 'final_response' chứa tin nhắn kết quả
    """
    print(f"🎰 [Lucky Draw Node] Đang xử lý quay thưởng...")

    validation_result = state.get("validation_result", {})
    tenant = state.get("tenant_config", {})
    
    shop_name = tenant.get("shop_name", "Cửa hàng")
    page_id = state.get("page_id", "")
    sender_id = state.get("sender_id", "")

    # ========================================
    # BƯỚC 1: Kiểm tra validation có hợp lệ không
    # ========================================
    if not validation_result.get("valid", False):
        reason = validation_result.get("reason", "Hóa đơn không hợp lệ")
        detected_shop = validation_result.get("data", {}).get("shop_name")
        
        # Lấy message tùy chỉnh từ tenant config hoặc dùng default
        messages = tenant.get("messages", {})
        invalid_template = messages.get(
            "invalid", 
            "Chương trình chỉ áp dụng cho hóa đơn từ {shop_name}. Hãy ghé {shop_name} để tham gia nhé!"
        )
        
        if detected_shop:
            final_response = f"""❌ Rất tiếc! Hóa đơn không hợp lệ.

📋 Lý do: {reason}
🏪 Quán phát hiện: {detected_shop}

{invalid_template.format(shop_name=shop_name)}"""
        else:
            final_response = f"""❌ Rất tiếc! Hóa đơn không hợp lệ.

📋 Lý do: {reason}

{invalid_template.format(shop_name=shop_name)}"""

        print(f"⛔ [Lucky Draw Node] Từ chối: {reason}")
        return {"final_response": final_response}

    # ========================================
    # BƯỚC 2: Kiểm tra trùng lặp (Firebase)
    # ========================================
    invoice_id = validation_result.get("data", {}).get("invoice_id")
    
    # Fallback: Tạo invoice_id nếu AI không extract được
    if not invoice_id and validation_result.get("valid"):
        import hashlib
        from datetime import datetime
        # Tạo ID từ sender_id + timestamp
        timestamp = datetime.now().strftime("%d%m%y-%H%M%S")
        hash_suffix = hashlib.md5(f"{sender_id}{timestamp}".encode()).hexdigest()[:6].upper()
        invoice_id = f"AUTO-{timestamp}-{hash_suffix}"
        print(f"⚠️ [Lucky Draw Node] Tạo invoice_id tự động: {invoice_id}")

    if invoice_id:
        # Kiểm tra trong Firebase
        if InvoiceService.is_invoice_used(invoice_id, page_id):
            messages = tenant.get("messages", {})
            duplicate_msg = messages.get(
                "duplicate",
                "Hãy quay lại {shop_name} để nhận hóa đơn mới nhé!"
            )
            
            final_response = f"""⚠️ Hóa đơn này đã được sử dụng rồi!

🔢 Mã HĐ: {invoice_id}

Mỗi hóa đơn chỉ được quay thưởng 1 lần.
{duplicate_msg.format(shop_name=shop_name)}"""

            print(f"🔄 [Lucky Draw Node] Trùng lặp: {invoice_id}")
            return {"final_response": final_response}

    # ========================================
    # BƯỚC 3: Quay thưởng random theo config của tenant
    # ========================================
    prizes = tenant.get("prizes", [])
    
    if not prizes:
        # Fallback nếu không có prizes config
        prizes = [
            {"name": "Chúc may mắn lần sau", "rate": 1.0, "emoji": "🍀", "instruction": "Quay lại lần sau nhé!"}
        ]
    
    prize = _spin_lucky_wheel(prizes)

    # Lưu vào Firebase
    if invoice_id:
        InvoiceService.mark_invoice_used(
            invoice_id=invoice_id,
            page_id=page_id,
            sender_id=sender_id,
            prize_won=prize["name"]
        )

    # Lấy message cảm ơn
    messages = tenant.get("messages", {})
    thank_you_msg = messages.get("thank_you", "Cảm ơn bạn đã ủng hộ {shop_name}!")

    final_response = f"""🎊 CHÚC MỪNG BẠN ĐÃ THAM GIA QUAY THƯỞNG!

🔢 Mã HĐ: {invoice_id or "N/A"}
━━━━━━━━━━━━━━━━━━━━

{prize.get('emoji', '🎁')} Kết quả: {prize['name'].upper()}!

{prize.get('instruction', '')}

{thank_you_msg.format(shop_name=shop_name)} 💚"""

    print(f"🎁 [Lucky Draw Node] Kết quả: {prize['name']}")
    return {"final_response": final_response}


def _spin_lucky_wheel(prizes: list) -> dict:
    """
    Quay vòng quay may mắn theo tỉ lệ từ config

    Args:
        prizes: List các giải thưởng với rate
        
    Returns:
        Dict chứa thông tin giải thưởng
    """
    rand = random.random()

    cumulative = 0.0
    for prize in prizes:
        cumulative += prize.get("rate", 0)
        if rand < cumulative:
            return prize

    # Fallback - trả về giải cuối cùng
    return prizes[-1] if prizes else {"name": "Không có giải", "emoji": "❌", "instruction": ""}


# ============================================================================
# NODE 4: SEND MESSAGE NODE (Dùng token của tenant)
# ============================================================================

def send_message_node(state: InvoiceState) -> Dict[str, Any]:
    """
    Node 4: Gửi tin nhắn trả về cho user qua Facebook Messenger
    Sử dụng Page Access Token của tenant

    Args:
        state: InvoiceState chứa sender_id, tenant_config và final_response

    Returns:
        Dict rỗng (kết thúc workflow)
    """
    print(f"📤 [Send Message Node] Đang gửi tin nhắn về Messenger...")

    sender_id = state["sender_id"]
    message_text = state.get("final_response")
    
    # Nếu có lỗi và không có final_response
    if not message_text and state.get("error"):
        message_text = f"❌ Đã xảy ra lỗi: {state['error']}\n\nVui lòng thử lại sau!"
    elif not message_text:
        message_text = "Đã xử lý xong!"

    # Lấy Page Access Token từ tenant config HOẶC env (fallback)
    tenant = state.get("tenant_config", {})
    page_access_token = tenant.get("access_token") or os.getenv("FB_PAGE_ACCESS_TOKEN")

    if not page_access_token:
        print("❌ [Send Message Node] Không tìm thấy Page Access Token")
        return {"error": "Missing Page Access Token"}

    try:
        # URL của Facebook Send API
        url = "https://graph.facebook.com/v18.0/me/messages"

        # Payload
        payload = {
            "recipient": {"id": sender_id},
            "message": {"text": message_text},
            "messaging_type": "RESPONSE",
        }

        # Headers
        headers = {"Content-Type": "application/json"}

        # Params
        params = {"access_token": page_access_token}

        # Gửi request
        response = requests.post(
            url, json=payload, headers=headers, params=params, timeout=10
        )

        response.raise_for_status()

        print(f"✅ [Send Message Node] Gửi tin nhắn thành công đến {sender_id}")

        return {}

    except Exception as e:
        error_msg = f"Lỗi khi gửi tin nhắn Facebook: {str(e)}"
        print(f"❌ [Send Message Node] {error_msg}")
        return {"error": error_msg}
