export type LeaveType = 'AL' | 'EL' | 'MC' | 'Replacement' | 'Others'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  position: string
  al_balance: number
  el_balance: number      // Emergency + Compassionate combined (5 days)
  mc_balance: number
  replacement_balance: number  // earned from working on public holidays
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  leave_type: LeaveType
  leave_other_type: string | null  // filled when leave_type = 'Others'
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

export interface ReplacementCredit {
  id: string
  employee_id: string
  work_date: string        // date staff worked (public holiday)
  public_holiday: string  // name of the holiday
  days_credited: number
  note: string | null
  created_at: string
  employee?: Employee
}

export const LEAVE_LABELS: Record<LeaveType, string> = {
  AL: 'Annual Leave',
  EL: 'Emergency / Compassionate',
  MC: 'Medical Leave',
  Replacement: 'Replacement Leave',
  Others: 'Others',
}

export const LEAVE_DESCRIPTIONS: Record<LeaveType, string> = {
  AL: 'Planned time off',
  EL: 'Emergency or bereavement',
  MC: 'Medical certificate required',
  Replacement: 'Worked on public holiday',
  Others: 'Unpaid, study leave, etc.',
}
