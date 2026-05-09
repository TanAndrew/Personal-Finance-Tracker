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
    const thisMonth = all.filter(t => t.date >= firstOfMonth && t.date <= lastOfMonth)
    setTransactions(thisMonth)
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

    const byCategory = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { totalExpenses, totalIncome, byCategory, recentTransactions: transactions.slice(0, 5) }
  }, [transactions])

  const saved = totalIncome - totalExpenses
  const savingsTarget = savingsGoal?.monthly_savings_target ?? 0
  const savingsProgress = savingsTarget > 0 ? Math.min((saved / savingsTarget) * 100, 100) : 0
  const onTrack = saved >= savingsTarget && savingsTarget > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-indigo-600 px-5 pt-12 pb-8 text-white">
        <p className="text-indigo-200 text-sm mb-1">{MONTH_NAMES[now.getMonth()]} {now.getFullYear()} spending</p>
        <p className="text-4xl font-bold">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {savingsGoal ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-800">Savings goal</span>
              <span className={`text-sm font-medium ${onTrack ? 'text-green-600' : 'text-orange-500'}`}>
                {onTrack ? 'On track' : 'Behind'}
              </span>
            </div>
            <div className="bg-gray-100 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${onTrack ? 'bg-green-500' : 'bg-orange-400'}`}
                style={{ width: `${savingsProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">
              Saved <strong className="text-gray-800">${Math.max(saved, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> of{' '}
              <strong className="text-gray-800">${savingsTarget.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> target
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center">
            <p className="text-gray-500 text-sm">No savings goal set</p>
            <a href="/settings" className="text-indigo-600 text-sm font-medium">Set one →</a>
          </div>
        )}

        {byCategory.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800 mb-3">Where your money goes</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                  {byCategory.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {byCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.name] ?? '#94a3b8' }} />
                    <span className="text-sm text-gray-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-800">${cat.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-xs text-gray-400 ml-2">{totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
            <p className="text-gray-400 text-sm">No transactions this month yet</p>
            <a href="/transactions/add" className="text-indigo-600 text-sm font-medium mt-1 block">Add your first one →</a>
          </div>
        )}

        {recentTransactions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-gray-800">Recent</h2>
              <a href="/transactions" className="text-indigo-600 text-sm">See all</a>
            </div>
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }}>
                      {t.category.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.category}</p>
                      <p className="text-xs text-gray-400">{t.note || formatDate(t.date)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
