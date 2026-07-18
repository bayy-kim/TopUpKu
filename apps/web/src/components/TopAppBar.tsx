import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  back?: boolean
  right?: React.ReactNode
}

export function TopAppBar({ title, back, right }: Props) {
  const nav = useNavigate()
  return (
    <header className="fixed top-0 w-full z-50 bg-surface-container border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-edge-margin max-w-container-max-width mx-auto">
        <div className="flex items-center gap-3">
          {back && (
            <button onClick={() => nav(-1)} className="active:scale-95 transition-transform">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
          )}
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">{title}</h1>
        </div>
        {right}
      </div>
    </header>
  )
}
