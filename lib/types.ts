export type LeaveType = 'AL' | 'EL' | 'MC' | 'Others'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  al_balance: number
  // EL has no separate allocation — it deducts from al_balance
  mc_balance: number
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days_count: number
  reason: string | null
  status: LeaveStatus
  admin_note: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
  employee?: Employee
}

export interface LeaveBalance {
  AL: number // EL shares this pool
  MC: number
}

export const LEAVE_LABELS: Record<LeaveType, string> = {
  AL: 'Annual Leave',
  EL: 'Emergency Leave',
  MC: 'Medical Leave',
  Others: 'Others',
}

export const STATUS_COLORS: Record<LeaveStatus, string> = {
  Pending: 'text-amber-600 bg-amber-50 border-amber-200',
  Approved: 'text-green-700 bg-green-50 border-green-200',
  Rejected: 'text-red-600 bg-red-50 border-red-200',
}
