import { mockNavigationItems } from '../data/mockData'
import type { NavigationKey } from '../types'

interface SidebarProps {
  activePage: NavigationKey
  onNavigate: (page: NavigationKey) => void
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200/80 bg-white/92 px-5 py-6 backdrop-blur-sm">
      <div className="relative overflow-hidden rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-[0_20px_45px_rgba(2,6,23,0.18)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-sky-300">JobPilot</p>
        <h1 className="mt-3 text-[2rem] font-semibold tracking-tight">求职驾驶舱</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          为求职者打造的统一投递管理与成长规划工作台。
        </p>
      </div>

      <div className="mt-6 px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Workspace</p>
      </div>

      <nav className="mt-3 flex-1 space-y-2">
        {mockNavigationItems.map((item) => {
          const isActive = item.key === activePage

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition duration-200 ${
                isActive
                  ? 'border-sky-200 bg-sky-50/90 shadow-[0_10px_25px_rgba(14,165,233,0.08)]'
                  : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      isActive ? 'text-sky-800' : 'text-slate-900'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">{item.description}</p>
                </div>
                <div
                  className={`mt-1 h-2.5 w-2.5 rounded-full ${
                    isActive ? 'bg-sky-500 shadow-[0_0_0_6px_rgba(14,165,233,0.08)]' : 'bg-slate-200'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </nav>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">MVP Status</p>
        <p className="mt-3 text-sm font-semibold text-slate-900">当前可作为前端展示骨架继续迭代</p>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          当前版本仅包含导航与页面入口，适合作为后续逐步扩展的项目底座。
        </p>
      </div>
    </aside>
  )
}