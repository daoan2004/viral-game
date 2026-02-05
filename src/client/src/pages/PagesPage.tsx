import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Settings, Trash2, Check, X, RefreshCw, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Page {
  id: string
  name: string
  access_token?: string
  isConnected?: boolean
  shop_name?: string
}

interface FBAuth {
  pages: Page[]
  accessToken: string
}

interface TenantPage {
  id: string
  shop_name: string
  is_active: boolean
}

export function PagesPage() {
  const [fbPages, setFbPages] = useState<Page[]>([])
  const [connectedPages, setConnectedPages] = useState<Map<string, TenantPage>>(new Map())
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Token update modal state
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedPage, setSelectedPage] = useState<{ id: string; name: string } | null>(null)
  const [newToken, setNewToken] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean
    type: 'success' | 'error'
    message: string
  }>({ show: false, type: 'success', message: '' })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' })
    }, 3000)
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)

    // Load FB auth from localStorage
    const stored = localStorage.getItem('fb_auth')
    if (stored) {
      const authData: FBAuth = JSON.parse(stored)
      setFbPages(authData.pages || [])
    }

    // Load connected pages from API
    try {
      const res = await fetch('/api/pages')
      if (res.ok) {
        const data = await res.json()
        const map = new Map<string, TenantPage>()
        ;(data.pages || []).forEach((p: TenantPage) => {
          map.set(p.id, p)
        })
        setConnectedPages(map)
      }
    } catch (error) {
      console.error('Error loading pages:', error)
    }

    setLoading(false)
  }

  const handleConnectPage = async (page: Page) => {
    setActionLoading(page.id)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: page.id,
          name: page.name,
          access_token: page.access_token,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setConnectedPages((prev) => {
          const newMap = new Map(prev)
          newMap.set(page.id, data.page)
          return newMap
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to connect page')
      }
    } catch (error) {
      console.error('Error connecting page:', error)
      alert('Failed to connect page')
    }
    setActionLoading(null)
  }

  const handleDisconnectPage = async (pageId: string) => {
    if (!confirm('Bạn có chắc muốn ngắt kết nối Page này?')) return

    setActionLoading(pageId)
    try {
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setConnectedPages((prev) => {
          const newMap = new Map(prev)
          newMap.delete(pageId)
          return newMap
        })
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to disconnect page')
      }
    } catch (error) {
      console.error('Error disconnecting page:', error)
      alert('Failed to disconnect page')
    }
    setActionLoading(null)
  }

  const handleUpdateToken = async () => {
    if (!selectedPage) return
    
    if (!newToken || newToken.length < 50) {
      showNotification('error', 'Access Token không hợp lệ. Token phải có ít nhất 50 ký tự.')
      return
    }

    setUpdateLoading(true)
    try {
      const res = await fetch(`/api/pages/${selectedPage.id}/token`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: newToken }),
      })

      if (res.ok) {
        showNotification('success', 'Cập nhật Access Token thành công!')
        setShowTokenModal(false)
        setNewToken('')
        setSelectedPage(null)
        loadData() // Refresh data
      } else {
        const error = await res.json()
        showNotification('error', error.message || 'Không thể cập nhật token')
      }
    } catch (error) {
      console.error('Error updating token:', error)
      showNotification('error', 'Lỗi khi cập nhật token')
    }
    setUpdateLoading(false)
  }

  // Merge FB pages with connected status
  const mergedPages = fbPages.map((page) => ({
    ...page,
    isConnected: connectedPages.has(page.id),
    tenant: connectedPages.get(page.id),
  }))

  // Also show connected pages not in FB list
  const orphanPages = Array.from(connectedPages.entries())
    .filter(([id]) => !fbPages.find((p) => p.id === id))
    .map(([id, tenant]) => ({
      id,
      name: tenant.shop_name,
      isConnected: true,
      tenant,
    }))

  const allPages = [...mergedPages, ...orphanPages]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Pages</h1>
          <p className="text-muted-foreground">
            Kết nối và cấu hình các Facebook Page của bạn
          </p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Pages Grid */}
      {allPages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Chưa có Page nào</h3>
            <p className="text-muted-foreground mb-6">
              Đăng nhập lại với Facebook để lấy danh sách Pages
            </p>
            <Link to="/login">
              <Button>Kết nối Facebook</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPages.map((page) => (
            <Card key={page.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">
                    {page.tenant?.shop_name || page.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">ID: {page.id}</p>
                </div>
                <Badge variant={page.isConnected ? 'default' : 'secondary'}>
                  {page.isConnected ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Đã kết nối
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <X className="w-3 h-3" /> Chưa kết nối
                    </span>
                  )}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Lượt quay</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Giải phát</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {page.isConnected ? (
                    <>
                      <Link to={`/dashboard/pages/${page.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Cấu hình
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedPage({ id: page.id, name: page.tenant?.shop_name || page.name })
                          setShowTokenModal(true)
                        }}
                        title="Cập nhật Access Token"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDisconnectPage(page.id)}
                        disabled={actionLoading === page.id}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        {actionLoading === page.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnectPage(page)}
                      disabled={actionLoading === page.id}
                      className="w-full"
                    >
                      {actionLoading === page.id ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Kết nối Page
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Update Modal */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Cập nhật Access Token</CardTitle>
              <p className="text-sm text-muted-foreground">
                Page: {selectedPage?.name}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Access Token mới
                </label>
                <textarea
                  className="w-full min-h-[100px] p-3 border rounded-md resize-none font-mono text-sm"
                  placeholder="Paste Access Token từ Facebook Developer Console..."
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value)}
                />
              </div>

              <div className="bg-muted p-3 rounded-md text-sm">
                <p className="font-medium mb-1">📝 Hướng dẫn lấy token:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Truy cập <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Graph API Explorer</a></li>
                  <li>Chọn ứng dụng của bạn</li>
                  <li>Click "Generate Access Token"</li>
                  <li>Copy token và paste vào đây</li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowTokenModal(false)
                    setNewToken('')
                    setSelectedPage(null)
                  }}
                  disabled={updateLoading}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateToken}
                  disabled={updateLoading || !newToken}
                >
                  {updateLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    'Cập nhật'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <Card className={`min-w-[300px] border-l-4 ${
            notification.type === 'success' 
              ? 'border-l-green-500 bg-green-50' 
              : 'border-l-red-500 bg-red-50'
          }`}>
            <CardContent className="flex items-center gap-3 p-4">
              {notification.type === 'success' ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
              <p className={`font-medium ${
                notification.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {notification.message}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
