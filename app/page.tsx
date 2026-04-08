'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { loginAsEmployee, loginAsAdmin } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'employee' | 'admin'>('employee')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim()) { setError('Enter your email'); return }
    setLoading(true); setError('')
    try {
      let success = false
      if (mode === 'admin') {
        success = await loginAsAdmin(email)
        if (success) router.push('/admin')
      } else {
        success = await loginAsEmployee(email)
        if (success) router.push('/dashboard')
      }
      if (!success) setError('Email not found. Please check and try again.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ height: 4, background: 'var(--accent)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 24px', maxWidth: 400, margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, background: 'var(--accent)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📋</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)', margin: 0 }}>LeaveHub</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0 }}>Leave management, simplified</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ padding: 4, display: 'flex', marginBottom: 20, gap: 4 }}>
          {(['employee', 'admin'] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError('') }} style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
              background: mode === m ? 'var(--accent)' : 'transparent',
              color: mode === m ? '#111' : 'var(--text-muted)',
            }}>
              {m === 'employee' ? '👤 Employee' : '⚙️ Admin'}
            </button>
          ))}
        </div>
        <div className="card" style={{ padding: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 4px' }}>{mode === 'admin' ? 'Admin Sign In' : 'Employee Sign In'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: '0 0 20px' }}>
            {mode === 'admin' ? 'Enter admin email to manage leaves' : 'Enter your work email to access your leaves'}
          </p>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--text-soft)', marginBottom: 6 }}>Email address</label>
          <input className="input" type="email"
            placeholder={mode === 'admin' ? 'admin@company.com' : 'you@company.com'}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{ marginBottom: error ? 10 : 16 }}
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>⚠ {error}</p>}
          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? 'Signing in…' : 'Continue →'}
          </button>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 24 }}>Contact HR if you need access</p>
      </div>
    </div>
  )
}
