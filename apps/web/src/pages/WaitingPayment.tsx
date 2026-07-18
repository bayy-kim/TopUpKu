import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useOrderStatus } from '../hooks/useGames'

interface LocationState {
  productName: string
  price: number
  gameName: string
}

export default function WaitingPayment() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const loc = useLocation()
  const nav = useNavigate()
  const state = loc.state as LocationState | null

  const { data: status } = useOrderStatus(orderNumber)

  const [timeLeft, setTimeLeft] = useState(14 * 60 + 59)

  useEffect(() => {
    if (timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(id)
  }, [timeLeft])

  useEffect(() => {
    if (status?.paymentStatus === 'paid') {
      nav(`/status/${orderNumber}`, { replace: true })
    }
  }, [status?.paymentStatus, orderNumber, nav])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const timer = `${minutes}:${String(seconds).padStart(2, '0')}`

  const formatPrice = (price: number) => `Rp ${price.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-container-max-width bg-surface relative pb-24 min-h-screen flex flex-col">
        <header className="fixed top-0 w-full max-w-container-max-width z-50 bg-surface border-b border-white/5 flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => nav('/')} className="active:scale-95 transition-transform p-2">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline-md text-headline-md text-primary font-bold">Pembayaran</h1>
          </div>
          <div className="p-2">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </div>
        </header>

        <main className="mt-20 px-4 flex-grow flex flex-col gap-6">
          <div className="flex justify-center mt-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-1.5 rounded-full flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>pending</span>
              <span className="font-label-md text-label-md uppercase tracking-wider">Menunggu Pembayaran</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-primary rounded-xl blur opacity-20" />
              <div className="relative bg-white p-4 rounded-xl">
                <div className="w-56 h-56 flex items-center justify-center bg-white">
                  <span className="text-8xl text-black">⬛</span>
                </div>
              </div>
            </div>

            <div className="text-center flex flex-col gap-2 w-full">
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-md text-label-md">Nomor Invoice</span>
                <span className="font-headline-md text-headline-md text-on-surface font-mono">{orderNumber}</span>
              </div>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 bg-primary-container/20 text-primary-fixed px-6 py-3 rounded-xl border border-primary-container/30">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <span className="font-headline-md text-headline-md font-bold">Bayar dalam {timer}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 flex flex-col gap-4">
            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Cara Bayar via QRIS
            </h3>
            {[
              'Buka aplikasi e-wallet (GoPay, OVO, Dana) atau aplikasi mobile banking Anda.',
              'Pilih menu "Scan" atau "Bayar" dan arahkan kamera ke QR Code di atas.',
              'Konfirmasi detail pembayaran dan selesaikan transaksi dengan memasukkan PIN Anda.',
            ].map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-container-high border border-white/5 flex items-center justify-center font-bold text-primary">
                  {i + 1}
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary-container">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-on-surface-variant font-label-md text-label-md">Total Tagihan</p>
                <p className="font-headline-lg text-headline-lg text-primary font-bold">{formatPrice(state?.price ?? 0)}</p>
              </div>
              {state?.productName && (
                <span className="text-on-surface-variant font-body-md text-body-md">{state.productName}</span>
              )}
            </div>
          </div>
        </main>

        <footer className="fixed bottom-0 w-full max-w-container-max-width bg-surface-container p-4 border-t border-white/5">
          <button
            onClick={() => nav(`/status/${orderNumber}`, { replace: true })}
            className="w-full bg-primary-container text-on-primary-container h-14 rounded-xl font-headline-md font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined">sync</span>
            Cek Status Pembayaran
          </button>
          <p className="text-center text-on-surface-variant font-label-md text-label-md mt-3">
            Pesanan Anda diproses otomatis setelah pembayaran terdeteksi.
          </p>
        </footer>
      </div>
    </div>
  )
}
