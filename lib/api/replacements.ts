import { supabase } from '@/lib/supabase'
import { ReplacementCredit } from '@/lib/types'
import { creditReplacementBalance, debitReplacementBalance } from './employees'

export async function getReplacementCredits(employeeId?: string): Promise<ReplacementCredit[]> {
  let query = supabase
    .from('replacement_credits')
    .select('*, employee:employees(*)')
    .order('work_date', { ascending: false })
  if (employeeId) query = query.eq('employee_id', employeeId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/** Admin adds a replacement credit — instantly updates employee balance */
export async function addReplacementCredit(credit: {
  employee_id: string
  work_date: string
  public_holiday: string
  days_credited: number
  note?: string
}): Promise<ReplacementCredit> {
  const { data, error } = await supabase
    .from('replacement_credits')
    .insert({
      employee_id: credit.employee_id,
      work_date: credit.work_date,
      public_holiday: credit.public_holiday,
      days_credited: credit.days_credited,
      note: credit.note ?? null,
    })
    .select('*, employee:employees(*)')
    .single()
  if (error) throw error

  // Credit balance immediately — no approval step needed
  await creditReplacementBalance(credit.employee_id, credit.days_credited)

  return data
}

/** Admin removes a replacement credit — reverts employee balance */
export async function deleteReplacementCredit(id: string): Promise<void> {
  const { data: existing, error: fetchErr } = await supabase
    .from('replacement_credits').select('*').eq('id', id).single()
  if (fetchErr || !existing) throw new Error('Credit not found')

  const { error } = await supabase
    .from('replacement_credits').delete().eq('id', id)
  if (error) throw error

  // Debit back from balance
  await debitReplacementBalance(existing.employee_id, existing.days_credited)
}
