import type { DashboardStat } from '../types'

interface StatCardProps {
  stat: DashboardStat
}

export function StatCard({ stat }: StatCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{stat.title}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{stat.hint}</p>
    </article>
  )
}