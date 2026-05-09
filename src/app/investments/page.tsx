import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

export default function InvestmentsPage() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#141218' }}>
      <header className="sticky top-0 z-40 px-6 h-20 flex items-center" style={{ backgroundColor: '#141218', borderBottom: '4px solid #000' }}>
        <h1 className="font-headline text-2xl uppercase" style={{ color: '#e6e0e9' }}>Assets</h1>
      </header>
      <div className="px-6 py-12 text-center">
        <div className="neo-border neo-shadow p-8 inline-block mb-6" style={{ backgroundColor: '#211f24' }}>
          <p className="font-display text-5xl" style={{ color: '#cfbcff' }}>📈</p>
        </div>
        <p className="font-headline text-lg uppercase mb-2" style={{ color: '#e6e0e9' }}>Investment Tracking</p>
        <p className="font-label text-xs uppercase tracking-widest" style={{ color: '#948e9c' }}>Coming soon — log stocks, track portfolio performance</p>
        <Link href="/import" className="font-label text-xs uppercase neo-border neo-shadow neo-shadow-active px-4 py-2 inline-block mt-6" style={{ backgroundColor: '#cfbcff', color: '#000' }}>
          Import CSV Instead
        </Link>
      </div>
      <BottomNav />
    </div>
  )
}
