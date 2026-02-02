import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Facebook, Wrench } from 'lucide-react'

declare global {
  interface Window {
    FB: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void
      login: (callback: (response: FBLoginResponse) => void, options: { scope: string }) => void
      api: (path: string, callback: (response: FBApiResponse) => void) => void
    }
  }
}

interface FBLoginResponse {
  status: string
  authResponse?: {
    accessToken: string
    userID: string
  }
}

interface FBApiResponse {
  data?: Array<{
    id: string
    name: string
    access_token: string
  }>
}

export function LoginPage() {
  const navigate = useNavigate()

  const handleFacebookLogin = () => {
    window.FB.login(
      (response) => {
        if (response.status === 'connected' && response.authResponse) {
          const accessToken = response.authResponse.accessToken

          window.FB.api('/me/accounts', (pagesResponse) => {
            const pages = pagesResponse.data || []
            
            localStorage.setItem(
              'fb_auth',
              JSON.stringify({
                accessToken,
                pages,
              })
            )

            navigate('/dashboard')
          })
        }
      },
      { scope: 'pages_show_list,pages_messaging,pages_read_engagement' }
    )
  }

  const handleDevLogin = async () => {
    try {
      const res = await fetch('/api/pages')
      if (res.ok) {
        const data = await res.json()
        const pages = (data.pages || []).map((p: { id: string; shop_name: string }) => ({
          id: p.id,
          name: p.shop_name,
        }))

        localStorage.setItem(
          'fb_auth',
          JSON.stringify({
            accessToken: 'dev-token',
            pages,
          })
        )

        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Dev login failed:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="w-full max-w-md backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl shadow-primary/10">
          <CardHeader className="text-center pb-2">
            <motion.div 
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-display gradient-text">LuckyBot</CardTitle>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CardDescription className="text-base mt-2">
                Đăng nhập để quản lý các trang Facebook của bạn
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                onClick={handleFacebookLogin}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] h-12 text-base font-medium shadow-lg shadow-[#1877F2]/25 transition-all hover:shadow-xl hover:shadow-[#1877F2]/30 hover:-translate-y-0.5"
                size="lg"
              >
                <Facebook className="w-5 h-5 mr-2" />
                Đăng nhập với Facebook
              </Button>
            </motion.div>

            {import.meta.env.DEV && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  onClick={handleDevLogin}
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-2 hover:bg-muted/50 transition-all hover:-translate-y-0.5"
                  size="lg"
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  Dev Mode (Bỏ qua Facebook)
                </Button>
              </motion.div>
            )}

            <motion.p 
              className="text-center text-xs text-muted-foreground pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
