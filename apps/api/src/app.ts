import express from 'express'
import cors from 'cors'
import gamesRouter from './routes/games.route.js'
import ordersRouter from './routes/orders.route.js'
import webhookPaymentRouter from './routes/webhook.payment.route.js'
import webhookDistributorRouter from './routes/webhook.distributor.route.js'
import adminRouter from './routes/admin.route.js'

const app = express()

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use(gamesRouter)
app.use(ordersRouter)
app.use(webhookPaymentRouter)
app.use(webhookDistributorRouter)
app.use(adminRouter)

export default app
