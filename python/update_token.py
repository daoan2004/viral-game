import sqlite3
import os

# Update path to match where the DB actually is in Docker vs Local
# Trong docker là /app/data/..., ở ngoài là ../data/... hoặc cùng cấp template
DB_PATH = "data/viral_game.sqlite"
if not os.path.exists(DB_PATH):
    # Try looking in parent directory if running from python/
    DB_PATH = "../viral_game.sqlite"

def update_token():
    print("="*50)
    print("🛠️  CẬP NHẬT FACEBOOK PAGE ACCESS TOKEN")
    print("="*50)
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Không tìm thấy database tại: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # List current tenants
    print("\n📋 Danh sách Page đang quản lý:")
    cursor.execute("SELECT id, shop_name, access_token FROM tenant")
    tenants = cursor.fetchall()
    
    if not tenants:
        print("⚠️ Chưa có Page nào trong database.")
    else:
        for idx, t in enumerate(tenants):
             token_status = "✅ Có token" if t[2] else "❌ Thiếu token"
             print(f"{idx+1}. {t[1]} (ID: {t[0]}) - {token_status}")
    
    print("-" * 30)
    page_id = input("👉 Nhập Page ID cần update (VD: 929320890266793): ").strip()
    
    if not page_id:
        print("❌ Chưa nhập Page ID.")
        return

    print(f"\n🔑 Hãy lấy Access Token MỚI từ: https://developers.facebook.com/tools/explorer/")
    new_token = input("👉 Nhập Access Token mới: ").strip()
    
    if len(new_token) < 50:
        print("❌ Token quá ngắn, có vẻ không đúng.")
        return
        
    try:
        cursor.execute("""
            UPDATE tenant 
            SET access_token = ? 
            WHERE id = ?
        """, (new_token, page_id))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"\n✅ Đã cập nhật token thành công cho Page ID {page_id}!")
        else:
            print(f"\n❌ Không tìm thấy Page ID {page_id} trong database.")
            # Option to insert
            create = input("Bạn có muốn tạo mới Page này không? (y/n): ")
            if create.lower() == 'y':
                shop_name = input("Nhập tên cửa hàng: ")
                cursor.execute("""
                    INSERT INTO tenant (id, shop_name, access_token, is_active, config)
                    VALUES (?, ?, ?, 1, '{}')
                """, (page_id, shop_name, new_token))
                conn.commit()
                print("✅ Đã tạo mới Page thành công!")

    except Exception as e:
        print(f"❌ Lỗi: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    update_token()
