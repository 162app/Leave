'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { EmployeeNav } from '@/components/ui/BottomNav'
import { LoadingSpinner } from '@/components/ui'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && role !== 'employee') {
      router.replace('/')
    }
  }, [role, isLoading, router])

  if (isLoading) return <LoadingSpinner />
  if (role !== 'employee') return null

  return (
    <div style={{ minHeight: '100svh', background: 'var(--bg)' }}>
      <div style={{ height: 3, background: 'var(--accent)' }} />
      {children}
      <EmployeeNav />
    </div>
  )
}
