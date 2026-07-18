import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../app'
import type { PrismaClient } from '@prisma/client'

vi.mock('../lib/prisma', () => ({
  default: {
    order: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
    product: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    game: { findUnique: vi.fn(), findMany: vi.fn() },
    admin: { findUnique: vi.fn() },
    paymentLog: { create: vi.fn() },
    topupLog: { create: vi.fn() },
    $transaction: vi.fn((ops: any[]) => Promise.all(ops)),
  },
}))

vi.mock('../services/midtrans.service', () => ({
  createSnapTransaction: vi.fn(),
  verifyMidtransSignature: vi.fn(),
  getMidtransBaseUrl: vi.fn(() => 'https://app.sandbox.midtrans.com/snap/v1'),
}))

vi.mock('bcryptjs', () => {
  const mock = { compare: vi.fn(() => true), hash: vi.fn(() => 'mocked-hash') }
  return { default: mock, ...mock }
})

vi.mock('../services/digiflazz.service', () => ({
  createTopupTransaction: vi.fn(),
  verifyDigiflazzCallback: vi.fn(),
  generateSign: vi.fn(() => 'mocked-sign'),
}))

import prisma from '../lib/prisma'
import { createSnapTransaction, verifyMidtransSignature } from '../services/midtrans.service'
import { createTopupTransaction, verifyDigiflazzCallback } from '../services/digiflazz.service'

const mockedPrisma = prisma as unknown as {
  order: {
    findUnique: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
  product: { findUnique: ReturnType<typeof vi.fn> }
  admin: { findUnique: ReturnType<typeof vi.fn> }
  paymentLog: { create: ReturnType<typeof vi.fn> }
  topupLog: { create: ReturnType<typeof vi.fn> }
  $transaction: ReturnType<typeof vi.fn>
}

const mockCreateSnap = vi.mocked(createSnapTransaction)
const mockVerifyMidtrans = vi.mocked(verifyMidtransSignature)
const mockCreateTopup = vi.mocked(createTopupTransaction)
const mockVerifyDigiflazz = vi.mocked(verifyDigiflazzCallback)

const product = {
  id: 'prod-1', gameId: 'game-1', name: '86 Diamonds', skuCode: 'mlbb-86',
  priceBuy: 16000, priceSell: 18000, isActive: true, createdAt: new Date(),
  game: { name: 'Mobile Legends' },
}
const order = {
  id: 'order-1', orderNumber: 'INV-20260718-123456',
  productId: 'prod-1', playerId: '12345', serverId: '6789',
  customerContact: '08123456789', price: 18000,
  paymentMethod: null as string | null,
  paymentStatus: 'pending', topupStatus: 'pending',
  createdAt: new Date(), paidAt: null, completedAt: null,
  product,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Alur Sukses Penuh: order → bayar → webhook → topup → sukses', () => {
  it('POST /api/orders — membuat order baru dan menghasilkan snap token', async () => {
    mockedPrisma.product.findUnique.mockResolvedValue(product)
    mockedPrisma.order.create.mockResolvedValue(order)
    mockCreateSnap.mockResolvedValue({ token: 'snap-token-xyz', redirectUrl: 'https://app.sandbox.midtrans.com/snap/v2/xyz' })

    const res = await request(app)
      .post('/api/orders')
      .send({ productId: 'prod-1', playerId: '12345', serverId: '6789', customerContact: '08123456789' })

    expect(res.status).toBe(201)
    expect(res.body.orderNumber).toBe(order.orderNumber)
    expect(res.body.snapToken).toBe('snap-token-xyz')
    expect(mockedPrisma.order.create).toHaveBeenCalledTimes(1)
  })

  it('POST /api/webhooks/midtrans — settlement → update paid, panggil Digiflazz', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({ ...order, paymentStatus: 'pending', topupStatus: 'pending' })
    mockVerifyMidtrans.mockReturnValue(true)
    mockCreateTopup.mockResolvedValue({
      success: true, rawRequest: { ref_id: 'INV-20260718-123456' }, rawResponse: { data: { status: 'Sukses' } },
    })

    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({
        order_id: 'INV-20260718-123456',
        status_code: '200',
        gross_amount: '18000',
        signature_key: 'valid-sig',
        transaction_status: 'settlement',
        payment_type: 'qris',
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(mockVerifyMidtrans).toHaveBeenCalledTimes(1)
    expect(mockCreateTopup).toHaveBeenCalledTimes(1)
    expect(mockCreateTopup).toHaveBeenCalledWith({
      refId: 'INV-20260718-123456',
      skuCode: 'mlbb-86',
      customerNo: '12345#6789',
    })
    expect(mockedPrisma.paymentLog.create).toHaveBeenCalledTimes(1)
    expect(mockedPrisma.topupLog.create).toHaveBeenCalledTimes(1)
  })

  it('POST /api/webhooks/digiflazz — callback Sukses → update topupStatus success', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({
      ...order,
      paymentStatus: 'paid',
      topupStatus: 'processing',
      paidAt: new Date(),
    })
    mockVerifyDigiflazz.mockReturnValue(true)

    const res = await request(app)
      .post('/api/webhooks/digiflazz')
      .send({ ref_id: 'INV-20260718-123456', status: 'Sukses', sign: 'valid-digiflazz-sign' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(mockVerifyDigiflazz).toHaveBeenCalledTimes(1)
    expect(mockedPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order-1' },
        data: expect.objectContaining({ topupStatus: 'success' }),
      }),
    )
  })

  it('GET /api/orders/:orderNumber — return status akhir sukses', async () => {
    const completedOrder = {
      ...order,
      paymentStatus: 'paid',
      topupStatus: 'success',
      paidAt: new Date(),
      completedAt: new Date(),
    }
    mockedPrisma.order.findUnique.mockResolvedValue(completedOrder)

    const res = await request(app).get('/api/orders/INV-20260718-123456')

    expect(res.status).toBe(200)
    expect(res.body.paymentStatus).toBe('paid')
    expect(res.body.topupStatus).toBe('success')
  })
})

describe('Alur Gagal — Payment Expired', () => {
  it('POST /api/webhooks/midtrans — expire → update paymentStatus expired', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({ ...order, paymentStatus: 'pending', topupStatus: 'pending' })
    mockVerifyMidtrans.mockReturnValue(true)

    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({
        order_id: 'INV-20260718-123456',
        status_code: '200',
        gross_amount: '18000',
        signature_key: 'valid-sig',
        transaction_status: 'expire',
      })

    expect(res.status).toBe(200)
    expect(mockedPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ paymentStatus: 'expired' }),
      }),
    )
    expect(mockCreateTopup).not.toHaveBeenCalled()
  })
})

describe('Alur Gagal — Topup Gagal dari Distributor', () => {
  it('Midtrans settlement + Digiflazz gagal → topupStatus failed', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({ ...order, paymentStatus: 'pending', topupStatus: 'pending' })
    mockVerifyMidtrans.mockReturnValue(true)
    mockCreateTopup.mockResolvedValue({
      success: false,
      rawRequest: {},
      rawResponse: { data: { status: 'Gagal', rc: '99' } },
    })

    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({
        order_id: 'INV-20260718-123456',
        status_code: '200',
        gross_amount: '18000',
        signature_key: 'valid-sig',
        transaction_status: 'settlement',
        payment_type: 'qris',
      })

    expect(res.status).toBe(200)
    expect(mockedPrisma.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ topupStatus: 'failed' }),
      }),
    )
    expect(mockedPrisma.topupLog.create).toHaveBeenCalledTimes(1)
  })

  it('Admin retry manual — POST /api/admin/orders/:id/retry', async () => {
    process.env.JWT_SECRET = 'test-secret'
    const failedOrder = {
      ...order,
      paymentStatus: 'paid',
      topupStatus: 'failed',
      paidAt: new Date(),
      completedAt: new Date(),
    }
    mockedPrisma.admin.findUnique.mockResolvedValue({
      id: 'admin-1', email: 'admin@topupku.com', passwordHash: '', createdAt: new Date(),
    })
    mockedPrisma.order.findUnique.mockResolvedValue(failedOrder)
    mockCreateTopup.mockResolvedValue({
      success: true,
      rawRequest: { ref_id: 'INV-20260718-123456' },
      rawResponse: { data: { status: 'Sukses' } },
    })

    const loginRes = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@topupku.com', password: 'admin123' })
    const token = loginRes.body.token

    const retryRes = await request(app)
      .post('/api/admin/orders/order-1/retry')
      .set('Authorization', `Bearer ${token}`)

    expect(retryRes.status).toBe(200)
    expect(retryRes.body.success).toBe(true)
    expect(mockedPrisma.order.update).toHaveBeenCalled()
    const updateCalls = mockedPrisma.order.update.mock.calls
    const lastCall = updateCalls[updateCalls.length - 1]
    expect(lastCall[0].data.topupStatus).toBe('processing')
  })
})

describe('Webhook Dobel — Idempotent / No Double-Process', () => {
  it('Webhook settlement terkirim dua kali — kedua kalinya di-skip', async () => {
    const orderPaid = {
      ...order,
      paymentStatus: 'paid',
      topupStatus: 'processing',
      paidAt: new Date(),
    }
    mockVerifyMidtrans.mockReturnValue(true)

    mockedPrisma.order.findUnique.mockResolvedValue(orderPaid)

    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({
        order_id: 'INV-20260718-123456',
        status_code: '200',
        gross_amount: '18000',
        signature_key: 'valid-sig',
        transaction_status: 'settlement',
        payment_type: 'qris',
      })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Already processed')
    expect(mockedPrisma.paymentLog.create).not.toHaveBeenCalled()
    expect(mockedPrisma.topupLog.create).not.toHaveBeenCalled()
    expect(mockCreateTopup).not.toHaveBeenCalled()
  })

  it('Digiflazz callback Sukses terkirim dua kali — kedua kalinya di-skip', async () => {
    const orderSuccess = {
      ...order,
      paymentStatus: 'paid',
      topupStatus: 'success',
      paidAt: new Date(),
      completedAt: new Date(),
    }
    mockVerifyDigiflazz.mockReturnValue(true)
    mockedPrisma.order.findUnique.mockResolvedValue(orderSuccess)

    const res = await request(app)
      .post('/api/webhooks/digiflazz')
      .send({ ref_id: 'INV-20260718-123456', status: 'Sukses', sign: 'valid-sign' })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Already processed')
    expect(mockedPrisma.order.update).not.toHaveBeenCalled()
    expect(mockedPrisma.topupLog.create).not.toHaveBeenCalled()
  })
})

describe('Validasi Input & Error Handling', () => {
  it('POST /api/orders — missing fields → 400', async () => {
    const res = await request(app).post('/api/orders').send({})
    expect(res.status).toBe(400)
  })

  it('POST /api/webhooks/midtrans — signature tidak valid → 403', async () => {
    mockVerifyMidtrans.mockReturnValue(false)

    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({
        order_id: 'INV-20260718-123456', status_code: '200',
        gross_amount: '18000', signature_key: 'invalid-sig',
        transaction_status: 'settlement',
      })

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Invalid signature')
  })

  it('POST /api/webhooks/midtrans — missing fields → 400', async () => {
    const res = await request(app)
      .post('/api/webhooks/midtrans')
      .send({ order_id: 'INV-20260718-123456' })
    expect(res.status).toBe(400)
  })

  it('POST /api/webhooks/digiflazz — signature tidak valid → 403', async () => {
    mockVerifyDigiflazz.mockReturnValue(false)

    const res = await request(app)
      .post('/api/webhooks/digiflazz')
      .send({ ref_id: 'INV-20260718-123456', status: 'Sukses', sign: 'invalid' })

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Invalid signature')
  })

  it('GET /api/orders/:orderNumber — order tidak ditemukan → 404', async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null)
    const res = await request(app).get('/api/orders/NONEXISTENT')
    expect(res.status).toBe(404)
  })
})
