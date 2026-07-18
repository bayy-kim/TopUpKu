const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

function getToken(): string | null {
  return localStorage.getItem('admin_token')
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${url}`, { headers, ...init })
  if (res.status === 401) {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_email')
    window.location.href = '/admin/login'
    throw new Error('Session expired')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const adminApi = {
  login(email: string, password: string) {
    return fetchJson<{ token: string; admin: { email: string } }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  orders(status?: string, page = 1) {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', String(page))
    return fetchJson<{
      items: Array<{
        id: string
        orderNumber: string
        game: string
        product: string
        playerId: string
        price: number
        paymentStatus: string
        topupStatus: string
        createdAt: string
        paidAt: string | null
      }>
      total: number
      page: number
      limit: number
    }>(`/api/admin/orders?${params}`)
  },
  retryOrder(id: string) {
    return fetchJson<{ success: boolean; topupStatus: string; message: string }>(
      `/api/admin/orders/${id}/retry`,
      { method: 'POST' },
    )
  },
  products() {
    return fetchJson<Array<{
      id: string
      gameId: string
      name: string
      skuCode: string
      priceBuy: number
      priceSell: number
      isActive: boolean
      game: { name: string }
    }>>('/api/admin/products')
  },
  createProduct(data: {
    gameId: string
    name: string
    skuCode: string
    priceBuy: number
    priceSell: number
  }) {
    return fetchJson<any>('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  updateProduct(id: string, data: Partial<{
    name: string
    skuCode: string
    priceBuy: number
    priceSell: number
    isActive: boolean
  }>) {
    return fetchJson<any>(`/api/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
  games() {
    return fetchJson<Array<{ id: string; name: string }>>('/api/games')
  },
  revenue(period: 'day' | 'month') {
    return fetchJson<{
      items: Array<{ date: string; revenue: number; profit: number; count: number }>
      totals: { revenue: number; profit: number; count: number }
    }>(`/api/admin/revenue?period=${period}`)
  },
}
