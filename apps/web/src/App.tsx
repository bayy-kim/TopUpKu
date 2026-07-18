import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from './pages/Home'
import GameDetail from './pages/GameDetail'
import Checkout from './pages/Checkout'
import WaitingPayment from './pages/WaitingPayment'
import TransactionStatus from './pages/TransactionStatus'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminRevenue from './pages/admin/Revenue'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:slug" element={<GameDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment/:orderNumber" element={<WaitingPayment />} />
          <Route path="/status/:orderNumber" element={<TransactionStatus />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/revenue" element={<AdminRevenue />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
