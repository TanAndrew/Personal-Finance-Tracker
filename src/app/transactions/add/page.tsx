'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '@/types'
import BottomNav from '@/components/BottomNav'
import { ChevronLeft } from 'lucide-react'

export default function AddTransactionPage() {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) { setError('Please select a category'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/auth/login'); return }

    const { error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      category,
      note: note || null,
      date,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Add transaction</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
        {/* Income / Expense toggle */}
        <div className="bg-gray-100 rounded-xl p-1 flex">
          {(['expense', 'income'] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); setCategory('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t ? 'bg-white shadow text-gray-900' : 'text-gray-500'
              }`}
            >
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide">Amount</label>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold text-gray-400 mr-2">$</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="text-3xl font-bold text-gray-900 flex-1 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-3">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-2 px-3 rounded-xl text-sm font-medium border transition-colors ${
                  category === cat
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full text-gray-900 text-base outline-none bg-transparent"
          />
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl p-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. Lunch with team"
            className="w-full text-gray-900 text-base outline-none bg-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-base disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save transaction'}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
