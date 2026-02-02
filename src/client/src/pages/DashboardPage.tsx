import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, RotateCcw, Gift, Users, TrendingUp } from 'lucide-react'

interface Stats {
  totalPages: number
  totalSpins: number
  totalPrizes: number
  totalUsers: number
}

const statCards = [
  { key: 'totalPages', title: 'Pages', icon: FileText, gradient: 'from-blue-500 to-blue-600' },
  { key: 'totalSpins', title: 'Lượt quay', icon: RotateCcw, gradient: 'from-emerald-500 to-emerald-600' },
  { key: 'totalPrizes', title: 'Giải phát', icon: Gift, gradient: 'from-amber-500 to-orange-500' },
  { key: 'totalUsers', title: 'Người dùng', icon: Users, gradient: 'from-violet-500 to-purple-600' },
] as const

export function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPages: 0,
    totalSpins: 0,
    totalPrizes: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalPages: data.totalPages || 0,
          totalSpins: data.totalSpins || 0,
          totalPrizes: data.totalPrizes || 0,
          totalUsers: data.totalUsers || 0,
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
    setLoading(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold font-display"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Tổng quan
        </motion.h1>
        <motion.p 
          className="text-muted-foreground mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Chào mừng bạn đến với LuckyBot Dashboard
        </motion.p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded-lg animate-pulse w-20" />
                    <div className="h-3 bg-muted rounded animate-pulse w-24" />
                  </div>
                ) : (
                  <>
                    <motion.div 
                      className="text-3xl font-bold font-display"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: 'spring', stiffness: 200 }}
                    >
                      {stats[stat.key].toLocaleString()}
                    </motion.div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <TrendingUp className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium">+0%</span>
                      <span>so với tuần trước</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div 
        className="mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold font-display mb-4">Hành động nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Thêm Page mới', desc: 'Kết nối Facebook Page', icon: FileText },
            { title: 'Xem thống kê', desc: 'Phân tích chi tiết', icon: TrendingUp },
            { title: 'Cấu hình giải', desc: 'Tùy chỉnh phần thưởng', icon: Gift },
          ].map((action) => (
            <motion.div
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <action.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
