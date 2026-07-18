import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { TopAppBar } from '../components/TopAppBar'
import { api } from '../lib/api'

const paymentMethods = [
  { group: 'QR Codes', items: [
    { id: 'qris', label: 'QRIS', icon: 'qr_code_2' },
  ]},
  { group: 'E-Wallets', items: [
    { id: 'dana', label: 'DANA', icon: 'account_balance_wallet' },
    { id: 'ovo', label: 'OVO', icon: 'account_balance_wallet' },
    { id: 'gopay', label: 'GoPay', icon: 'account_balance_wallet' },
  ]},
  { group: 'Virtual Accounts', items: [
    { id: 'bca', label: 'BCA Virtual Account', icon: 'account_balance' },
    { id: 'mandiri', label: 'Mandiri VA', icon: 'account_balance' },
  ]},
]

interface LocationState {
  productId: string
  productName: string
  price: number
  playerId: string
  serverId?: string
  gameName: string
  slug?: string
}

export default function Checkout() {
  const loc = useLocation()
  const nav = useNavigate()
  const state = loc.state as LocationState | null

  const [selectedPayment, setSelectedPayment] = useState('qris')
  const [customerContact, setCustomerContact] = useState('')

  const createOrder = useMutation({
    mutationFn: () =>
      api.orders.create({
        productId: state!.productId,
        playerId: state!.playerId,
        serverId: state!.serverId,
        customerContact: customerContact || state!.playerId,
      }),
    onSuccess: (data) => {
      nav(`/payment/${data.orderNumber}`, { state: { ...state, orderNumber: data.orderNumber, snapToken: data.snapToken, redirectUrl: data.redirectUrl } })
    },
  })

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-on-surface-variant mb-4">Tidak ada data pesanan</p>
          <button onClick={() => nav('/')} className="text-primary font-label-md">Kembali ke Beranda</button>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen pb-32 bg-surface flex justify-center">
      <main className="w-full max-w-container-max-width bg-surface flex flex-col">
        <TopAppBar title="Checkout" back />

        <div className="h-16" />

        <section className="p-edge-margin flex flex-col gap-stack-md">
          <h2 className="font-headline-md text-headline-md text-primary">Order Summary</h2>
          <div className="glass-card rounded-xl p-4 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden flex items-center justify-center text-2xl">
                🎮
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-headline-md text-on-surface">{state.gameName}</p>
                <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">{state.productName}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-body-md font-body-md text-on-surface-variant">Player ID</span>
                <span className="text-body-md font-body-md text-on-surface">{state.playerId}{state.serverId ? ` (${state.serverId})` : ''}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <span className="font-headline-md text-on-surface-variant">Total Price</span>
              <span className="font-headline-md text-primary">{formatPrice(state.price)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-label-md text-label-md px-1">Nomor WhatsApp (opsional)</label>
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="w-full bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary transition-all font-body-md text-body-md py-3 px-4"
              placeholder="Contoh: 08123456789"
              type="tel"
            />
          </div>
        </section>

        <section className="p-edge-margin flex flex-col gap-stack-lg pb-24">
          <h2 className="font-headline-md text-headline-md text-primary">Payment Method</h2>

          {paymentMethods.map((group) => (
            <div key={group.group} className="flex flex-col gap-stack-sm">
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-widest pl-1">{group.group}</p>
              {group.items.map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center justify-between p-4 rounded-xl bg-surface-container-low border cursor-pointer active:scale-[0.98] transition-all ${
                    selectedPayment === pm.id ? 'border-primary-container' : 'border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">{pm.icon}</span>
                    </div>
                    <span className="font-body-lg text-on-surface">{pm.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPayment === pm.id ? 'border-primary-container bg-primary-container' : 'border-outline'
                  }`}>
                    {selectedPayment === pm.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value={pm.id}
                    checked={selectedPayment === pm.id}
                    onChange={() => setSelectedPayment(pm.id)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          ))}
        </section>

        <div className="fixed bottom-0 w-full max-w-container-max-width p-edge-margin bg-surface-container-highest/80 backdrop-blur-md z-50">
          <button
            onClick={() => createOrder.mutate()}
            disabled={createOrder.isPending}
            className="w-full h-14 bg-primary-container text-on-primary-container font-headline-md rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {createOrder.isPending ? (
              <>Memproses...</>
            ) : (
              <>
                Bayar Sekarang - {formatPrice(state.price)}
                <span className="material-symbols-outlined">bolt</span>
              </>
            )}
          </button>
          {createOrder.isError && (
            <p className="text-error text-center mt-2 font-body-md text-body-md">
              Gagal membuat pesanan. Coba lagi.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
