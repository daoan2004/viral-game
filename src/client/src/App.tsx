import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PagesPage } from './pages/PagesPage'
import { PageDetailPage } from './pages/PageDetailPage'
import { StatsPage } from './pages/StatsPage'

import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="pages" element={<PagesPage />} />
        <Route path="pages/:id" element={<PageDetailPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
