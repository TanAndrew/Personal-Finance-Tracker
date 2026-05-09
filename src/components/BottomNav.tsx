'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ScrollText, Plus, TrendingUp, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'HOME' },
  { href: '/transactions', icon: ScrollText, label: 'HISTORY' },
  { href: '/transactions/add', icon: Plus, label: 'ADD' },
  { href: '/investments', icon: TrendingUp, label: 'ASSETS' },
  { href: '/settings', icon: User, label: 'PROFILE' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 h-20"
      style={{ backgroundColor: '#141218', borderTop: '4px solid #000', boxShadow: '0 -4px 0 0 #000' }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const isAdd = href === '/transactions/add'
        const active = pathname === href

        if (isAdd) {
          return (
            <Link key={href} href={href} className="flex flex-col items-center -mt-6">
              <span className="w-14 h-14 flex items-center justify-center neo-border neo-shadow neo-shadow-active" style={{ backgroundColor: '#ff6b00' }}>
                <Icon size={28} color="#000" strokeWidth={3} />
              </span>
              <span className="font-label text-[10px] uppercase mt-1" style={{ color: '#ff6b00' }}>{label}</span>
            </Link>
          )
        }

        return (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5">
            <Icon size={22} color={active ? '#cfbcff' : '#948e9c'} strokeWidth={active ? 2.5 : 1.5} />
            <span className="font-label text-[10px] uppercase" style={{ color: active ? '#cfbcff' : '#948e9c' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
