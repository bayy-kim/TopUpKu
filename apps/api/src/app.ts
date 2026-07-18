import express from 'express'
import cors from 'cors'
import gamesRouter from './routes/games.route'
import ordersRouter from './routes/orders.route'
import webhookPaymentRouter from './routes/webhook.payment.route'
import webhookDistributorRouter from './routes/webhook.distributor.route'
import adminRouter from './routes/admin.route'

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
