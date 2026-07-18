import { useParams, useNavigate } from 'react-router-dom'
import { useOrderStatus } from '../hooks/useGames'

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20', icon: 'pending' },
  paid: { label: 'Dibayar — Diproses', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: 'sync' },
  processing: { label: 'Sedang Diproses', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: 'sync' },
  success: { label: 'Berhasil', color: 'text-green-500 bg-green-500/10 border-green-500/20', icon: 'check_circle' },
  failed: { label: 'Gagal', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: 'error' },
  expired: { label: 'Kedaluwarsa', color: 'text-red-500 bg-red-500/10 border-red-500/20', icon: 'timer_off' },
}

export default function TransactionStatus() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const nav = useNavigate()
  const { data: status, isLoading } = useOrderStatus(orderNumber)

  const payStatus = status?.paymentStatus ?? 'pending'
  const topStatus = status?.topupStatus ?? 'pending'

  const displayStatus = topStatus !== 'pending' ? topStatus : payStatus
  const cfg = statusConfig[displayStatus] ?? statusConfig.pending

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const isComplete = displayStatus === 'success' || displayStatus === 'failed' || displayStatus === 'expired'

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      <header className="fixed top-0 w-full max-w-container-max-width z-50 bg-surface border-b border-white/5 flex items-center justify-between px-4 h-16">
        <button onClick={() => nav('/')} className="active:scale-95 transition-transform hover:bg-surface-container-high p-2 rounded-xl">
          <span className="material-symbols-outlined text-primary">arrow_back</span>
        </button>
        <h1 className="font-headline-md text-headline-md text-primary">Status Transaksi</h1>
        <button className="active:scale-95 transition-transform hover:bg-surface-container-high p-2 rounded-xl">
          <span className="material-symbols-outlined text-on-surface-variant">share</span>
        </button>
      </header>

      <main className="w-full max-w-container-max-width mt-16 px-edge-margin pb-24 pt-8 flex flex-col gap-stack-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-on-surface-variant">Memuat status...</p>
          </div>
        ) : (
          <>
            <section className="flex flex-col items-center text-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-on-surface-variant tracking-widest">INVOICE NUMBER</span>
                <p className="font-headline-md text-headline-md text-on-surface font-bold">{orderNumber}</p>
              </div>
              <div className={`${cfg.color} font-bold px-8 py-3 rounded-xl flex items-center gap-2`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
                  {cfg.icon}
                </span>
                <span className="uppercase tracking-wider text-lg">{cfg.label}</span>
              </div>
            </section>

            <div className="relative h-24 w-full rounded-xl border border-white/5 bg-surface-container-low flex items-center px-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined">sports_esports</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md leading-tight">Transaction Secured</h3>
                  <p className="font-label-md text-label-md text-primary/70">Verified by TopUpKu SecureGate</p>
                </div>
              </div>
            </div>

            <section className="bg-surface-container border border-white/5 rounded-xl overflow-hidden">
              <div className="p-edge-margin bg-white/5 border-b border-white/5">
                <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  Rincian Pesanan
                </h2>
              </div>
              <div className="p-edge-margin flex flex-col gap-4">
                <Row label="Game Name" value={status?.game ?? '-'} />
                <Row label="Nominal" value={status?.product ?? '-'} icon="diamond" iconColor="text-yellow-400" />
                <Row label="Player ID" value={`${status?.playerId ?? ''}${status?.serverId ? ` (${status.serverId})` : ''}`} />
                <Row label="Transaction Time" value={formatDate(status?.createdAt)} />
                <hr className="border-white/5" />
                <Row label="Payment Method" value={status?.paymentMethod ?? 'QRIS'} badge />
                {status?.completedAt && (
                  <Row label="Completed At" value={formatDate(status.completedAt)} />
                )}
              </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => nav('/')}
                className="bg-primary-container p-4 rounded-xl flex flex-col items-center gap-2 hover:brightness-110 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-on-primary-container">home</span>
                <span className="font-label-md text-label-md text-on-primary-container">Beranda</span>
              </button>
              <button className="bg-surface-container border border-white/5 p-4 rounded-xl flex flex-col items-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all">
                <span className="material-symbols-outlined text-primary">download</span>
                <span className="font-label-md text-label-md">Simpan Bukti</span>
              </button>
            </div>

            {!isComplete && (
              <footer className="text-center">
                <div className="bg-surface/80 backdrop-blur-md inline-block px-4 py-2 rounded-full border border-white/5">
                  <p className="font-label-md text-label-md text-on-surface-variant italic">
                    Status akan otomatis diperbarui
                  </p>
                </div>
              </footer>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function Row({ label, value, icon, iconColor, badge }: {
  label: string
  value: string
  icon?: string
  iconColor?: string
  badge?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-body-md text-body-md text-on-surface-variant">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <span className={`material-symbols-outlined ${iconColor ?? ''} text-sm`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{icon}</span>}
        {badge ? (
          <span className="bg-surface-container-high px-2 py-1 rounded-lg border border-white/5 font-label-md text-label-md">{value}</span>
        ) : (
          <span className="font-body-md text-body-md text-on-surface font-semibold">{value}</span>
        )}
      </div>
    </div>
  )
}
