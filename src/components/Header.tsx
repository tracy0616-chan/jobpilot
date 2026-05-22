import { mockNavigationItems } from '../data/mockData'
import type { NavigationKey } from '../types'

interface HeaderProps {
  activePage: NavigationKey
}

export function Header({ activePage }: HeaderProps) {
  const currentPage = mockNavigationItems.find((item) => item.key === activePage)

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/70 px-8 py-6 backdrop-blur-sm">
      <div>
        <p className="text-sm font-medium text-slate-500">Web Frontend MVP</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {currentPage?.label ?? 'JobPilot'}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
          Local Mock Data
        </div>
        <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
          React + TypeScript + Vite
        </div>
      </div>
    </header>
  )
}