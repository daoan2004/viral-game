import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { LayoutDashboard, FileText, BarChart3, Settings, LogOut, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/dashboard/pages', icon: FileText, label: 'Quản lý Pages' },
  { href: '/dashboard/stats', icon: BarChart3, label: 'Thống kê' },
  { href: '/dashboard/settings', icon: Settings, label: 'Cài đặt' },
]

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('fb_auth')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 h-full w-64 bg-card/80 backdrop-blur-xl border-r border-border/50 z-50"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display gradient-text">LuckyBot</h1>
              <p className="text-xs text-muted-foreground">Quay thưởng tự động</p>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {/* Active background */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg shadow-primary/25"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Hover background */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-muted/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  
                  <item.icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 font-medium">{item.label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Logout */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </motion.button>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <main className="ml-64 p-8 min-h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
