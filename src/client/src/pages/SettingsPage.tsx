import { Sparkles, MessageSquare, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Cấu hình các tham số trúng thưởng, nội dung tin nhắn và quy tắc trò chơi cho Chatbot.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 border-primary/10 bg-card/50 backdrop-blur-sm group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gift className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Cấu hình giải thưởng</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Thiết lập tỷ lệ trúng, số lượng giải thưởng và các loại quà tặng.
            </p>
          </div>
          <Button variant="outline" className="w-full">Thiết lập ngay</Button>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 border-primary/10 bg-card/50 backdrop-blur-sm group">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Mẫu tin nhắn</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Chỉnh sửa nội dung tin nhắn tự động khi khách hàng trúng thưởng.
            </p>
          </div>
          <Button variant="outline" className="w-full">Chỉnh sửa</Button>
        </Card>

        <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300 border-primary/10 bg-card/50 backdrop-blur-sm group">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Quy tắc trò chơi</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Giới hạn số lần quay, điều kiện tham gia và thời gian hiệu lực.
            </p>
          </div>
          <Button variant="outline" className="w-full">Cập nhật</Button>
        </Card>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
        Vui lòng chọn một Page cụ thể trong phần "Quản lý Pages" để áp dụng các cài đặt này.
      </div>
    </div>
  )
}
