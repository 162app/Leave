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
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) throw error
}

/**
 * Map leave type to the correct balance column.
 * EL (Emergency/Compassionate) has its own pool.
 * Replacement uses replacement_balance.
 * Others has no balance.
 */
function balanceKey(leaveType: 'AL' | 'EL' | 'MC' | 'Replacement'): keyof Employee {
  const map: Record<string, keyof Employee> = {
    AL: 'al_balance',
    EL: 'el_balance',
    MC: 'mc_balance',
    Replacement: 'replacement_balance',
  }
  return map[leaveType]
}

export async function deductLeaveBalance(
  employeeId: string,
  leaveType: 'AL' | 'EL' | 'MC' | 'Replacement',
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')
  const key = balanceKey(leaveType)
  const newBalance = Math.max(0, (employee[key] as number) - days)
  const { error } = await supabase
    .from('employees').update({ [key]: newBalance }).eq('id', employeeId)
  if (error) throw error
}

export async function restoreLeaveBalance(
  employeeId: string,
  leaveType: 'AL' | 'EL' | 'MC' | 'Replacement',
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')
  const key = balanceKey(leaveType)
  const newBalance = (employee[key] as number) + days
  const { error } = await supabase
    .from('employees').update({ [key]: newBalance }).eq('id', employeeId)
  if (error) throw error
}

/** Called when admin adds a replacement credit — adds to replacement_balance */
export async function creditReplacementBalance(
  employeeId: string,
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')
  const newBalance = employee.replacement_balance + days
  const { error } = await supabase
    .from('employees').update({ replacement_balance: newBalance }).eq('id', employeeId)
  if (error) throw error
}

/** Called when admin deletes a replacement credit — removes from replacement_balance */
export async function debitReplacementBalance(
  employeeId: string,
  days: number
): Promise<void> {
  const employee = await getEmployee(employeeId)
  if (!employee) throw new Error('Employee not found')
  const newBalance = Math.max(0, employee.replacement_balance - days)
  const { error } = await supabase
    .from('employees').update({ replacement_balance: newBalance }).eq('id', employeeId)
  if (error) throw error
}
