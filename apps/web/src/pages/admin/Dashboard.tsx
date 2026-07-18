import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/adminApi'

export default function AdminDashboard() {
  const nav = useNavigate()
  const [data, setData] = useState<any>(null)
  const [revenue, setRevenue] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const email = localStorage.getItem('admin_email')

  useEffect(() => {
    adminApi.orders(statusFilter, page).then(setData)
  }, [statusFilter, page])

  useEffect(() => {
    adminApi.revenue('day').then(setRevenue)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    nav('/admin/login')
  }

  const handleRetry = async (id: string) => {
    try {
      await adminApi.retryOrder(id)
      adminApi.orders(statusFilter, page).then(setData)
    } catch (e) {
      alert('Retry failed')
    }
  }

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400',
      paid: 'bg-blue-500/10 text-blue-400',
      processing: 'bg-blue-500/10 text-blue-400',
      success: 'bg-green-500/10 text-green-400',
      failed: 'bg-error-container/20 text-error',
      expired: 'bg-red-500/10 text-red-400',
    }
    return map[s] ?? 'bg-surface-container-highest text-on-surface-variant'
  }

  const formatPrice = (p: number) => `Rp ${p.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen bg-surface flex">
      <aside className="w-64 border-r border-white/5 bg-surface-container flex flex-col p-4 gap-4 h-screen fixed">
        <div className="mb-4 px-2">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">TopUpKu</h1>
          <p className="text-[10px] text-outline tracking-widest uppercase">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-1">
          <a className="flex items-center gap-3 px-3 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-md">Dashboard</a>
          <button onClick={() => nav('/admin')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">
            Transaksi
          </button>
          <button onClick={() => nav('/admin/products')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">
            Produk
          </button>
          <button onClick={() => nav('/admin/revenue')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">
            Laporan
          </button>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-error hover:bg-error-container/20 rounded-lg transition-colors font-label-md w-full text-left">
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6 flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Dashboard</h2>
            <p className="text-body-md text-on-surface-variant">Halo, {email}</p>
          </div>
        </header>

        {revenue && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-surface-container p-5 rounded-xl border border-white/5">
              <p className="text-label-md text-on-surface-variant">Transaksi Hari Ini</p>
              <p className="font-headline-xl text-headline-xl text-on-surface mt-1">{revenue.totals.count}</p>
            </div>
            <div className="bg-surface-container p-5 rounded-xl border border-white/5">
              <p className="text-label-md text-on-surface-variant">Omzet Hari Ini</p>
              <p className="font-headline-xl text-headline-xl text-primary mt-1">{formatPrice(revenue.totals.revenue)}</p>
            </div>
            <div className="bg-surface-container p-5 rounded-xl border border-white/5">
              <p className="text-label-md text-on-surface-variant">Profit Hari Ini</p>
              <p className="font-headline-xl text-headline-xl text-green-400 mt-1">{formatPrice(revenue.totals.profit)}</p>
            </div>
          </div>
        )}

        <section className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md">Daftar Transaksi</h3>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary"
              >
                <option value="">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-surface-container-lowest border-b border-white/5">
                  <th className="px-4 py-3 font-label-md text-outline">Invoice</th>
                  <th className="px-4 py-3 font-label-md text-outline">Game</th>
                  <th className="px-4 py-3 font-label-md text-outline">Produk</th>
                  <th className="px-4 py-3 font-label-md text-outline">Harga</th>
                  <th className="px-4 py-3 font-label-md text-outline">Payment</th>
                  <th className="px-4 py-3 font-label-md text-outline">Status</th>
                  <th className="px-4 py-3 font-label-md text-outline">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.items.map((o: any) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-sm text-primary-fixed-dim">{o.orderNumber}</td>
                    <td className="px-4 py-3">{o.game}</td>
                    <td className="px-4 py-3">{o.product}</td>
                    <td className="px-4 py-3">{formatPrice(o.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(o.paymentStatus)}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusBadge(o.topupStatus)}`}>
                        {o.topupStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {o.topupStatus === 'failed' && (
                        <button
                          onClick={() => handleRetry(o.id)}
                          className="px-3 py-1 border border-primary text-primary hover:bg-primary/10 rounded-lg text-[10px] font-bold transition-all"
                        >
                          RETRY
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-on-surface-variant">
              <p>{data.total} transaksi (hal {data.page})</p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 bg-surface-container-high rounded disabled:opacity-30"
                >
                  Prev
                </button>
                <button
                  disabled={data.items.length < (data.limit || 20)}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 bg-surface-container-high rounded disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
