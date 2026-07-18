export interface Game {
  id: string
  name: string
  slug: string
  iconUrl: string | null
  isActive: boolean
  products: Product[]
  createdAt: string
}

export interface Product {
  id: string
  gameId: string
  name: string
  skuCode: string
  priceBuy: number
  priceSell: number
  isActive: boolean
  createdAt: string
}

export interface CreateOrderPayload {
  productId: string
  playerId: string
  serverId?: string
  customerContact: string
  customerEmail?: string
}

export interface CreateOrderResponse {
  orderNumber: string
  snapToken: string
  redirectUrl: string
}

export interface OrderStatus {
  orderNumber: string
  game: string
  product: string
  playerId: string
  serverId: string | null
  price: number
  paymentMethod: string | null
  paymentStatus: string
  topupStatus: string
  createdAt: string
  paidAt: string | null
  completedAt: string | null
}
