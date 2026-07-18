import { useState } from 'react'
import { TopAppBar } from '../components/TopAppBar'
import { BottomNavBar } from '../components/BottomNavBar'
import { GameCard } from '../components/GameCard'
import { useGames } from '../hooks/useGames'

export default function Home() {
  const { data: games, isLoading } = useGames()
  const [search, setSearch] = useState('')

  const filtered = games?.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen pb-24 bg-surface">
      <TopAppBar title="TopUpKu" right={
        <button className="text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined">search</span>
        </button>
      } />

      <main className="pt-20 px-edge-margin max-w-container-max-width mx-auto flex flex-col gap-stack-lg">
        <section className="mt-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant text-body-md">search</span>
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 bg-surface-container-low border-none rounded-xl pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary-container transition-all font-body-md"
              placeholder="Cari game favoritmu..."
            />
          </div>
        </section>

        <section className="relative rounded-xl overflow-hidden h-40 bg-surface-container-low">
          <div className="relative z-10 p-6 flex flex-col justify-end h-full">
            <p className="font-label-md text-label-md text-primary tracking-widest">PROMO TERBATAS</p>
            <h2 className="font-headline-md text-headline-md text-on-surface">Cashback Hingga 50%</h2>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-stack-md">
            <h3 className="font-headline-md text-headline-md text-on-surface">Daftar Game</h3>
          </div>
          {isLoading ? (
            <p className="text-on-surface-variant text-center py-8">Memuat...</p>
          ) : (
            <div className="grid grid-cols-2 gap-gutter">
              {filtered?.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
          {filtered?.length === 0 && (
            <p className="text-on-surface-variant text-center py-8">Game tidak ditemukan</p>
          )}
        </section>

        <section className="bg-surface-container-high rounded-xl p-6 mb-8">
          <h3 className="font-headline-md text-headline-md text-primary mb-4">Mengapa Memilih Kami?</h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">bolt</span>
              </div>
              <div>
                <h5 className="font-body-lg text-body-lg font-bold">Proses Instan</h5>
                <p className="font-body-md text-body-md text-on-surface-variant">Top up masuk hanya dalam hitungan detik setelah pembayaran.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary">verified_user</span>
              </div>
              <div>
                <h5 className="font-body-lg text-body-lg font-bold">Aman & Terpercaya</h5>
                <p className="font-body-md text-body-md text-on-surface-variant">Layanan legal dan terverifikasi untuk kenyamanan Anda.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNavBar />
    </div>
  )
}
