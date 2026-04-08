'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/types'
import { getEmployeeByEmail } from '@/lib/api/employees'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@company.com'

export type AuthRole = 'admin' | 'employee' | null

interface AuthState {
  role: AuthRole
  employee: Employee | null
  isAdmin: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  loginAsEmployee: (email: string) => Promise<boolean>
  loginAsAdmin: (email: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'leave_app_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    role: null,
    employee: null,
    isAdmin: false,
    isLoading: true,
  })

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const session = JSON.parse(stored)
        setState({ ...session, isLoading: false })
      } catch {
        setState((s) => ({ ...s, isLoading: false }))
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }))
    }
  }, [])

  const loginAsEmployee = async (email: string): Promise<boolean> => {
    const emp = await getEmployeeByEmail(email.toLowerCase().trim())
    if (!emp) return false

    const newState: AuthState = {
      role: 'employee',
      employee: emp,
      isAdmin: false,
      isLoading: false,
    }
    setState(newState)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newState))
    return true
  }

  const loginAsAdmin = async (email: string): Promise<boolean> => {
    // Check admin_users table
    const { data } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (!data) return false

    const newState: AuthState = {
      role: 'admin',
      employee: null,
      isAdmin: true,
      isLoading: false,
    }
    setState(newState)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newState))
    return true
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setState({ role: null, employee: null, isAdmin: false, isLoading: false })
  }

  return (
    <AuthContext.Provider value={{ ...state, loginAsEmployee, loginAsAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
