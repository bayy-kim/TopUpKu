import { createHash } from 'crypto'

const BASE_URL = 'https://api.digiflazz.com/v1'

function getUsername(): string {
  return process.env.DIGIFLAZZ_USERNAME ?? ''
}

function getApiKey(): string {
  return process.env.DIGIFLAZZ_API_KEY ?? ''
}

function md5(value: string): string {
  return createHash('md5').update(value).digest('hex')
}

export function generateSign(refId: string): string {
  return md5(getUsername() + getApiKey() + refId)
}

export async function createTopupTransaction(params: {
  refId: string
  skuCode: string
  customerNo: string
}): Promise<{ success: boolean; rawRequest: unknown; rawResponse: unknown }> {
  const username = getUsername()
  const sign = generateSign(params.refId)

  const body = {
    username,
    buyer_sku_code: params.skuCode,
    customer_no: params.customerNo,
    ref_id: params.refId,
    sign,
  }

  const rawRequest = JSON.parse(JSON.stringify(body))

  const res = await fetch(`${BASE_URL}/transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const rawResponse = await res.json()

  if (!res.ok) {
    return { success: false, rawRequest, rawResponse }
  }

  const data = rawResponse.data
  const isSuccess = data?.status === 'Sukses' || data?.rc === '00'

  return { success: isSuccess, rawRequest, rawResponse }
}

export function verifyDigiflazzCallback(payload: {
  ref_id: string
  status: string
  sign: string
}): boolean {
  const computed = md5(getUsername() + getApiKey() + payload.ref_id + payload.status)
  return computed === payload.sign
}
