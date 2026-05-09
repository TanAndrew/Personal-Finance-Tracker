import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransactionsClient from './TransactionsClient'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: transactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(100)

  return <TransactionsClient transactions={transactions ?? []} />
}
