import { supabase } from '@/lib/supabase'
import { LeaveRequest, LeaveStatus, LeaveType } from '@/lib/types'
import { deductLeaveBalance, restoreLeaveBalance } from './employees'

export async function getLeaveRequests(filters?: {
  employeeId?: string
  status?: LeaveStatus
}): Promise<LeaveRequest[]> {
  let query = supabase
    .from('leave_requests')
    .select('*, employee:employees(*)')
    .order('created_at', { ascending: false })
  if (filters?.employeeId) query = query.eq('employee_id', filters.employeeId)
  if (filters?.status) query = query.eq('status', filters.status)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getLeaveRequest(id: string): Promise<LeaveRequest | null> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('*, employee:employees(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createLeaveRequest(
  request: Omit<LeaveRequest, 'id' | 'status' | 'admin_note' | 'created_at' | 'updated_at' | 'employee'>
): Promise<LeaveRequest> {
  const { data, error } = await supabase
    .from('leave_requests')
    .insert({ ...request, status: 'Pending' })
    .select('*, employee:employees(*)')
    .single()
  if (error) throw error
  return data
}

export async function updateLeaveStatus(
  id: string,
  status: LeaveStatus,
  adminNote?: string
): Promise<LeaveRequest> {
  const { data: existing, error: fetchErr } = await supabase
    .from('leave_requests').select('*').eq('id', id).single()
  if (fetchErr || !existing) throw new Error('Leave request not found')

  const oldStatus: LeaveStatus = existing.status
  const leaveType: LeaveType = existing.leave_type

  const { data, error } = await supabase
    .from('leave_requests')
    .update({ status, admin_note: adminNote ?? null })
    .eq('id', id)
    .select('*, employee:employees(*)')
    .single()
  if (error) throw error

  // Only track balance for types that have allocation
  if (leaveType !== 'Others') {
    const type = leaveType as 'AL' | 'EL' | 'MC' | 'Replacement'
    const days = existing.days_count
    if (status === 'Approved' && oldStatus !== 'Approved') {
      await deductLeaveBalance(existing.employee_id, type, days)
    }
    if (oldStatus === 'Approved' && status !== 'Approved') {
      await restoreLeaveBalance(existing.employee_id, type, days)
    }
  }

  return data
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const { error } = await supabase.from('leave_requests').delete().eq('id', id)
  if (error) throw error
}

export async function getLeaveStats() {
  const { data, error } = await supabase
    .from('leave_requests').select('status, leave_type')
  if (error) throw error
  return {
    total: data.length,
    pending: data.filter(r => r.status === 'Pending').length,
    approved: data.filter(r => r.status === 'Approved').length,
    rejected: data.filter(r => r.status === 'Rejected').length,
  }
}
