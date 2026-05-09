import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [{ data: transactions }, { data: savingsGoal }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstOfMonth)
      .lte('date', lastOfMonth)
      .order('date', { ascending: false }),
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  return (
    <DashboardClient
      transactions={transactions ?? []}
      savingsGoal={savingsGoal}
      userEmail={user.email ?? ''}
    />
  )
}
