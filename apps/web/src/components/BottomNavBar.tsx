import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { label: 'Home', icon: 'home', path: '/' },
  { label: 'History', icon: 'history', path: '/history' },
  { label: 'Promos', icon: 'confirmation_number', path: '/promos' },
  { label: 'Profile', icon: 'person', path: '/profile' },
]

export function BottomNavBar() {
  const loc = useLocation()
  const nav = useNavigate()
  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-container-high border-t border-white/5 rounded-t-xl">
      <div className="flex justify-around items-center h-16 max-w-container-max-width mx-auto">
        {tabs.map((t) => {
          const active = loc.pathname === t.path
          return (
            <button
              key={t.path}
              onClick={() => nav(t.path)}
              className={`flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-transform ${
                active ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
              >
                {t.icon}
              </span>
              <span className="font-label-md text-label-md">{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
