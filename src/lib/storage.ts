import { Transaction, SavingsGoal } from '@/types'

const TRANSACTIONS_KEY = 'fintrack_transactions'
const SAVINGS_GOAL_KEY = 'fintrack_savings_goal'

export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(TRANSACTIONS_KEY)
  return data ? JSON.parse(data) : []
}

export function addTransaction(t: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Transaction {
  const transactions = getTransactions()
  const newT: Transaction = {
    ...t,
    id: crypto.randomUUID(),
    user_id: 'local',
    created_at: new Date().toISOString(),
  }
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify([newT, ...transactions]))
  return newT
}

export function deleteTransaction(id: string): void {
  const updated = getTransactions().filter(t => t.id !== id)
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated))
}

export function getSavingsGoal(): SavingsGoal | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(SAVINGS_GOAL_KEY)
  return data ? JSON.parse(data) : null
}

export function setSavingsGoal(goal: { monthly_income: number; monthly_savings_target: number }): SavingsGoal {
  const g: SavingsGoal = {
    ...goal,
    id: 'local',
    user_id: 'local',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  localStorage.setItem(SAVINGS_GOAL_KEY, JSON.stringify(g))
  return g
}
