import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { TopAppBar } from '../components/TopAppBar'
import { useGameProducts } from '../hooks/useGames'
import type { Product } from '../types'

const playerSchema = z.object({
  playerId: z.string().min(1, 'Player ID wajib diisi'),
  serverId: z.string().optional(),
})

type PlayerForm = z.infer<typeof playerSchema>

const gameIcons: Record<string, string> = {
  'mobile-legends': '🎮',
  'free-fire': '🔥',
  'pubg-mobile': '🎯',
}

export default function GameDetail() {
  const { slug } = useParams<{ slug: string }>()
  const nav = useNavigate()
  const { data: products, isLoading } = useGameProducts(slug ?? '')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<PlayerForm>({
    resolver: zodResolver(playerSchema),
  })

  const gameName = products?.[0]?.name
    ? slug?.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''

  const displayName = products?.[0]?.name ? products[0].name.split(' ').slice(0, 2).join(' ') : gameName

  const onSubmit = (data: PlayerForm) => {
    if (!selectedProduct) return
    nav('/checkout', {
      state: {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        price: selectedProduct.priceSell,
        playerId: data.playerId,
        serverId: data.serverId || undefined,
        gameName: displayName,
        slug,
      },
    })
  }

  const formatPrice = (price: number) =>
    `Rp ${price.toLocaleString('id-ID')}`

  return (
    <div className="min-h-screen pb-32 bg-surface-container-lowest">
      <TopAppBar title="TopUpKu" back />

      <main className="max-w-container-max-width mx-auto pt-20 px-edge-margin flex flex-col gap-stack-lg">
        <section className="relative rounded-xl overflow-hidden aspect-[16/9] flex items-end p-4 bg-surface-container-highest">
          <div className="flex items-center gap-4 z-10">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-surface-container flex items-center justify-center text-4xl">
              {gameIcons[slug ?? ''] ?? '🎮'}
            </div>
            <div>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface leading-tight">
                {displayName}
              </h2>
              <p className="text-on-surface-variant font-body-md text-body-md">Moonton • Game MOBA</p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="bg-surface-container rounded-xl p-4 border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">1</span>
              <h3 className="font-headline-md text-headline-md text-on-surface">Lengkapi Data</h3>
            </div>
            <div className="grid grid-cols-2 gap-stack-md">
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-label-md text-label-md px-1">Player ID</label>
                <input
                  {...register('playerId')}
                  className="w-full bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary transition-all font-body-md text-body-md py-3 px-4"
                  placeholder="Contoh: 12345678"
                  type="text"
                  inputMode="numeric"
                />
                {errors.playerId && (
                  <p className="text-error font-body-md text-[12px] px-1">{errors.playerId.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-on-surface-variant font-label-md text-label-md px-1">Zone ID</label>
                <input
                  {...register('serverId')}
                  className="w-full bg-surface-container-high border-none rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary transition-all font-body-md text-body-md py-3 px-4"
                  placeholder="1234"
                  type="text"
                  inputMode="numeric"
                />
              </div>
            </div>
            <p className="text-error font-body-md text-[12px] flex items-start gap-1.5 leading-tight bg-error-container/10 p-3 rounded-lg border border-error/10">
              <span className="material-symbols-outlined text-[16px] mt-0.5">warning</span>
              Pastikan Player ID dan Zone ID sudah benar sebelum lanjut ke proses pembayaran.
            </p>
          </section>

          <section className="flex flex-col gap-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold">2</span>
                <h3 className="font-headline-md text-headline-md text-on-surface">Pilih Nominal</h3>
              </div>
              <span className="text-primary font-label-md text-label-md">Diamonds</span>
            </div>

            {isLoading ? (
              <p className="text-on-surface-variant text-center py-8">Memuat...</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products?.map((p) => {
                  const selected = selectedProduct?.id === p.id
                  return (
                    <div key={p.id} className="relative">
                      <input
                        type="radio"
                        name="product"
                        id={p.id}
                        checked={selected}
                        onChange={() => setSelectedProduct(p)}
                        className="hidden"
                      />
                      <label
                        htmlFor={p.id}
                        className={`block rounded-xl p-4 cursor-pointer active:scale-95 transition-all border ${
                          selected
                            ? 'bg-surface-container border-primary'
                            : 'bg-surface-container border-white/5 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>diamond</span>
                          {selected && (
                            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                          )}
                        </div>
                        <div className="font-headline-md text-headline-md text-on-surface">{p.name}</div>
                        <div className="text-on-surface-variant font-body-md text-body-md mt-1">{formatPrice(p.priceSell)}</div>
                      </label>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="bg-surface-container-low rounded-xl p-4 border border-dashed border-white/5 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center text-[10px] font-bold">3</span>
                <h3 className="font-headline-md text-headline-md text-on-surface opacity-50">Metode Pembayaran</h3>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50">lock</span>
            </div>
            <p className="text-on-surface-variant/40 font-body-md text-body-md mt-2 text-center">Pilih nominal terlebih dahulu untuk membuka metode pembayaran</p>
          </section>

          <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-container-max-width bg-surface-container-high p-4 rounded-t-xl z-50 border-t border-white/5">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <span className="text-on-surface-variant font-label-md text-[10px] uppercase tracking-widest opacity-70">Total Bayar</span>
                <span className="text-primary font-headline-lg text-headline-lg">
                  {selectedProduct ? formatPrice(selectedProduct.priceSell) : 'Rp 0'}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={!selectedProduct}
              className="w-full py-4 bg-primary-container text-on-primary-container font-headline-md text-headline-md rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <span>Lanjut ke Pembayaran</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
