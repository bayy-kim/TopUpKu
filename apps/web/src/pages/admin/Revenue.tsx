import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/adminApi'

export default function AdminRevenue() {
  const nav = useNavigate()
  const [data, setData] = useState<any>(null)
  const [period, setPeriod] = useState<'day' | 'month'>('day')

  useEffect(() => {
    adminApi.revenue(period).then(setData)
  }, [period])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    nav('/admin/login')
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
          <button onClick={() => nav('/admin')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">Dashboard</button>
          <button onClick={() => nav('/admin')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">Transaksi</button>
          <button onClick={() => nav('/admin/products')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">Produk</button>
          <a className="flex items-center gap-3 px-3 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-md">Laporan</a>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-error hover:bg-error-container/20 rounded-lg transition-colors font-label-md w-full text-left">Logout</button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Laporan Omzet</h2>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary"
          >
            <option value="day">Per Hari</option>
            <option value="month">Per Bulan</option>
          </select>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                <p className="text-label-md text-on-surface-variant">Total Transaksi</p>
                <p className="font-headline-xl text-headline-xl text-on-surface mt-1">{data.totals.count}</p>
              </div>
              <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                <p className="text-label-md text-on-surface-variant">Total Omzet</p>
                <p className="font-headline-xl text-headline-xl text-primary mt-1">{formatPrice(data.totals.revenue)}</p>
              </div>
              <div className="bg-surface-container p-5 rounded-xl border border-white/5">
                <p className="text-label-md text-on-surface-variant">Total Profit</p>
                <p className="font-headline-xl text-headline-xl text-green-400 mt-1">{formatPrice(data.totals.profit)}</p>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-surface-container-lowest border-b border-white/5">
                    <th className="px-4 py-3 font-label-md text-outline">Periode</th>
                    <th className="px-4 py-3 font-label-md text-outline">Transaksi</th>
                    <th className="px-4 py-3 font-label-md text-outline">Omzet</th>
                    <th className="px-4 py-3 font-label-md text-outline">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.items.map((item: any) => (
                    <tr key={item.date} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">{item.date}</td>
                      <td className="px-4 py-3">{item.count}</td>
                      <td className="px-4 py-3">{formatPrice(item.revenue)}</td>
                      <td className="px-4 py-3 text-green-400">{formatPrice(item.profit)}</td>
                    </tr>
                  ))}
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-on-surface-variant">Belum ada data transaksi</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
