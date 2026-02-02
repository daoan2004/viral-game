import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StatsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Thống kê</h1>
        <p className="text-muted-foreground">Theo dõi hiệu quả hoạt động</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đang phát triển</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tính năng thống kê chi tiết sẽ được cập nhật trong phiên bản tới.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
