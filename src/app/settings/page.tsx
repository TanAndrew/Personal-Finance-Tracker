'use client'

import { useState, useEffect } from 'react'
import { getSavingsGoal, setSavingsGoal } from '@/lib/storage'
import BottomNav from '@/components/BottomNav'

export default function SettingsPage() {
  const [income, setIncome] = useState('')
  const [savingsTarget, setSavingsTarget] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const goal = getSavingsGoal()
    if (goal) {
      setIncome(goal.monthly_income.toString())
      setSavingsTarget(goal.monthly_savings_target.toString())
    }
  }, [])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSavingsGoal({ monthly_income: parseFloat(income), monthly_savings_target: parseFloat(savingsTarget) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              <input type="number" value={income} onChange={e => setIncome(e.target.value)} required min="0" step="0.01" placeholder="e.g. 5000" className="flex-1 text-gray-900 text-base outline-none border-b border-gray-200 py-1" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide block mb-1">Monthly savings target</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-medium">$</span>
              <input type="number" value={savingsTarget} onChange={e => setSavingsTarget(e.target.value)} required min="0" step="0.01" placeholder="e.g. 1000" className="flex-1 text-gray-900 text-base outline-none border-b border-gray-200 py-1" />
            </div>
          </div>
        </div>

        {saved && <div className="bg-green-50 text-green-600 text-sm rounded-xl px-4 py-3">Settings saved!</div>}

        <button type="submit" className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-semibold text-base">
          Save settings
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
