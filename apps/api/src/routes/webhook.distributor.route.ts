import { Router } from 'express'
import prisma from '../lib/prisma'
import { verifyDigiflazzCallback } from '../services/digiflazz.service'

const router = Router()

router.post('/api/webhooks/digiflazz', async (req, res) => {
  const payload = req.body

  const refId: string | undefined = payload.ref_id
  const status: string | undefined = payload.status
  const sign: string | undefined = payload.sign

  if (!refId || !status || !sign) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  if (!verifyDigiflazzCallback({ ref_id: refId, status, sign })) {
    res.status(403).json({ error: 'Invalid signature' })
    return
  }

  const order = await prisma.order.findUnique({ where: { orderNumber: refId } })
  if (!order) {
    res.status(404).json({ error: 'Order not found' })
    return
  }

  if (order.topupStatus === 'success' || order.topupStatus === 'failed') {
    res.json({ status: 'ok', message: 'Already processed' })
    return
  }

  const isSuccess = status === 'Sukses'
  const isProcessing = status === 'Processing' || status === 'Pending'
  const isFailed = !isSuccess && !isProcessing

  let newTopupStatus: string
  if (isSuccess) {
    newTopupStatus = 'success'
  } else if (isProcessing) {
    res.json({ status: 'ok' })
    return
  } else {
    newTopupStatus = 'failed'
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: {
        topupStatus: newTopupStatus,
        completedAt: isSuccess ? new Date() : order.completedAt,
      },
    }),
    prisma.topupLog.create({
      data: {
        orderId: order.id,
        distributor: 'digiflazz',
        rawRequest: {},
        rawResponse: payload,
        status,
      },
    }),
  ])

  res.json({ status: 'ok' })
})

export default router
