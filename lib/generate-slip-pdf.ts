import jsPDF from 'jspdf'
import { LeaveRequest, LEAVE_LABELS } from '@/lib/types'
import { COMPANY } from '@/lib/company-config'

export function generateSlipPDF(request: LeaveRequest): void {
  const emp = request.employee
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W = 210   // A4 width mm
  const margin = 18
  const col = W - margin * 2
  const accent = '#D7DF23'
  const black = '#111111'
  const muted = '#888888'
  const light = '#f5f5f5'
  const border = '#e0e0e0'

  const slipNo = `LS-${request.id.slice(0, 8).toUpperCase()}`
  const leaveLabel = request.leave_type === 'Others' && request.leave_other_type
    ? request.leave_other_type
    : LEAVE_LABELS[request.leave_type]
  const generatedDate = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-MY', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  let y = margin

  // ── Header ───────────────────────────────────────────────
  // Company name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(black)
  doc.text(COMPANY.name, margin, y)

  // Slip label top-right
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(muted)
  doc.text('LEAVE APPROVAL SLIP', W - margin, y, { align: 'right' })

  y += 5
  // Tagline
  if (COMPANY.tagline) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(muted)
    doc.text(COMPANY.tagline, margin, y)
  }

  // Slip number top-right
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(muted)
  doc.text(slipNo, W - margin, y, { align: 'right' })

  y += 4
  // Yellow underline
  doc.setDrawColor(accent)
  doc.setLineWidth(0.8)
  doc.line(margin, y, W - margin, y)

  y += 8

  // ── Approved badge ────────────────────────────────────────
  doc.setFillColor('#e8faf0')
  doc.setDrawColor('#22c55e')
  doc.setLineWidth(0.4)
  doc.roundedRect(W - margin - 28, y - 4, 28, 6, 2, 2, 'FD')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor('#15803d')
  doc.text('✓  APPROVED', W - margin - 14, y, { align: 'center' })

  y += 8

  // ── 2-column grid ─────────────────────────────────────────
  const halfCol = col / 2 - 3
  const boxH = 46
  const leftX = margin
  const rightX = margin + halfCol + 6

  // Left box — Employee
  doc.setFillColor('#ffffff')
  doc.setDrawColor(border)
  doc.setLineWidth(0.3)
  doc.roundedRect(leftX, y, halfCol, boxH, 2, 2, 'FD')

  // Right box — Leave Details
  doc.roundedRect(rightX, y, halfCol, boxH, 2, 2, 'FD')

  // Section labels
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(muted)
  doc.text('EMPLOYEE', leftX + 4, y + 5)
  doc.text('LEAVE DETAILS', rightX + 4, y + 5)

  // Employee fields
  const fields: [string, string, boolean?][] = [
    ['Full Name', emp?.name ?? '—', true],
    ['Position', emp?.position ?? '—'],
    ['Department', emp?.department ?? '—'],
    ['Email', emp?.email ?? '—'],
  ]
  let fy = y + 10
  fields.forEach(([label, value, bold]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text(label, leftX + 4, fy)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(8)
    doc.setTextColor(black)
    const lines = doc.splitTextToSize(value, halfCol - 8)
    doc.text(lines[0], leftX + 4, fy + 3.5)
    fy += 9
  })

  // Leave detail fields
  const leaveFields: [string, string, string?][] = [
    ['Leave Type', leaveLabel, 'bold'],
    ['Duration', `${request.days_count} working day${request.days_count !== 1 ? 's' : ''}`, 'accent'],
    ['Start Date', fmtDate(request.start_date)],
    ['End Date', fmtDate(request.end_date)],
  ]
  let lfy = y + 10
  leaveFields.forEach(([label, value, style]) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text(label, rightX + 4, lfy)
    doc.setFont('helvetica', style === 'bold' ? 'bold' : 'normal')
    doc.setFontSize(style === 'accent' ? 11 : 8)
    doc.setTextColor(style === 'accent' ? '#b8a000' : black)
    doc.text(value, rightX + 4, lfy + 3.5)
    lfy += 9
  })

  y += boxH + 5

  // ── Reason box ────────────────────────────────────────────
  if (request.reason) {
    doc.setFillColor('#ffffff')
    doc.setDrawColor(border)
    doc.setLineWidth(0.3)
    const reasonLines = doc.splitTextToSize(request.reason, col - 8)
    const reasonH = 8 + reasonLines.length * 4.5
    doc.roundedRect(margin, y, col, reasonH, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text('Reason', margin + 4, y + 4.5)
    doc.setFontSize(8)
    doc.setTextColor(black)
    doc.text(reasonLines, margin + 4, y + 8.5)
    y += reasonH + 4
  }

  // ── Admin note ────────────────────────────────────────────
  if (request.admin_note) {
    doc.setFillColor('#ffffff')
    doc.setDrawColor(border)
    doc.setLineWidth(0.3)
    const noteLines = doc.splitTextToSize(request.admin_note, col - 8)
    const noteH = 8 + noteLines.length * 4.5
    doc.roundedRect(margin, y, col, noteH, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text('Admin Note', margin + 4, y + 4.5)
    doc.setFontSize(8)
    doc.setTextColor('#555555')
    doc.text(noteLines, margin + 4, y + 8.5)
    y += noteH + 4
  }

  // ── Info boxes row ────────────────────────────────────────
  const boxW = col / 3 - 2
  const infoBoxes = [
    ['Reference No.', slipNo],
    ['Submitted', new Date(request.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })],
    ['Generated', generatedDate],
  ]
  infoBoxes.forEach(([label, value], i) => {
    const bx = margin + i * (boxW + 3)
    doc.setFillColor(light)
    doc.setDrawColor('#eeeeee')
    doc.setLineWidth(0.3)
    doc.roundedRect(bx, y, boxW, 12, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text(label, bx + 4, y + 4)
    doc.setFontSize(8)
    doc.setTextColor('#333333')
    doc.text(value, bx + 4, y + 8.5)
  })

  y += 18

  // ── Footer ────────────────────────────────────────────────
  doc.setDrawColor('#eeeeee')
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)
  y += 4
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(muted)
  doc.text(`${COMPANY.email}  ·  ${COMPANY.phone}`, margin, y)
  doc.text('System generated · No signature required', W - margin, y, { align: 'right' })


  // Open as blob URL in new tab — user can view, save, or share from there
  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Revoke after a short delay to free memory
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
