import BottomNav from '@/components/BottomNav'

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Investments</h1>
      </div>
      <div className="px-4 py-12 text-center">
        <p className="text-4xl mb-4">📈</p>
        <p className="text-gray-500 text-sm">Investment tracking coming soon.</p>
        <p className="text-gray-400 text-xs mt-1">You&apos;ll be able to log your stocks and see performance here.</p>
      </div>
      <BottomNav />
    </div>
  )
}
