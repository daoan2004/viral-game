"""
Script để thêm/update Access Token cho Page trong database

Hướng dẫn sử dụng:
1. Lấy Page Access Token từ Facebook Graph API Explorer
2. Chạy script này để lưu vào database
"""

import sqlite3
import sys

def update_page_token(page_id, access_token, db_path="data/viral_game.sqlite"):
    """
    Thêm/update access token cho một page
    
    Args:
        page_id: Facebook Page ID (ví dụ: "929320890266793")
        access_token: Page Access Token từ Facebook
        db_path: Đường dẫn đến file database
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check xem page có tồn tại không
    cursor.execute("SELECT id, shop_name FROM tenant WHERE id = ?", (page_id,))
    row = cursor.fetchone()
    
    if not row:
        print(f"❌ Page ID {page_id} không tồn tại trong database!")
        print("\nVui lòng kết nối Page qua Dashboard trước.")
        conn.close()
        return False
    
    page_id_db, shop_name = row
    print(f"📄 Page: {shop_name}")
    print(f"🆔 ID: {page_id}")
    
    # Update access token
    cursor.execute(
        "UPDATE tenant SET access_token = ? WHERE id = ?",
        (access_token, page_id)
    )
    conn.commit()
    
    print(f"✅ Đã lưu Access Token thành công!")
    print(f"📝 Token (20 ký tự đầu): {access_token[:20]}...")
    
    conn.close()
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("🔑 THÊM PAGE ACCESS TOKEN VÀO DATABASE")
    print("=" * 60)
    
    if len(sys.argv) >= 3:
        # Chạy với arguments: python add_token.py <page_id> <token>
        page_id = sys.argv[1]
        token = sys.argv[2]
    else:
        # Chạy interactive
        page_id = input("\n📝 Nhập Page ID: ").strip()
        token = input("🔑 Nhập Access Token: ").strip()
    
    if not page_id or not token:
        print("❌ Page ID và Token không được để trống!")
        sys.exit(1)
    
    update_page_token(page_id, token)
    
    print("\n" + "=" * 60)
    print("✅ HOÀN TẤT!")
    print("=" * 60)
    print("\nBot giờ có thể gửi tin nhắn cho Page này rồi! 🎉")
