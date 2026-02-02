import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Settings, Trash2, Check, X, RefreshCw } from 'lucide-react'
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
    </div>
  )
}
