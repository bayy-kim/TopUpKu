import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: api.games.list,
  })
}

export function useGameProducts(slug: string) {
  return useQuery({
    queryKey: ['games', slug, 'products'],
    queryFn: () => api.games.products(slug),
    enabled: !!slug,
  })
}

export function useOrderStatus(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => api.orders.status(orderNumber!),
    enabled: !!orderNumber,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 3000
      const isFinal = data.paymentStatus === 'paid' && (data.topupStatus === 'success' || data.topupStatus === 'failed')
      return isFinal ? false : 3000
    },
  })
}
