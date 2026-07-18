import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../../lib/adminApi'

export default function AdminLogin() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await adminApi.login(email, password)
      localStorage.setItem('admin_token', res.token)
      localStorage.setItem('admin_email', res.admin.email)
      nav('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface-container rounded-xl p-6 border border-white/5 flex flex-col gap-4">
        <div className="text-center mb-2">
          <h1 className="font-headline-md text-headline-md text-primary">Admin Login</h1>
          <p className="text-body-md text-on-surface-variant mt-1">TopUpKu Dashboard</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-md font-label-md text-on-surface-variant">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container-high border-none rounded-xl text-on-surface px-4 py-3 focus:ring-2 focus:ring-primary"
            type="email"
            placeholder="admin@topupku.com"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-label-md font-label-md text-on-surface-variant">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container-high border-none rounded-xl text-on-surface px-4 py-3 focus:ring-2 focus:ring-primary"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <p className="text-error text-body-md text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-container text-on-primary-container py-3 rounded-xl font-headline-md hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Login'}
        </button>

        <p className="text-center text-body-md text-on-surface-variant text-sm">
          Default: admin@topupku.com / admin123
        </p>
      </form>
    </div>
  )
}
