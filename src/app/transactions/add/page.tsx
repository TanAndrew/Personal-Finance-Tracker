'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction } from '@/lib/storage'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '@/types'
import BottomNav from '@/components/BottomNav'
import { X } from 'lucide-react'

export default function AddTransactionPage() {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { setError('Please select a category'); return }
    addTransaction({ type, amount: parseFloat(amount), category, note: note || undefined, date })
    router.push('/')
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 flex justify-between items-center px-6 h-20" style={{ backgroundColor: '#141218', borderBottom: '4px solid #000' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 neo-border neo-shadow neo-shadow-active flex items-center justify-center" style={{ backgroundColor: '#b5f23d' }}>
            <X size={20} color="#000" strokeWidth={3} />
          </button>
          <h1 className="font-headline text-2xl uppercase" style={{ color: '#e6e0e9' }}>Add<br />Transaction</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {/* Amount */}
        <div className="neo-border neo-shadow-lg p-5 text-center" style={{ backgroundColor: '#36343a' }}>
          <label className="font-label text-xs uppercase tracking-widest block mb-3" style={{ color: '#cbc4d2' }}>Amount</label>
          <div className="flex items-center justify-center gap-2">
            <span className="font-display text-6xl" style={{ color: '#b5f23d' }}>$</span>
            <input
              autoFocus
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="font-display text-5xl bg-transparent border-none outline-none text-white placeholder:text-gray-600 w-full"
            />
          </div>
        </div>

        {/* Expense / Income toggle */}
        <div className="neo-border neo-shadow flex gap-1 p-1" style={{ backgroundColor: '#000' }}>
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory('') }}
              className="flex-1 py-4 font-label text-sm uppercase tracking-wider transition-all"
              style={{
                backgroundColor: type === t ? (t === 'expense' ? '#0052ff' : '#b5f23d') : 'transparent',
                color: type === t ? (t === 'expense' ? '#fff' : '#000') : '#948e9c',
                border: type === t ? '3px solid #000' : 'none',
              }}
            >
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>

        {/* Category */}
        <div>
          <label className="font-label text-xs uppercase tracking-wider block mb-2 px-1" style={{ color: '#cbc4d2' }}>Category</label>
          <div className="relative neo-border neo-shadow" style={{ backgroundColor: '#211f24' }}>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full h-14 px-4 appearance-none bg-transparent font-label text-base uppercase outline-none"
              style={{ color: category ? '#e6e0e9' : '#948e9c' }}
            >
              <option value="" disabled>Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat} style={{ backgroundColor: '#211f24' }}>{cat}</option>
              ))}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none font-label text-xs" style={{ color: '#948e9c' }}>▼</span>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="font-label text-xs uppercase tracking-wider block mb-2 px-1" style={{ color: '#cbc4d2' }}>Date</label>
          <div className="relative neo-border neo-shadow" style={{ backgroundColor: '#211f24' }}>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full h-14 px-4 bg-transparent font-label text-base uppercase outline-none"
              style={{ color: '#e6e0e9', colorScheme: 'dark' }}
            />
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="font-label text-xs uppercase tracking-wider block mb-2 px-1" style={{ color: '#cbc4d2' }}>Note (Optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="WHAT WAS THIS FOR?"
            rows={3}
            className="w-full p-4 neo-border neo-shadow font-label text-sm resize-none outline-none placeholder:uppercase"
            style={{ backgroundColor: '#211f24', color: '#e6e0e9' }}
          />
        </div>

        {error && (
          <p className="font-label text-xs uppercase" style={{ color: '#ffb4ab' }}>{error}</p>
        )}

        <button
          type="submit"
          className="w-full h-16 neo-border neo-shadow-lg neo-shadow-active font-headline text-2xl uppercase italic"
          style={{ backgroundColor: '#b5f23d', color: '#000' }}
        >
          Save Transaction
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
