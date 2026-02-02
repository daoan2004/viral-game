# ⚡ Quick Start Guide

Hướng dẫn nhanh để chạy bot trong vòng 5 phút!

## 🎯 Bước 1: Setup (Chạy 1 lần)

### Windows:
```bash
# Double-click hoặc chạy trong terminal
setup.bat
```

### Linux/Mac:
```bash
# Tạo virtual environment
python3 -m venv venv
source venv/bin/activate

# Cài dependencies
pip install -r requirements.txt

# Tạo file .env
cp .env.example .env
```

## 🔑 Bước 2: Cấu hình API Keys

Mở file `.env` và điền 3 giá trị:

```env
# 1. Lấy từ Facebook Developers (https://developers.facebook.com/)
FB_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxx

# 2. Tự đặt token bất kỳ (VD: my_secret_123)
FB_VERIFY_TOKEN=my_secret_verify_token_123

# 3. Lấy từ DeepSeek (https://platform.deepseek.com/)
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 📖 Chi tiết cách lấy API Keys:

<details>
<summary><b>🔹 Facebook Page Access Token</b></summary>

1. Vào https://developers.facebook.com/apps/
2. Tạo app mới (chọn loại "Business")
3. Thêm product **Messenger**
4. Vào **Messenger > Settings**
5. Phần "Access Tokens", chọn Page và nhấn **Generate Token**
6. Copy token và paste vào `.env`

</details>

<details>
<summary><b>🔹 DeepSeek API Key</b></summary>

1. Đăng ký tại https://platform.deepseek.com/
2. Nạp tiền vào tài khoản (tối thiểu $5)
3. Vào **API Keys**
4. Tạo key mới
5. Copy và paste vào `.env`

</details>

## 🚀 Bước 3: Chạy Server

### Windows:
```bash
run.bat
```

### Linux/Mac:
```bash
source venv/bin/activate
python main.py
```

Server sẽ chạy tại: **http://localhost:8000**

## ✅ Bước 4: Test Local

Mở terminal mới và chạy:

```bash
# Kiểm tra server hoạt động
curl http://localhost:8000/health

# Hoặc mở browser:
# http://localhost:8000/health
```

## 🌐 Bước 5: Kết nối với Facebook

### A. Expose ra Internet (dùng ngrok)

```bash
# Download ngrok: https://ngrok.com/download

# Chạy ngrok
ngrok http 8000

# Copy URL (VD: https://abc123.ngrok.io)
```

### B. Setup Webhook trên Facebook

1. Vào Facebook App > **Messenger > Settings**
2. Phần **Webhooks**, click **Add Callback URL**:
   - **Callback URL**: `https://abc123.ngrok.io/webhook`
   - **Verify Token**: Giá trị `FB_VERIFY_TOKEN` trong `.env`
3. Click **Verify and Save**
4. Subscribe to events:
   - ✅ `messages`
   - ✅ `messaging_attachments`

### C. Subscribe Page

1. Trong phần Webhooks
2. Click **Add Subscriptions**
3. Chọn Page của bạn
4. Click **Subscribe**

## 🎉 Bước 6: Test với Messenger

1. Mở Messenger
2. Tìm Page của bạn
3. Gửi **ảnh hóa đơn**
4. Chờ vài giây → Nhận kết quả!

## 🐛 Troubleshooting

### ❌ "Module not found"
```bash
# Activate lại virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Cài lại dependencies
pip install -r requirements.txt
```

### ❌ "Environment variable not set"
- Kiểm tra file `.env` có tồn tại không
- Đảm bảo đã điền đúng giá trị
- Restart server sau khi sửa `.env`

### ❌ Không nhận được tin nhắn từ Facebook
- Kiểm tra ngrok còn chạy không
- Verify lại webhook URL
- Xem logs của server: Có thấy request POST không?

### ❌ DeepSeek API error
- Kiểm tra API key còn credit không
- Vào https://platform.deepseek.com/ để xem balance

## 📊 Test Script

Để test mà không cần Facebook:

```bash
python test_webhook.py
```

## 📚 Tài liệu đầy đủ

Xem [README.md](README.md) để biết thêm chi tiết!

---

**Thời gian setup ước tính**: 5-10 phút  
**Khó khăn nhất**: Lấy API keys và setup webhook

💡 **Tip**: Bookmark URL ngrok để không phải setup lại webhook mỗi lần!
