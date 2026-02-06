"""
File: main.py
Mục đích: FastAPI Webhook Server cho Facebook Messenger (Multi-tenant)

Server này có 2 endpoints:
1. GET /webhook - Verify webhook với Facebook
2. POST /webhook - Nhận tin nhắn từ Messenger và xử lý

Multi-tenant: Mỗi Page có config riêng, được xác định qua recipient.id
"""

import os
from typing import Dict, Any
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import PlainTextResponse
from dotenv import load_dotenv

from graph import app_graph
from state import InvoiceState

# Load environment variables from parent directory
# (Python runs in python/ but .env is in root)
load_dotenv(dotenv_path="../.env")
load_dotenv()  # Also try current directory as fallback

# Import Database to retry creation
from database import Base, engine
# Create tables if not exist
Base.metadata.create_all(bind=engine)

# Deduplication Cache (Simple in-memory)
# Format: {message_id: timestamp}
PROCESSED_MESSAGES = {}
import time

# Khởi tạo FastAPI app
app = FastAPI(
    title="Facebook Messenger Invoice Bot (Multi-tenant)",
    description="Bot xử lý hóa đơn từ Messenger - Hỗ trợ nhiều Page/cửa hàng",
    version="2.0.0",
)

# Lấy verify token từ env
FB_VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN")


def process_invoice_async(sender_id: str, page_id: str, image_url: str):
    """
    Hàm xử lý invoice trong background task.
    LƯU Ý: Dùng def thường (không async) để FastAPI chạy trong ThreadPool,
    tránh block event loop vì app_graph.invoke là blocking.
    """
    print(f"\n{'=' * 60}")
    print(f"🚀 [Background Task] Bắt đầu xử lý invoice")
    print(f"   User: {sender_id}")
    print(f"   Page: {page_id}")
    print(f"{'=' * 60}\n")

    try:
        # Khởi tạo state ban đầu - bao gồm page_id để load tenant
        initial_state: InvoiceState = {
            "sender_id": sender_id,
            "page_id": page_id,
            "image_url": image_url,
            "tenant_config": None,
            "ocr_raw_text": None,
            "validation_result": None,
            "final_response": None,
            "error": None,
        }

        # Invoke LangGraph workflow
        final_state = app_graph.invoke(initial_state)

        print(f"\n{'=' * 60}")
        print(f"✅ [Background Task] Hoàn thành xử lý cho user: {sender_id}")
        print(f"{'=' * 60}\n")

    except Exception as e:
        print(f"\n{'=' * 60}")
        print(f"❌ [Background Task] Lỗi CRITICAL khi xử lý: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'=' * 60}\n")


@app.get("/webhook")
async def verify_webhook(request: Request):
    """
    Endpoint verify webhook với Facebook

    Facebook sẽ gửi GET request với các params:
    - hub.mode: "subscribe"
    - hub.verify_token: token bạn đã đặt
    - hub.challenge: random string cần trả về

    Returns:
        hub.challenge nếu verify_token khớp
    """
    print(f"📞 [GET /webhook] Nhận request verify từ Facebook")

    # Lấy các query params
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    print(f"  Mode: {mode}")
    print(f"  Token: {token}")
    print(f"  Challenge: {challenge}")

    # Kiểm tra mode và token
    if mode == "subscribe" and token == FB_VERIFY_TOKEN:
        print("✅ [GET /webhook] Webhook verified thành công!")
        return PlainTextResponse(content=challenge)
    else:
        print("❌ [GET /webhook] Verify token không khớp!")
        raise HTTPException(status_code=403, detail="Verification failed")


@app.post("/webhook")
async def receive_message(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint nhận tin nhắn từ Facebook Messenger

    Facebook sẽ gửi POST request với format:
    {
        "object": "page",
        "entry": [
            {
                "id": "PAGE_ID",  <-- Dùng để xác định tenant
                "messaging": [
                    {
                        "sender": {"id": "USER_ID"},
                        "recipient": {"id": "PAGE_ID"},  <-- Hoặc lấy từ đây
                        "message": {
                            "attachments": [
                                {
                                    "type": "image",
                                    "payload": {"url": "IMAGE_URL"}
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }

    Returns:
        200 OK ngay lập tức (Facebook yêu cầu phải trả về trong 20s)
    """
    print(f"\n📨 [POST /webhook] Nhận tin nhắn từ Facebook")

    try:
        # Parse JSON body
        body = await request.json()

        # Kiểm tra object type
        if body.get("object") != "page":
            return {"status": "ignored - not a page event"}

        # Duyệt qua các entries
        for entry in body.get("entry", []):
            page_id_entry = entry.get("id")
            
            for messaging_event in entry.get("messaging", []):
                sender_id = messaging_event.get("sender", {}).get("id")
                
                # Determine Page ID
                tenant_page_id = page_id_entry or messaging_event.get("recipient", {}).get("id")

                # Get message
                message = messaging_event.get("message", {})
                message_id = message.get("mid")
                
                # ========================================================
                # 1. DEDUPLICATION CHECK (Chống spam/retry)
                # ========================================================
                if message_id:
                    current_time = time.time()
                    
                    # Clean old cache (keep only last 10 mins)
                    # (Simple cleanup to avoid memory leak)
                    if len(PROCESSED_MESSAGES) > 1000:
                         keys_to_remove = [k for k, v in PROCESSED_MESSAGES.items() if current_time - v > 600]
                         for k in keys_to_remove:
                             del PROCESSED_MESSAGES[k]

                    if message_id in PROCESSED_MESSAGES:
                        print(f"  ⏭️  Bỏ qua Duplicate Message ID: {message_id}")
                        continue
                    
                    # Mark as processed
                    PROCESSED_MESSAGES[message_id] = current_time

                # ⚠️ QUAN TRỌNG: Bỏ qua tin nhắn echo (từ chính bot gửi đi)
                # Nếu không check này, bot sẽ xử lý lại tin nhắn của chính nó → vòng lặp vô hạn!
                if message.get("is_echo"):
                    print(f"  ⏭️  Bỏ qua echo message từ bot")
                    continue
                
                # Bỏ qua tin nhắn text (chỉ xử lý ảnh)
                if "text" in message and "attachments" not in message:
                    print(f"  ⏭️  Bỏ qua text message (không có ảnh)")
                    continue

                # Get attachments
                attachments = message.get("attachments", [])

                for attachment in attachments:
                    if attachment.get("type") == "image":
                        image_url = attachment.get("payload", {}).get("url")

                        if sender_id and tenant_page_id and image_url:
                            print(f"  📸 Ảnh từ user {sender_id} -> Page {tenant_page_id}")
                            print(f"     URL: {image_url[:50]}...")

                            # Thêm vào background tasks để xử lý ngầm
                            background_tasks.add_task(
                                process_invoice_async,
                                sender_id=sender_id,
                                page_id=tenant_page_id,
                                image_url=image_url,
                            )

                            print(f"  ✅ Đã thêm vào background task queue")

        # Trả về 200 OK ngay lập tức
        return {"status": "ok"}

    except Exception as e:
        print(f"❌ [POST /webhook] Lỗi: {str(e)}")
        # Vẫn trả về 200 để tránh Facebook retry liên tục
        return {"status": "error", "message": str(e)}


@app.get("/")
async def root():
    """
    Homepage đơn giản để kiểm tra server đang chạy
    """
    return {
        "message": "Facebook Messenger Invoice Bot API (Multi-tenant)",
        "version": "2.0.0",
        "status": "running",
        "endpoints": {
            "verify": "GET /webhook",
            "receive": "POST /webhook",
            "health": "GET /health",
        },
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    # Kiểm tra các env vars có được set chưa
    env_checks = {
        "FB_VERIFY_TOKEN": bool(os.getenv("FB_VERIFY_TOKEN")),
        "DEEPSEEK_API_KEY": bool(os.getenv("DEEPSEEK_API_KEY")),
    }
    
    # Kiểm tra Database (SQLite)
    db_ok = False
    try:
        from database import engine
        # Try to connect
        with engine.connect() as connection:
            db_ok = True
    except Exception:
        pass
    
    env_checks["DATABASE"] = db_ok

    all_ok = all(env_checks.values())

    return {
        "status": "healthy" if all_ok else "warning",
        "environment_variables": env_checks,
    }


@app.post("/update-token")
async def update_page_token(request: Request):
    """
    Admin endpoint để update Page Access Token
    Secured by: x-admin-secret header (using FB_VERIFY_TOKEN as secret)
    Body:
    {
        "page_id": "123456...",
        "access_token": "EAA..."
    }
    """
    secret = request.headers.get("x-admin-secret")
    
    # Simple auth using FB_VERIFY_TOKEN
    if not secret or secret != FB_VERIFY_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    try:
        body = await request.json()
        page_id = body.get("page_id")
        new_token = body.get("access_token")
        
        if not page_id or not new_token:
            raise HTTPException(status_code=400, detail="Missing page_id or access_token")
            
        from services import TenantService
        success = TenantService.update_token(page_id, new_token)
        
        if success:
            return {"status": "success", "message": f"Updated token for Page {page_id}"}
        else:
            raise HTTPException(status_code=404, detail=f"Page {page_id} not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    from config import settings

    print(f"\n{'=' * 60}")
    print(f"🚀 Starting FastAPI server on port {settings.port}")
    print(f"   Multi-tenant mode: ENABLED")
    print(f"   Reload Mode: {'ENABLED' if settings.reload else 'DISABLED'}")
    print(f"{'=' * 60}\n")

    # Chạy server
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload, 
    )
