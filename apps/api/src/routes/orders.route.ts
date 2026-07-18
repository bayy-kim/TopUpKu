import { Router } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { createSnapTransaction } from '../services/midtrans.service'

const router = Router()

const createOrderSchema = z.object({
  productId: z.string(),
  playerId: z.string().min(1),
  serverId: z.string().optional(),
  customerContact: z.string().min(1),
  customerEmail: z.string().email().optional(),
})

function generateOrderNumber(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const rand = String(Math.floor(100000 + Math.random() * 900000))
  return `INV-${y}${m}${d}-${rand}`
}

router.post('/api/orders', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const { productId, playerId, serverId, customerContact, customerEmail } = parsed.data

  const product = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
  })
  if (!product) {
    res.status(400).json({ error: 'Product not found or inactive' })
    return
  }

  const orderNumber = generateOrderNumber()

  const order = await prisma.order.create({
    data: {
      orderNumber,
      productId: product.id,
      playerId,
      serverId: serverId ?? null,
      customerContact,
      price: product.priceSell,
      paymentStatus: 'pending',
      topupStatus: 'pending',
    },
  })

  try {
    const snap = await createSnapTransaction({
      orderId: orderNumber,
      grossAmount: product.priceSell,
      customer: { email: customerEmail },
    })

    res.status(201).json({
      orderNumber: order.orderNumber,
      snapToken: snap.token,
      redirectUrl: snap.redirectUrl,
    })
  } catch (err) {
    res.status(502).json({
      error: 'Failed to create payment',
      detail: err instanceof Error ? err.message : undefined,
    })
  }
})

router.get('/api/orders/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      product: { select: { name: true, game: { select: { name: true } } } },
    },
  })

  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  res.json({
    orderNumber: order.orderNumber,
    game: order.product.game.name,
    product: order.product.name,
    playerId: order.playerId,
    serverId: order.serverId,
    price: order.price,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    topupStatus: order.topupStatus,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    completedAt: order.completedAt,
  })
})

export default router
