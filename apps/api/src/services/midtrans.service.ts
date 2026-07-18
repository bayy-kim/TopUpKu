import { createHash } from 'crypto'

export function getMidtransBaseUrl(): string {
  return process.env.MIDTRANS_IS_PRODUCTION === 'true'
    ? 'https://app.midtrans.com/snap/v1'
    : 'https://app.sandbox.midtrans.com/snap/v1'
}

function getServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY ?? ''
}

export async function createSnapTransaction(params: {
  orderId: string
  grossAmount: number
  customer?: { email?: string; phone?: string }
}): Promise<{ token: string; redirectUrl: string }> {
  const serverKey = getServerKey()
  const baseUrl = getMidtransBaseUrl()
  const auth = Buffer.from(`${serverKey}:`).toString('base64')

  const body = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.grossAmount,
    },
    customer_details: params.customer,
  }

  const res = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Midtrans Snap error (${res.status}): ${text}`)
  }

  const data = await res.json()
  return { token: data.token, redirectUrl: data.redirect_url }
}

export function verifyMidtransSignature(payload: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean {
  const serverKey = getServerKey()
  const computed = createHash('sha512')
    .update(payload.order_id + payload.status_code + payload.gross_amount + serverKey)
    .digest('hex')
  return computed === payload.signature_key
}
