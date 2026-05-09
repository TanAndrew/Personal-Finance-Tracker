'use client'

import { useMemo, useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Transaction, SavingsGoal, CATEGORY_COLORS } from '@/types'
import { getTransactions, getSavingsGoal } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null)
  const now = new Date()

  useEffect(() => {
    const all = getTransactions()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    setTransactions(all.filter(t => t.date >= firstOfMonth && t.date <= lastOfMonth))
    setSavingsGoal(getSavingsGoal())
  }, [])

  const { totalExpenses, totalIncome, byCategory, recentTransactions } = useMemo(() => {
    let totalExpenses = 0
    let totalIncome = 0
    const categoryMap: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type === 'expense') {
        totalExpenses += t.amount
        categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount
      } else {
        totalIncome += t.amount
      }
    }
    const byCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    return { totalExpenses, totalIncome, byCategory, recentTransactions: transactions.slice(0, 5) }
  }, [transactions])

  const saved = totalIncome - totalExpenses
  const savingsTarget = savingsGoal?.monthly_savings_target ?? 0
  const savingsProgress = savingsTarget > 0 ? Math.min((saved / savingsTarget) * 100, 100) : 0
  const onTrack = saved >= savingsTarget && savingsTarget > 0

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      <div className="px-6 pt-12 pb-8" style={{ backgroundColor: '#1d1b20', borderBottom: '4px solid #000' }}>
        <p className="font-label text-xs uppercase tracking-widest mb-1" style={{ color: '#948e9c' }}>
          {MONTH_NAMES[now.getMonth()]} {now.getFullYear()} · Total Spent
        </p>
        <p className="font-display text-5xl" style={{ color: '#b5f23d' }}>
          ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        {savingsGoal && (
          <p className="font-label text-xs uppercase mt-2" style={{ color: '#948e9c' }}>
            Income: ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        )}
      </div>

      <div className="px-6 py-5 space-y-5">
        {savingsGoal ? (
          <div className="neo-border neo-shadow p-4" style={{ backgroundColor: '#211f24' }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-label text-sm uppercase tracking-wide" style={{ color: '#e6e0e9' }}>Savings Goal</span>
              <span className="font-label text-xs px-2 py-1 neo-border" style={{ backgroundColor: onTrack ? '#b5f23d' : '#ff6b00', color: '#000' }}>
                {onTrack ? 'ON TRACK' : 'BEHIND'}
              </span>
            </div>
            <div className="h-3 neo-border mb-3" style={{ backgroundColor: '#36343a' }}>
              <div className="h-full transition-all" style={{ width: `${savingsProgress}%`, backgroundColor: onTrack ? '#b5f23d' : '#ff6b00' }} />
            </div>
            <p className="font-label text-xs uppercase" style={{ color: '#cbc4d2' }}>
              ${Math.max(saved, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} of ${savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })} target
            </p>
          </div>
        ) : (
          <div className="neo-border neo-shadow p-4 flex justify-between items-center" style={{ backgroundColor: '#211f24' }}>
            <span className="font-label text-xs uppercase" style={{ color: '#948e9c' }}>No savings goal set</span>
            <a href="/settings" className="font-label text-xs uppercase neo-border neo-shadow-active px-3 py-1" style={{ backgroundColor: '#cfbcff', color: '#000' }}>Set One</a>
          </div>
        )}

        {byCategory.length > 0 ? (
          <div className="neo-border neo-shadow p-4" style={{ backgroundColor: '#211f24' }}>
            <h2 className="font-headline text-sm uppercase tracking-widest mb-4" style={{ color: '#e6e0e9' }}>Where Your Money Goes</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value">
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#948e9c'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  contentStyle={{ backgroundColor: '#211f24', border: '3px solid #000', borderRadius: 0, color: '#e6e0e9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {byCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #36343a' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.name] ?? '#948e9c' }} />
                    <span className="font-label text-xs uppercase" style={{ color: '#cbc4d2' }}>{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label text-sm" style={{ color: '#e6e0e9' }}>${cat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="font-label text-xs ml-2" style={{ color: '#948e9c' }}>{totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="neo-border neo-shadow p-6 text-center" style={{ backgroundColor: '#211f24' }}>
            <p className="font-label text-xs uppercase tracking-widest mb-3" style={{ color: '#948e9c' }}>No transactions this month</p>
            <a href="/transactions/add" className="font-label text-xs uppercase neo-border neo-shadow-active px-4 py-2 inline-block" style={{ backgroundColor: '#b5f23d', color: '#000' }}>Add First Transaction</a>
          </div>
        )}

        {recentTransactions.length > 0 && (
          <div className="neo-border neo-shadow" style={{ backgroundColor: '#211f24' }}>
            <div className="flex justify-between items-center px-4 py-3" style={{ borderBottom: '3px solid #000' }}>
              <h2 className="font-headline text-sm uppercase tracking-widest" style={{ color: '#e6e0e9' }}>Recent</h2>
              <a href="/transactions" className="font-label text-xs uppercase neo-border px-3 py-1" style={{ color: '#cfbcff', borderColor: '#cfbcff' }}>See All</a>
            </div>
            {recentTransactions.map((t, i) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < recentTransactions.length - 1 ? '1px solid #36343a' : 'none' }}>
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 flex items-center justify-center font-label text-xs neo-border" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#36343a', color: '#000' }}>
                    {t.category.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-label text-sm uppercase" style={{ color: '#e6e0e9' }}>{t.category}</p>
                    {t.note && <p className="font-label text-xs" style={{ color: '#948e9c' }}>{t.note}</p>}
                  </div>
                </div>
                <span className="font-label text-sm" style={{ color: t.type === 'income' ? '#b5f23d' : '#e6e0e9' }}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
