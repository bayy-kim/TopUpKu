import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { verifyMidtransSignature } from '../services/midtrans.service.js'
import { createTopupTransaction } from '../services/digiflazz.service.js'

const router = Router()

router.post('/api/webhooks/midtrans', async (req, res) => {
  const payload = req.body

  const orderId: string | undefined = payload.order_id
  const statusCode: string | undefined = payload.status_code
  const grossAmount: string | undefined = payload.gross_amount
  const signatureKey: string | undefined = payload.signature_key
  const transactionStatus: string | undefined = payload.transaction_status

  if (!orderId || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  if (!verifyMidtransSignature({ order_id: orderId, status_code: statusCode, gross_amount: grossAmount, signature_key: signatureKey })) {
    res.status(403).json({ error: 'Invalid signature' })
    return
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: orderId },
    include: { product: true },
  })
  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  const isSettlement = transactionStatus === 'settlement' || transactionStatus === 'capture'

  if (isSettlement && order.paymentStatus === 'paid') {
    res.json({ status: 'ok', message: 'Already processed' })
    return
  }

  const isExpired = transactionStatus === 'expire'
  const isDeny = transactionStatus === 'deny' || transactionStatus === 'cancel'

  let newPaymentStatus = order.paymentStatus
  if (isSettlement) {
    newPaymentStatus = 'paid'
  } else if (isExpired) {
    newPaymentStatus = 'expired'
  } else if (isDeny) {
    newPaymentStatus = 'failed'
  }

  if (newPaymentStatus !== 'paid') {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: newPaymentStatus,
          paymentMethod: payload.payment_type ?? order.paymentMethod,
        },
      }),
      prisma.paymentLog.create({
        data: {
          orderId: order.id,
          gateway: 'midtrans',
          rawPayload: payload,
          status: transactionStatus,
        },
      }),
    ])

    res.json({ status: 'ok' })
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
        paymentStatus: 'paid',
        paidAt: new Date(),
        paymentMethod: payload.payment_type ?? order.paymentMethod,
        topupStatus: digiflazzSuccess ? 'processing' : 'failed',
        completedAt: digiflazzSuccess ? null : new Date(),
      },
    }),
    prisma.paymentLog.create({
      data: {
        orderId: order.id,
        gateway: 'midtrans',
        rawPayload: payload,
        status: transactionStatus,
      },
    }),
    prisma.topupLog.create({
      data: {
        orderId: order.id,
        distributor: 'digiflazz',
        rawRequest: digiflazzResult.rawRequest as Prisma.InputJsonValue,
        rawResponse: digiflazzResult.rawResponse as Prisma.InputJsonValue,
        status: digiflazzSuccess ? 'processing' : 'failed',
      },
    }),
  ])

  res.json({ status: 'ok' })
})

export default router
