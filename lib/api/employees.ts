import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/types'

export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')

  if (error) throw error
  return data ?? []
}

export async function getEmployee(id: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return data
}

export async function createEmployee(
  employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEmployee(
  id: string,
  updates: Partial<Omit<Employee, 'id' | 'created_at' | 'updated_at'>>
): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)

  if (error) throw error
}

/**
 * Deduct leave balance on approval.
 * EL has no own allocation — it deducts from AL.
 */
export async function deductLeaveBalance(
  employeeId: string,
  leaveType: 'AL' | 'EL' | 'MC',
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')

  // EL pulls from AL pool
  const balanceKey = leaveType === 'EL' ? 'al_balance'
    : leaveType === 'MC' ? 'mc_balance'
    : 'al_balance'

  const currentBalance = employee[balanceKey] as number
  const newBalance = Math.max(0, currentBalance - days)

  const { error } = await supabase
    .from('employees')
    .update({ [balanceKey]: newBalance })
    .eq('id', employeeId)

  if (error) throw error
}

/**
 * Restore leave balance when approval is revoked.
 * EL was deducted from AL, so restore to AL.
 */
export async function restoreLeaveBalance(
  employeeId: string,
  leaveType: 'AL' | 'EL' | 'MC',
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')

  // Mirror deductLeaveBalance logic
  const balanceKey = leaveType === 'EL' ? 'al_balance'
    : leaveType === 'MC' ? 'mc_balance'
    : 'al_balance'

  const currentBalance = employee[balanceKey] as number
  const newBalance = currentBalance + days

  const { error } = await supabase
    .from('employees')
    .update({ [balanceKey]: newBalance })
    .eq('id', employeeId)

  if (error) throw error
}
