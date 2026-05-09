export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  note?: string
  date: string
  created_at: string
}

export interface SavingsGoal {
  id: string
  user_id: string
  monthly_income: number
  monthly_savings_target: number
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  user_id: string
  ticker: string
  name?: string
  shares: number
  avg_cost: number
  created_at: string
  updated_at: string
}

export const EXPENSE_CATEGORIES = [
  'Food & Drinks',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Health',
  'Entertainment',
  'Travel',
  'Education',
  'Others',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investment Returns',
  'Cashback',
  'Others',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drinks': '#f97316',
  Transport: '#3b82f6',
  Shopping: '#a855f7',
  'Bills & Utilities': '#ef4444',
  Health: '#22c55e',
  Entertainment: '#eab308',
  Travel: '#06b6d4',
  Education: '#6366f1',
  Others: '#94a3b8',
  Salary: '#10b981',
  Freelance: '#14b8a6',
  'Investment Returns': '#8b5cf6',
  Cashback: '#f59e0b',
}
