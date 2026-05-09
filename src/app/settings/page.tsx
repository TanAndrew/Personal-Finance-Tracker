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
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      <header className="sticky top-0 z-40 px-6 h-20 flex items-center" style={{ backgroundColor: '#141218', borderBottom: '4px solid #000' }}>
        <h1 className="font-headline text-2xl uppercase" style={{ color: '#e6e0e9' }}>Profile</h1>
      </header>

      <form onSubmit={handleSave} className="px-6 py-6 space-y-6">
        <div className="neo-border neo-shadow p-5" style={{ backgroundColor: '#211f24' }}>
          <h2 className="font-label text-xs uppercase tracking-widest mb-5" style={{ color: '#cfbcff' }}>Monthly Savings Goal</h2>

          <div className="space-y-5">
            <div>
              <label className="font-label text-xs uppercase tracking-wider block mb-2" style={{ color: '#cbc4d2' }}>Monthly Income</label>
              <div className="flex items-center neo-border neo-shadow" style={{ backgroundColor: '#141218' }}>
                <span className="font-label text-lg px-4" style={{ color: '#b5f23d' }}>$</span>
                <input
                  type="number"
                  value={income}
                  onChange={e => setIncome(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 5000"
                  className="flex-1 h-14 bg-transparent outline-none font-label text-base"
                  style={{ color: '#e6e0e9' }}
                />
              </div>
            </div>

            <div>
              <label className="font-label text-xs uppercase tracking-wider block mb-2" style={{ color: '#cbc4d2' }}>Savings Target</label>
              <div className="flex items-center neo-border neo-shadow" style={{ backgroundColor: '#141218' }}>
                <span className="font-label text-lg px-4" style={{ color: '#b5f23d' }}>$</span>
                <input
                  type="number"
                  value={savingsTarget}
                  onChange={e => setSavingsTarget(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1000"
                  className="flex-1 h-14 bg-transparent outline-none font-label text-base"
                  style={{ color: '#e6e0e9' }}
                />
              </div>
            </div>
          </div>
        </div>

        {saved && (
          <div className="neo-border p-3 text-center" style={{ backgroundColor: '#b5f23d' }}>
            <p className="font-label text-xs uppercase" style={{ color: '#000' }}>Saved!</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full h-16 neo-border neo-shadow-lg neo-shadow-active font-headline text-xl uppercase italic"
          style={{ backgroundColor: '#cfbcff', color: '#000' }}
        >
          Save Settings
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
