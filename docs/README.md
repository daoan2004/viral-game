# 🤖 Facebook Messenger Invoice Bot

Bot xử lý hóa đơn tự động qua Facebook Messenger sử dụng LangGraph + DeepSeek AI.

## 📋 Tính năng

1. **Nhận ảnh hóa đơn** từ user qua Messenger
2. **OCR** - Trích xuất text từ ảnh (sử dụng pytesseract)
3. **AI Validation** - Validation và extract thông tin bằng DeepSeek AI
4. **Trả kết quả** - Gửi kết quả xử lý về Messenger

## 🛠️ Tech Stack

- **Python 3.10+**
- **FastAPI** - Webhook server
- **LangGraph** - Orchestration workflow
- **LangChain** - LLM integration
- **DeepSeek AI** - Validation & extraction
- **pytesseract** - OCR engine

## 📂 Cấu trúc Project

```
Viral game/
├── main.py              # FastAPI webhook server
├── graph.py             # LangGraph workflow setup
├── nodes.py             # Các node functions (OCR, validate, reply)
├── state.py             # State definition cho workflow
├── requirements.txt     # Python dependencies
├── .env.example         # Template cho environment variables
└── README.md           # File này
```

## 🚀 Hướng dẫn Setup

### 1. Cài đặt Dependencies

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

### 2. Cài đặt Tesseract OCR (Optional)

**Windows:**
- Download từ: https://github.com/UB-Mannheim/tesseract/wiki
- Cài đặt và thêm vào PATH
- Download language pack tiếng Việt (`vie.traineddata`)

**Linux:**
```bash
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-vie
```

**Mac:**
```bash
brew install tesseract
brew install tesseract-lang
```

> ⚠️ **Lưu ý**: Nếu không cài tesseract, bot sẽ sử dụng OCR giả lập cho demo.

### 3. Cấu hình Environment Variables

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Điền các giá trị vào `.env`:

```env
FB_PAGE_ACCESS_TOKEN=your_page_access_token_here
FB_VERIFY_TOKEN=your_custom_verify_token
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=8000
```

#### Lấy Facebook Page Access Token:

1. Truy cập https://developers.facebook.com/apps/
2. Tạo app mới (hoặc chọn app có sẵn)
3. Thêm product "Messenger"
4. Vào **Settings** > **Messenger** > **Access Tokens**
5. Generate Token cho Page của bạn

#### Lấy DeepSeek API Key:

1. Đăng ký tài khoản tại https://platform.deepseek.com/
2. Vào **API Keys** và tạo key mới
3. Copy và paste vào `.env`

### 4. Chạy FastAPI Server

```bash
python main.py
```

Server sẽ chạy tại: `http://localhost:8000`

Kiểm tra health check: `http://localhost:8000/health`

### 5. Setup Facebook Webhook

#### a) Expose local server ra internet (dùng ngrok)

```bash
# Cài đặt ngrok
# Tải từ: https://ngrok.com/download

# Chạy ngrok
ngrok http 8000
```

Ngrok sẽ cung cấp URL public, ví dụ: `https://abc123.ngrok.io`

#### b) Cấu hình Webhook trên Facebook

1. Vào Facebook App của bạn
2. **Messenger** > **Settings** > **Webhooks**
3. Click **Add Callback URL**:
   - **Callback URL**: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: Giá trị `FB_VERIFY_TOKEN` trong `.env`
4. Click **Verify and Save**
5. Subscribe to events:
   - ✅ `messages`
   - ✅ `messaging_postbacks`

#### c) Subscribe Page to App

1. Trong phần Webhooks, chọn Page muốn subscribe
2. Click **Subscribe**

## 📝 Cách sử dụng

1. Mở Messenger và nhắn tin cho Page của bạn
2. Gửi ảnh hóa đơn
3. Bot sẽ xử lý và trả về kết quả validation

## 🔄 Workflow Flow

```
User gửi ảnh
    ↓
FastAPI nhận webhook
    ↓
Background Task khởi chạy LangGraph
    ↓
┌─────────────────────────────────────┐
│  LangGraph Workflow:                │
│                                     │
│  1. Download & OCR                 │
│      ↓                             │
│  2. Validate với DeepSeek AI       │
│      ↓                             │
│  3. Build response message         │
│      ↓                             │
│  4. Gửi về Messenger               │
└─────────────────────────────────────┘
    ↓
User nhận kết quả
```

## 🧪 Testing

### Test Webhook Verify (GET)

```bash
curl "http://localhost:8000/webhook?hub.mode=subscribe&hub.verify_token=your_verify_token&hub.challenge=test123"
```

Kết quả mong đợi: `test123`

### Test Message Processing (POST)

```bash
curl -X POST http://localhost:8000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123456"},
        "message": {
          "attachments": [{
            "type": "image",
            "payload": {"url": "https://example.com/invoice.jpg"}
          }]
        }
      }]
    }]
  }'
```

## 🐛 Troubleshooting

### Lỗi: "DEEPSEEK_API_KEY không được cấu hình"
- Kiểm tra file `.env` có tồn tại
- Đảm bảo `DEEPSEEK_API_KEY` đã được set
- Restart server sau khi sửa `.env`

### Lỗi: "pytesseract không khả dụng"
- Cài đặt Tesseract OCR (xem phần Setup)
- Hoặc để bot dùng OCR giả lập cho demo

### Webhook không nhận được tin nhắn
- Kiểm tra ngrok còn chạy không
- Verify lại webhook URL trên Facebook
- Kiểm tra Page đã subscribe vào app chưa
- Xem logs của FastAPI server

### DeepSeek không trả về JSON đúng format
- Kiểm tra API key còn credit không
- Xem response trong logs để debug
- Code đã có xử lý parse JSON từ markdown code blocks

## 📚 API Endpoints

### `GET /`
Homepage - Thông tin cơ bản về API

### `GET /health`
Health check - Kiểm tra env vars và trạng thái server

### `GET /webhook`
Facebook webhook verification

### `POST /webhook`
Nhận messages từ Facebook Messenger

## 🔐 Security Notes

- **Không commit file `.env`** vào git
- File `.gitignore` nên có:
  ```
  .env
  __pycache__/
  *.pyc
  venv/
  ```
- Giữ `FB_PAGE_ACCESS_TOKEN` bí mật
- Rotate API keys định kỳ

## 📦 Dependencies chính

| Package | Version | Mục đích |
|---------|---------|----------|
| fastapi | 0.109.0 | Web framework |
| langchain | 0.1.0 | LLM integration |
| langgraph | 0.0.20 | Workflow orchestration |
| pytesseract | 0.3.10 | OCR engine |
| requests | 2.31.0 | HTTP requests |
| python-dotenv | 1.0.0 | Environment variables |

## 🎯 Roadmap

- [ ] Thêm caching cho OCR results
- [ ] Support nhiều loại hóa đơn (siêu thị, nhà hàng, taxi...)
- [ ] Lưu trữ history vào database
- [ ] Dashboard để xem thống kê
- [ ] Support multi-language
- [ ] Retry logic cho API calls

## 📄 License

MIT License - Feel free to use for your projects!

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

## 💬 Support

Nếu gặp vấn đề, hãy:
1. Kiểm tra phần Troubleshooting
2. Xem logs của server
3. Tạo issue mới với đầy đủ thông tin lỗi

---

Made with ❤️ using FastAPI + LangGraph + DeepSeek AI
