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

# Load environment variables
load_dotenv()

# Khởi tạo FastAPI app
app = FastAPI(
    title="Facebook Messenger Invoice Bot (Multi-tenant)",
    description="Bot xử lý hóa đơn từ Messenger - Hỗ trợ nhiều Page/cửa hàng",
    version="2.0.0",
)

# Lấy verify token từ env
FB_VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN")


async def process_invoice_async(sender_id: str, page_id: str, image_url: str):
    """
    Hàm xử lý invoice trong background task

    Args:
        sender_id: Facebook User ID
        page_id: Facebook Page ID (để xác định tenant)
        image_url: URL của ảnh hóa đơn
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
        print(f"❌ [Background Task] Lỗi khi xử lý: {str(e)}")
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
            # Lấy Page ID từ entry (cách 1)
            page_id = entry.get("id")
            
            for messaging_event in entry.get("messaging", []):
                # Lấy sender ID
                sender_id = messaging_event.get("sender", {}).get("id")
                
                # Lấy Page ID từ recipient (cách 2 - backup)
                if not page_id:
                    page_id = messaging_event.get("recipient", {}).get("id")

                # Kiểm tra có message không
                message = messaging_event.get("message", {})

                # Kiểm tra có attachments (ảnh) không
                attachments = message.get("attachments", [])

                for attachment in attachments:
                    if attachment.get("type") == "image":
                        # Lấy URL ảnh
                        image_url = attachment.get("payload", {}).get("url")

                        if sender_id and page_id and image_url:
                            print(f"  📸 Ảnh từ user {sender_id} -> Page {page_id}")
                            print(f"     URL: {image_url[:50]}...")

                            # Thêm vào background tasks để xử lý ngầm
                            background_tasks.add_task(
                                process_invoice_async,
                                sender_id=sender_id,
                                page_id=page_id,
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
        "FB_PAGE_ACCESS_TOKEN": bool(os.getenv("FB_PAGE_ACCESS_TOKEN")),
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
