'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, List, PlusCircle, TrendingUp, Settings } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/transactions', icon: List, label: 'Transactions' },
  { href: '/transactions/add', icon: PlusCircle, label: 'Add' },
  { href: '/investments', icon: TrendingUp, label: 'Invest' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          const isAdd = href === '/transactions/add'
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 ${
                isAdd ? 'relative -top-3' : ''
              }`}
            >
              {isAdd ? (
                <span className="bg-indigo-600 rounded-full p-3 shadow-lg shadow-indigo-200">
                  <Icon size={24} className="text-white" />
                </span>
              ) : (
                <>
                  <Icon
                    size={22}
                    className={active ? 'text-indigo-600' : 'text-gray-400'}
                  />
                  <span className={`text-xs ${active ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    {label}
                  </span>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
