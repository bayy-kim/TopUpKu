import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/adminApi'

export default function AdminProducts() {
  const nav = useNavigate()
  const [products, setProducts] = useState<any[]>([])
  const [games, setGames] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({ gameId: '', name: '', skuCode: '', priceBuy: 0, priceSell: 0 })
  const [loading, setLoading] = useState(false)

  const load = () => {
    adminApi.products().then(setProducts)
    adminApi.games().then(setGames)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, form)
      } else {
        await adminApi.createProduct(form)
      }
      setForm({ gameId: '', name: '', skuCode: '', priceBuy: 0, priceSell: 0 })
      setEditingId(null)
      load()
    } catch (e) {
      alert('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (p: any) => {
    setEditingId(p.id)
    setForm({ gameId: p.gameId, name: p.name, skuCode: p.skuCode, priceBuy: p.priceBuy, priceSell: p.priceSell })
  }

  const handleToggleActive = async (p: any) => {
    try {
      await adminApi.updateProduct(p.id, { isActive: !p.isActive })
      load()
    } catch (e) {
      alert('Failed to update product')
    }
  }

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
          <a className="flex items-center gap-3 px-3 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-label-md">Produk</a>
          <button onClick={() => nav('/admin/revenue')} className="flex items-center gap-3 px-3 py-2.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-colors font-label-md text-left">Laporan</button>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 text-error hover:bg-error-container/20 rounded-lg transition-colors font-label-md w-full text-left">Logout</button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-6 flex flex-col gap-6">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Kelola Produk</h2>

        <form onSubmit={handleSubmit} className="bg-surface-container p-4 rounded-xl border border-white/5 grid grid-cols-6 gap-3 items-end">
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-label-md font-label-md text-on-surface-variant">Game</label>
            <select
              value={form.gameId}
              onChange={(e) => setForm({ ...form, gameId: e.target.value })}
              className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Pilih</option>
              {games.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-label-md font-label-md text-on-surface-variant">Nama</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary" required />
          </div>
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-label-md font-label-md text-on-surface-variant">SKU Code</label>
            <input value={form.skuCode} onChange={(e) => setForm({ ...form, skuCode: e.target.value })} className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary" required />
          </div>
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-label-md font-label-md text-on-surface-variant">Harga Beli</label>
            <input type="number" value={form.priceBuy || ''} onChange={(e) => setForm({ ...form, priceBuy: parseInt(e.target.value) || 0 })} className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary" required />
          </div>
          <div className="flex flex-col gap-1 col-span-1">
            <label className="text-label-md font-label-md text-on-surface-variant">Harga Jual</label>
            <input type="number" value={form.priceSell || ''} onChange={(e) => setForm({ ...form, priceSell: parseInt(e.target.value) || 0 })} className="bg-surface-container-high border border-white/10 rounded-lg px-3 py-2.5 text-body-md focus:ring-1 focus:ring-primary" required />
          </div>
          <button type="submit" disabled={loading} className="bg-primary-container text-on-primary-container py-2.5 rounded-lg font-label-md hover:brightness-110 transition-all disabled:opacity-50 col-span-1">
            {editingId ? 'Update' : 'Tambah'}
          </button>
        </form>

        <div className="bg-surface-container rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-surface-container-lowest border-b border-white/5">
                <th className="px-4 py-3 font-label-md text-outline">Game</th>
                <th className="px-4 py-3 font-label-md text-outline">Nama</th>
                <th className="px-4 py-3 font-label-md text-outline">SKU</th>
                <th className="px-4 py-3 font-label-md text-outline">Harga Beli</th>
                <th className="px-4 py-3 font-label-md text-outline">Harga Jual</th>
                <th className="px-4 py-3 font-label-md text-outline">Status</th>
                <th className="px-4 py-3 font-label-md text-outline">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">{p.game?.name}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-primary-fixed-dim">{p.skuCode}</td>
                  <td className="px-4 py-3">{formatPrice(p.priceBuy)}</td>
                  <td className="px-4 py-3">{formatPrice(p.priceSell)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${p.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="text-primary hover:underline text-sm">Edit</button>
                    <button onClick={() => handleToggleActive(p)} className="text-on-surface-variant hover:underline text-sm">
                      {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
