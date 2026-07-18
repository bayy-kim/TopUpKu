const API_BASE = import.meta.env.VITE_API_URL ?? 'https://top-up-ku-api-git-main-bayy-kims-projects.vercel.app'

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  games: {
    list() {
      return fetchJson<import('../types').Game[]>('/api/games')
    },
    products(slug: string) {
      return fetchJson<import('../types').Product[]>(`/api/games/${slug}/products`)
    },
  },
  orders: {
    create(body: import('../types').CreateOrderPayload) {
      return fetchJson<import('../types').CreateOrderResponse>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
      })
    },
    status(orderNumber: string) {
      return fetchJson<import('../types').OrderStatus>(`/api/orders/${orderNumber}`)
    },
  },
}
