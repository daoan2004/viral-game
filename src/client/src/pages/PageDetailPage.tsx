import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'

interface Prize {
  name: string
  rate: number
  emoji: string
  instruction: string
}

interface PageConfig {
  shop_name: string
  shop_patterns: string[]
  prizes: Prize[]
  is_active: boolean
  page_access_token?: string
}

const defaultPrizes: Prize[] = [
  { name: 'Voucher 50k', rate: 0.05, emoji: '🎉', instruction: 'Đưa tin nhắn này cho nhân viên để nhận voucher!' },
  { name: 'Nước ngọt', rate: 0.15, emoji: '🥤', instruction: 'Đưa tin nhắn này để nhận nước miễn phí!' },
  { name: 'Chúc may mắn', rate: 0.8, emoji: '🍀', instruction: 'Quay lại lần sau nhé!' },
]

export function PageDetailPage() {
  const { id: pageId } = useParams()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageName, setPageName] = useState('')
  const [notification, setNotification] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' })

  const [config, setConfig] = useState<PageConfig>({
    shop_name: '',
    shop_patterns: [''],
    prizes: defaultPrizes,
    is_active: true,
  })

  useEffect(() => {
    loadPageConfig()
  }, [pageId])

  const loadPageConfig = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/pages/${pageId}`)

      if (res.ok) {
        const data = await res.json()
        // Backend now returns flattened data (no {page: ...} wrapper)
        const page = data

        setPageName(page.shop_name || '')
        setConfig({
          shop_name: page.shop_name || '',
          shop_patterns: page.shop_patterns?.length ? page.shop_patterns : [''],
          prizes: page.prizes?.length ? page.prizes : defaultPrizes,
          is_active: page.is_active ?? true,
          page_access_token: page.page_access_token,
        })
      } else if (res.status === 404) {
        const stored = localStorage.getItem('fb_auth')
        if (stored) {
          const authData = JSON.parse(stored)
          const fbPage = authData.pages?.find((p: { id: string }) => p.id === pageId)
          if (fbPage) {
            setPageName(fbPage.name)
            setConfig((prev) => ({
              ...prev,
              shop_name: fbPage.name,
              shop_patterns: [fbPage.name],
            }))
          }
        }
        setError('Page chưa được kết nối. Vui lòng kết nối Page trước.')
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to load page config')
      }
    } catch (err) {
      console.error('Error loading page:', err)
      setError('Không thể tải cấu hình. Vui lòng thử lại.')
    }

    setLoading(false)
  }

  const handleAddPrize = () => {
    setConfig((prev) => ({
      ...prev,
      prizes: [...prev.prizes, { name: '', rate: 0, emoji: '🎁', instruction: '' }],
    }))
  }

  const handleRemovePrize = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index),
    }))
  }

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) =>
        i === index ? { ...prize, [field]: value } : prize
      ),
    }))
  }

  const handlePatternChange = (index: number, value: string) => {
    setConfig((prev) => ({
      ...prev,
      shop_patterns: prev.shop_patterns.map((p, i) => (i === index ? value : p)),
    }))
  }

  const handleAddPattern = () => {
    setConfig((prev) => ({
      ...prev,
      shop_patterns: [...prev.shop_patterns, ''],
    }))
  }

  const handleRemovePattern = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      shop_patterns: prev.shop_patterns.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const totalRate = config.prizes.reduce((sum, p) => sum + p.rate, 0)
      if (Math.abs(totalRate - 1) > 0.01) {
        setNotification({
            open: true,
            title: "Lỗi cấu hình",
            message: 'Tổng tỉ lệ giải thưởng phải bằng 100%'
        })
        setSaving(false)
        return
      }

      const cleanedConfig = {
        ...config,
        shop_patterns: config.shop_patterns.filter((p) => p.trim() !== ''),
      }

      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedConfig),
      })

      if (res.ok) {
        setNotification({
            open: true,
            title: "Thành công",
            message: 'Đã lưu cấu hình thành công!'
        })
      } else {
        const errorData = await res.json()
        setNotification({
            open: true,
            title: "Thất bại",
            message: errorData.error || 'Failed to save config'
        })
      }
    } catch (err) {
      console.error('Error saving config:', err)
      setNotification({
        open: true,
        title: "Lỗi hệ thống",
        message: 'Không thể lưu cấu hình. Vui lòng thử lại.'
      })
    }

    setSaving(false)
  }

  const totalRate = config.prizes.reduce((sum, p) => sum + p.rate, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && error.includes('chưa được kết nối')) {
    return (
      <div className="max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard/pages" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Page ID: {pageId}</h1>
          </div>
        </div>
        <Card className="border-amber-200 bg-amber-50 text-center py-8">
          <CardContent>
            <p className="text-amber-800 mb-4">{error}</p>
            <Link to="/dashboard/pages">
              <Button>Quay lại danh sách Pages</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/pages" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{pageName}</h1>
            <p className="text-muted-foreground">Page ID: {pageId}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10 mb-6">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Shop Name */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Thông tin cửa hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="shop_name">Tên cửa hàng</Label>
            <Input
              id="shop_name"
              value={config.shop_name}
              onChange={(e) => setConfig((prev) => ({ ...prev, shop_name: e.target.value }))}
              placeholder="VD: Quán Phở Hà Nội"
            />
          </div>

          <div>
            <Label>Từ khóa nhận diện (AI sẽ tìm các từ khóa này trên hóa đơn)</Label>
            {config.shop_patterns.map((pattern, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={pattern}
                  onChange={(e) => handlePatternChange(index, e.target.value)}
                  placeholder="VD: Phở Hà Nội"
                />
                {config.shop_patterns.length > 1 && (
                  <Button variant="outline" size="icon" onClick={() => handleRemovePattern(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="link" className="mt-2 p-0" onClick={handleAddPattern}>
              + Thêm từ khóa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prizes */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cấu hình giải thưởng</CardTitle>
          <span className={`text-sm font-medium ${Math.abs(totalRate - 1) < 0.001 ? 'text-green-600' : 'text-destructive'}`}>
            Tổng tỉ lệ: {(totalRate * 100).toFixed(0)}%
            {Math.abs(totalRate - 1) >= 0.001 && ' (phải = 100%)'}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.prizes.map((prize, index) => (
            <div key={index} className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-start gap-4">
                <Input
                  value={prize.emoji}
                  onChange={(e) => handlePrizeChange(index, 'emoji', e.target.value)}
                  className="w-16 text-center text-2xl"
                  maxLength={2}
                />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Tên giải</Label>
                    <Input
                      value={prize.name}
                      onChange={(e) => handlePrizeChange(index, 'name', e.target.value)}
                      placeholder="VD: Voucher 50k"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tỉ lệ (%)</Label>
                    <Input
                      type="number"
                      value={prize.rate * 100}
                      onChange={(e) => handlePrizeChange(index, 'rate', parseFloat(e.target.value) / 100 || 0)}
                      min="0"
                      max="100"
                      step="1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Hướng dẫn nhận thưởng</Label>
                    <Input
                      value={prize.instruction}
                      onChange={(e) => handlePrizeChange(index, 'instruction', e.target.value)}
                      placeholder="VD: Đưa tin nhắn này cho nhân viên..."
                    />
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => handleRemovePrize(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={handleAddPrize}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm giải thưởng
          </Button>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.is_active}
              onChange={(e) => setConfig((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 rounded border-input"
            />
            <span>Kích hoạt bot cho Page này</span>
          </label>
          <p className="text-sm text-muted-foreground mt-2">
            Khi tắt, bot sẽ không xử lý tin nhắn từ Page này
          </p>
        </CardContent>
      </Card>

      <Modal
        isOpen={notification.open}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        title={notification.title}
      >
        {notification.message}
      </Modal>
    </div>
  )
}

