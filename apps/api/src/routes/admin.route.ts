import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'
import prisma from '../lib/prisma'
import { adminAuth } from '../middlewares/auth'
import { createTopupTransaction } from '../services/digiflazz.service'

const router = Router()

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? ''
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, try again later' },
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/api/admin/login', loginLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid email or password format' })
    return
  }

  const { email, password } = parsed.data
  const admin = await prisma.admin.findUnique({ where: { email } })
  if (!admin) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, admin.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = jwt.sign({ adminId: admin.id, email: admin.email }, getJwtSecret(), {
    expiresIn: '8h',
  })

  res.json({ token, admin: { email: admin.email } })
})

router.get('/api/admin/orders', adminAuth, async (req, res) => {
  const status = req.query.status as string | undefined
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
  const skip = (page - 1) * limit

  const where: any = {}
  if (status && ['pending', 'paid', 'processing', 'success', 'failed', 'expired'].includes(status)) {
    where.OR = [
      { paymentStatus: status },
      { topupStatus: status },
    ]
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, game: { select: { name: true } } },
        },
      },
    }),
    prisma.order.count({ where }),
  ])

  const items = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    game: o.product.game.name,
    product: o.product.name,
    playerId: o.playerId,
    serverId: o.serverId,
    price: o.price,
    paymentStatus: o.paymentStatus,
    topupStatus: o.topupStatus,
    createdAt: o.createdAt,
    paidAt: o.paidAt,
    completedAt: o.completedAt,
  }))

  res.json({ items, total, page, limit })
})

const orderIdSchema = z.object({
  id: z.string(),
})

router.post('/api/admin/orders/:id/retry', adminAuth, async (req, res) => {
  const { id } = req.params as z.infer<typeof orderIdSchema>

  const order = await prisma.order.findUnique({
    where: { id },
    include: { product: true },
  })

  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  if (order.topupStatus !== 'failed') {
    res.status(400).json({ error: 'Only failed orders can be retried' })
    return
  }

  if (order.paymentStatus !== 'paid') {
    res.status(400).json({ error: 'Order payment has not been completed' })
    return
  }

  const playerId = order.playerId
  const serverId = order.serverId
  const customerNo = serverId ? `${playerId}#${serverId}` : playerId

  const digiflazzResult = await createTopupTransaction({
    refId: order.orderNumber,
    skuCode: order.product.skuCode,
    customerNo,
  })

  const digiflazzSuccess = digiflazzResult.success

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        topupStatus: digiflazzSuccess ? 'processing' : 'failed',
        completedAt: digiflazzSuccess ? null : new Date(),
      },
    }),
    prisma.topupLog.create({
      data: {
        orderId: order.id,
        distributor: 'digiflazz',
        rawRequest: digiflazzResult.rawRequest as Prisma.InputJsonValue,
        rawResponse: digiflazzResult.rawResponse as Prisma.InputJsonValue,
        status: digiflazzSuccess ? 'processing' : 'retry-failed',
      },
    }),
  ])

  res.json({
    success: digiflazzSuccess,
    topupStatus: digiflazzSuccess ? 'processing' : 'failed',
    message: digiflazzSuccess ? 'Top up retry initiated' : 'Retry failed',
  })
})

const productSchema = z.object({
  gameId: z.string(),
  name: z.string().min(1),
  skuCode: z.string().min(1),
  priceBuy: z.number().int().positive(),
  priceSell: z.number().int().positive(),
  isActive: z.boolean().optional(),
})

router.get('/api/admin/products', adminAuth, async (_req, res) => {
  const products = await prisma.product.findMany({
    include: { game: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(products)
})

router.post('/api/admin/products', adminAuth, async (req, res) => {
  const parsed = productSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const game = await prisma.game.findUnique({ where: { id: parsed.data.gameId } })
  if (!game) {
    res.status(400).json({ error: 'Game not found' })
    return
  }

  const product = await prisma.product.create({ data: parsed.data })
  res.status(201).json(product)
})

const productUpdateSchema = productSchema.partial()

router.put('/api/admin/products/:id', adminAuth, async (req, res) => {
  const id = String(req.params.id)
  const parsed = productUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const existing = await prisma.product.findUnique({ where: { id } })
  if (!existing) {
    res.status(404).json({ error: 'Product not found' })
    return
  }

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  })
  res.json(product)
})

router.get('/api/admin/revenue', adminAuth, async (req, res) => {
  const period = req.query.period === 'month' ? 'month' : 'day'

  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'paid',
      topupStatus: 'success',
    },
    select: {
      price: true,
      paidAt: true,
      product: {
        select: { priceBuy: true },
      },
    },
  })

  const now = new Date()
  const groups: Record<string, { revenue: number; profit: number; count: number }> = {}

  for (const o of orders) {
    if (!o.paidAt) continue
    const key = period === 'month'
      ? `${o.paidAt.getFullYear()}-${String(o.paidAt.getMonth() + 1).padStart(2, '0')}`
      : `${o.paidAt.getFullYear()}-${String(o.paidAt.getMonth() + 1).padStart(2, '0')}-${String(o.paidAt.getDate()).padStart(2, '0')}`

    if (!groups[key]) groups[key] = { revenue: 0, profit: 0, count: 0 }
    groups[key].revenue += o.price
    groups[key].profit += o.price - o.product.priceBuy
    groups[key].count++
  }

  const items = Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({ date, ...data }))

  const totals = items.reduce(
    (acc, cur) => ({
      revenue: acc.revenue + cur.revenue,
      profit: acc.profit + cur.profit,
      count: acc.count + cur.count,
    }),
    { revenue: 0, profit: 0, count: 0 },
  )

  res.json({ items, totals })
})

export default router
