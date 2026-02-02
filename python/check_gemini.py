import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load env variables
load_dotenv(dotenv_path="../.env")
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("="*50)
print("🔍 KIỂM TRA MODEL GEMINI KHẢ DỤNG")
print("="*50)

if not api_key or "your_key" in api_key:
    print("❌ LỖI: Chưa cấu hình GEMINI_API_KEY trong file .env")
    print("Vui lòng cập nhật .env trước!")
    exit(1)

print(f"🔑 API Key: {api_key[:8]}...")

try:
    genai.configure(api_key=api_key)
    
    print("\n📋 Danh sách model hỗ trợ 'generateContent' (Chat + Vision):")
    valid_models = []
    
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"   ✅ {m.name}")
            valid_models.append(m.name)
            
    print("\n" + "="*50)
    
    if not valid_models:
        print("❌ Không tìm thấy model nào khả dụng!")
    else:
        # Thử test model đầu tiên tìm thấy (ưu tiên flash)
        test_model = next((m for m in valid_models if 'flash' in m), valid_models[0])
        print(f"🧪 Đang test thử model: {test_model} ...")
        
        # Test text generation
        try:
            model = genai.GenerativeModel(test_model.replace('models/', ''))
            response = model.generate_content("Hello, are you working?")
            print(f"✅ Test thành công! Phản hồi: {response.text}")
            
            print(f"\n💡 KẾT LUẬN: Hãy dùng model name: '{test_model.replace('models/', '')}'")
        except Exception as e:
            print(f"❌ Test thất bại: {str(e)}")

except Exception as e:
    print(f"\n❌ Lỗi kết nối Google API: {str(e)}")
    print("👉 Kiểm tra lại API Key hoặc VPN (Google AI Studio chặn một số IP VN)")
