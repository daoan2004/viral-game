import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  MessageCircle,
  Users,
  Gift,
  ArrowRight,
  Star,
  Rocket,
  BarChart3
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  const features = [
    {
      icon: Zap,
      title: 'Tự động hóa',
      description: 'Tin nhắn được xử lý tự động, phản hồi tức thì'
    },
    {
      icon: Gift,
      title: 'Vòng quay may mắn',
      description: 'Tăng tương tác với game mini hấp dẫn'
    },
    {
      icon: Shield,
      title: 'Bảo mật',
      description: 'Dữ liệu được mã hóa và bảo vệ tuyệt đối'
    },
    {
      icon: BarChart3,
      title: 'Thống kê chi tiết',
      description: 'Theo dõi hiệu quả với báo cáo real-time'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Kết nối Facebook Page',
      description: 'Chỉ vài cú nhấp để kết nối trang Facebook của bạn'
    },
    {
      number: '2', 
      title: 'Cấu hình giải thưởng',
      description: 'Tùy chỉnh vòng quay với các giải hấp dẫn'
    },
    {
      number: '3',
      title: 'Hoạt động',
      description: 'Bot tự động xử lý và phát thưởng cho khách hàng'
    }
  ]

  /*
  const pricing = [
    {
      name: 'Basic',
      price: '199.000đ',
      period: '/tháng',
      features: [
        '1 Facebook Page',
        '1.000 lượt quay/tháng',
        '3 giải thưởng',
        'Thống kê cơ bản',
        'Hỗ trợ email'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: '499.000đ', 
      period: '/tháng',
      features: [
        '5 Facebook Pages',
        '10.000 lượt quay/tháng',
        '10 giải thưởng',
        'Thống kê nâng cao',
        'Hỗ trợ 24/7',
        'Export data',
        'Custom branding'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '1.999.000đ',
      period: '/tháng',
      features: [
        'Không giới hạn Pages',
        'Không giới hạn lượt quay',
        'Không giới hạn giải thưởng',
        'API access',
        'Dedicated support',
        'White label',
        'Onsite training'
      ],
      popular: false
    }
  ]
  */

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        {/* Background Decorations */}
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

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Rocket className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Marketing Tool</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold font-display mb-6">
                <span className="gradient-text">LuckyBot</span>
                <br />
                Quay thưởng tự động
                <br />
                cho Facebook
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Tăng tương tác và thu hút khách hàng với trò chơi vòng quay may mắn 
                hoàn toàn tự động trên Facebook Messenger.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="h-14 px-8 text-base font-medium shadow-lg shadow-primary/25">
                    Bắt đầu ngay
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium">
                  Xem demo
                </Button>
              </div>

              <div className="flex items-center gap-8 mt-8">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold">1,000+</span>
                  <span className="text-muted-foreground">Khách hàng</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="font-semibold">50K+</span>
                  <span className="text-muted-foreground">Tin nhắn/ngày</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-semibold">4.9/5</span>
                  <span className="text-muted-foreground">Đánh giá</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-md">
                {/* Phone mockup */}
                <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
                  <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                  <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                  <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                  <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white">
                    <div className="bg-gradient-to-br from-primary to-primary/80 p-4 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold">LuckyBot</div>
                          <div className="text-xs opacity-90">Online</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        🎰 Chào mừng đến với vòng quay may mắn!
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        🎁 Bạn đã trúng Voucher 50k!
                      </div>
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        🍀 Chúc may mắn lần sau nhé!
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-primary rounded-lg h-16 flex items-center justify-center text-white font-bold">🎉</div>
                        <div className="bg-primary/80 rounded-lg h-16 flex items-center justify-center text-white font-bold">🥤</div>
                        <div className="bg-primary/60 rounded-lg h-16 flex items-center justify-center text-white font-bold">🍀</div>
                      </div>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/80 h-12 font-semibold">
                        QUAY NGAY
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Tại sao chọn <span className="gradient-text">LuckyBot</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Giải pháp marketing tự động hóa hoàn hảo cho doanh nghiệp của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Hoạt động như thế nào?
            </h2>
            <p className="text-xl text-muted-foreground">
              Chỉ 3 bước đơn giản để bắt đầu
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section Hidden
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Bảng giá
            </h2>
            <p className="text-xl text-muted-foreground">
              Chọn gói phù hợp với nhu cầu của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full relative ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Phổ biến nhất
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold font-display mb-1">
                        {plan.price}
                      </div>
                      <div className="text-muted-foreground">{plan.period}</div>
                    </div>

                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/login" className="block">
                      <Button 
                        className={`w-full h-12 ${
                          plan.popular 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {plan.popular ? 'Bắt đầu ngay' : 'Chọn gói'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold font-display mb-6">
              Sẵn sàng tăng tương tác cho fanpage?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Hàng ngàn doanh nghiệp đã tin tưởng LuckyBot để tự động hóa marketing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="h-14 px-8 text-base font-medium">
                  <Rocket className="w-5 h-5 mr-2" />
                  Bắt đầu dùng thử
                </Button>
              </Link>
              
              <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium">
                Liên hệ tư vấn
              </Button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              </div>
              <span className="text-muted-foreground">
                <strong>4.9/5</strong> từ 1,000+ đánh giá
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold font-display text-lg">LuckyBot</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Giải pháp marketing tự động hóa cho Facebook
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Tính năng</a></li>
                <li><a href="#" className="hover:text-foreground">Bảng giá</a></li>
                <li><a href="#" className="hover:text-foreground">Case studies</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Tài liệu</a></li>
                <li><a href="#" className="hover:text-foreground">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground">Liên hệ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Tuyển dụng</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 LuckyBot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
