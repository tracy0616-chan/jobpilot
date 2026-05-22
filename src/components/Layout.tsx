import type { PropsWithChildren } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import type { NavigationKey } from '../types'

interface LayoutProps extends PropsWithChildren {
  activePage: NavigationKey
  onNavigate: (page: NavigationKey) => void
}

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1600px] overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <div className="flex min-w-0 flex-1 flex-col bg-slate-50/70">
          <Header activePage={activePage} />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}