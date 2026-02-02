"""
Script test webhook locally (không cần Facebook)
Dùng để test flow xử lý invoice
"""

import requests
import json

# URL local server
BASE_URL = "http://localhost:8080"


def test_health_check():
    """Test health check endpoint"""
    print("\n" + "=" * 60)
    print("🏥 Testing Health Check...")
    print("=" * 60)

    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    return response.status_code == 200


def test_webhook_verify():
    """Test webhook verification (GET)"""
    print("\n" + "=" * 60)
    print("🔐 Testing Webhook Verification...")
    print("=" * 60)

    # Thay YOUR_TOKEN bằng giá trị FB_VERIFY_TOKEN trong .env
    params = {
        "hub.mode": "subscribe",
        "hub.verify_token": "YOUR_VERIFY_TOKEN_HERE",  # ⚠️ Sửa giá trị này
        "hub.challenge": "test_challenge_12345",
    }

    response = requests.get(f"{BASE_URL}/webhook", params=params)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

    return response.status_code == 200


def test_webhook_message():
    """Test webhook message processing (POST)"""
    print("\n" + "=" * 60)
    print("📨 Testing Message Processing...")
    print("=" * 60)

    # Sample payload giống Facebook gửi
    payload = {
        "object": "page",
        "entry": [
            {
                "id": "PAGE_ID",
                "time": 1234567890,
                "messaging": [
                    {
                        "sender": {"id": "TEST_USER_123"},
                        "recipient": {"id": "PAGE_ID"},
                        "timestamp": 1234567890,
                        "message": {
                            "mid": "mid.123456",
                            "attachments": [
                                {
                                    "type": "image",
                                    "payload": {
                                        # URL ảnh hóa đơn mẫu (thay bằng URL thật để test OCR)
                                        "url": "https://web.ts24.com.vn/gallery"
                                    },
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }

    print("Payload:", json.dumps(payload, indent=2))
    print("\nGửi request...")

    response = requests.post(
        f"{BASE_URL}/webhook",
        json=payload,
        headers={"Content-Type": "application/json"},
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    if response.status_code == 200:
        print("\n✅ Webhook đã nhận message!")
        print("⏳ Đang xử lý trong background...")
        print("💡 Kiểm tra console của server để xem logs xử lý")

    return response.status_code == 200


def main():
    print("\n" + "=" * 60)
    print("🧪 Facebook Messenger Invoice Bot - Test Suite")
    print("=" * 60)
    print("\n⚠️  Đảm bảo server đang chạy (python main.py)")
    input("Nhấn Enter để bắt đầu test...\n")

    # Test 1: Health Check
    health_ok = test_health_check()

    if not health_ok:
        print("\n❌ Health check failed! Kiểm tra server và .env file")
        return

    # Test 2: Webhook Verify
    print("\n⚠️  Lưu ý: Test webhook verify sẽ cần giá trị FB_VERIFY_TOKEN đúng")
    if input("Bạn đã sửa FB_VERIFY_TOKEN trong code? (y/n): ").lower() == "y":
        test_webhook_verify()
    else:
        print("⏭️  Bỏ qua test webhook verify")

    # Test 3: Message Processing
    print("\n⚠️  Lưu ý: Test này sẽ trigger background processing")
    if input("Test message processing? (y/n): ").lower() == "y":
        test_webhook_message()
    else:
        print("⏭️  Bỏ qua test message processing")

    print("\n" + "=" * 60)
    print("✅ Tests hoàn tất!")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Không thể kết nối đến server!")
        print("Vui lòng chạy: python main.py")
    except KeyboardInterrupt:
        print("\n\n⏹️  Test bị dừng bởi user")
