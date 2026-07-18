import { useNavigate } from 'react-router-dom'
import type { Game } from '../types'

interface Props {
  game: Game
}

export function GameCard({ game }: Props) {
  const nav = useNavigate()
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col active:scale-95 transition-transform">
      <div className="h-32 w-full relative bg-surface-container-highest flex items-center justify-center overflow-hidden">
        {game.iconUrl ? (
          <img
            src={game.iconUrl}
            alt={game.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-4xl">🎮</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h4 className="font-body-lg text-body-lg text-on-surface truncate">{game.name}</h4>
        <p className="font-label-md text-label-md text-on-surface-variant">Top up cepat</p>
        <button
          onClick={() => nav(`/game/${game.slug}`)}
          className="mt-2 w-full bg-primary-container text-on-primary-container py-2 rounded-lg font-label-md hover:brightness-110 active:scale-90 transition-all"
        >
          Top Up
        </button>
      </div>
    </div>
  )
}
