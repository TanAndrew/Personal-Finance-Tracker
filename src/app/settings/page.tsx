'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const router = useRouter()
  const [income, setIncome] = useState('')
  const [savingsTarget, setSavingsTarget] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setIncome(data.monthly_income.toString())
        setSavingsTarget(data.monthly_savings_target.toString())
      }
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSaved(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth/login'); return }

    const payload = {
      user_id: user.id,
      monthly_income: parseFloat(income),
      monthly_savings_target: parseFloat(savingsTarget),
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('savings_goals')
      .select('id')
      .eq('user_id', user.id)
      .single()

    const { error } = existing
      ? await supabase.from('savings_goals').update(payload).eq('user_id', user.id)
      : await supabase.from('savings_goals').insert(payload)

    if (error) {
      setError(error.message)
    } else {
      setSaved(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <h2 className="font-semibold text-gray-800">Monthly savings goal</h2>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monthly income</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                className="flex-1 text-gray-900 text-base outline-none border-b border-gray-200 py-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monthly savings target</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={savingsTarget}
                onChange={e => setSavingsTarget(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="e.g. 1000"
                className="flex-1 text-gray-900 text-base outline-none border-b border-gray-200 py-1"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}
        {saved && (
          <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3">Settings saved!</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-base disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save settings'}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
