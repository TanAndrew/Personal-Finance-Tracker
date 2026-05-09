'use client'

import { useState, useEffect } from 'react'
import { Transaction, CATEGORY_COLORS } from '@/types'
import { getTransactions, deleteTransaction } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'
import { Trash2 } from 'lucide-react'

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')

  useEffect(() => {
    setTransactions(getTransactions())
  }, [])

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)

  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.date
    acc[key] = acc[key] ?? []
    acc[key].push(t)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function handleDelete(id: string) {
    deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Transactions</h1>
        <div className="flex gap-2">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {sortedDates.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No transactions yet</p>
            <a href="/transactions/add" className="text-indigo-600 font-medium mt-2 block">Add one →</a>
          </div>
        )}
        {sortedDates.map(date => (
          <div key={date}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{formatDate(date)}</p>
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
              {grouped[date].map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#94a3b8' }}>
                      {t.category.slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.category}</p>
                      {t.note && <p className="text-xs text-gray-400">{t.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
