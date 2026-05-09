'use client'

import { useState, useEffect } from 'react'
import { Transaction, CATEGORY_COLORS } from '@/types'
import { getTransactions, deleteTransaction } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'
import { Trash2 } from 'lucide-react'

export default function TransactionsClient() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')

  useEffect(() => { setTransactions(getTransactions()) }, [])

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)
  const grouped = filtered.reduce<Record<string, Transaction[]>>((acc, t) => {
    acc[t.date] = acc[t.date] ?? []
    acc[t.date].push(t)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  function handleDelete(id: string) {
    deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      <header className="sticky top-0 z-40 px-6 h-20 flex flex-col justify-center" style={{ backgroundColor: '#141218', borderBottom: '4px solid #000' }}>
        <h1 className="font-headline text-2xl uppercase" style={{ color: '#e6e0e9' }}>History</h1>
        <div className="flex gap-2 mt-2">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="font-label text-xs uppercase px-3 py-1 neo-border transition-all"
              style={{
                backgroundColor: filter === f ? '#cfbcff' : 'transparent',
                color: filter === f ? '#000' : '#948e9c',
                borderColor: filter === f ? '#000' : '#36343a',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="px-6 py-5 space-y-6">
        {sortedDates.length === 0 && (
          <div className="neo-border neo-shadow p-6 text-center" style={{ backgroundColor: '#211f24' }}>
            <p className="font-label text-xs uppercase tracking-widest mb-3" style={{ color: '#948e9c' }}>No transactions yet</p>
            <a href="/transactions/add" className="font-label text-xs uppercase neo-border neo-shadow-active px-4 py-2 inline-block" style={{ backgroundColor: '#b5f23d', color: '#000' }}>Add One</a>
          </div>
        )}
        {sortedDates.map(date => (
          <div key={date}>
            <p className="font-label text-xs uppercase tracking-widest mb-2" style={{ color: '#948e9c' }}>{formatDate(date)}</p>
            <div className="neo-border neo-shadow" style={{ backgroundColor: '#211f24' }}>
              {grouped[date].map((t, i) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < grouped[date].length - 1 ? '1px solid #36343a' : 'none' }}>
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 flex items-center justify-center font-label text-xs neo-border shrink-0" style={{ backgroundColor: CATEGORY_COLORS[t.category] ?? '#36343a', color: '#000' }}>
                      {t.category.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-label text-sm uppercase" style={{ color: '#e6e0e9' }}>{t.category}</p>
                      {t.note && <p className="font-label text-xs" style={{ color: '#948e9c' }}>{t.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label text-sm" style={{ color: t.type === 'income' ? '#b5f23d' : '#e6e0e9' }}>
                      {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <button onClick={() => handleDelete(t.id)} style={{ color: '#36343a' }} className="hover:text-red-400 transition-colors">
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
