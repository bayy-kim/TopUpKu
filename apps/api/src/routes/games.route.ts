import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/api/games', async (_req, res) => {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    include: { products: { where: { isActive: true } } },
  })
  res.json(games)
})

router.get('/api/games/:slug/products', async (req, res) => {
  const { slug } = req.params
  const game = await prisma.game.findUnique({
    where: { slug },
    include: { products: { where: { isActive: true } } },
  })
  if (!game) {
    res.status(404).json({ error: 'Game not found' })
    return
  }
  res.json(game.products)
})

export default router
