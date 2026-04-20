import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/ping
 * Cron: every 12 hours — keeps Supabase free tier from going idle.
 * Vercel Cron sends a GET request with header x-vercel-cron: 1
 */
export async function GET(request: Request) {
  // Optional: restrict to Vercel cron calls only (skip in dev)
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const isDev = process.env.NODE_ENV === 'development'

  if (!isVercelCron && !isDev) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Lightweight query — just fetches 1 row to keep the connection alive
    const { error } = await supabase
      .from('employees')
      .select('id')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Database pinged successfully',
    })
  } catch (err: any) {
    console.error('[cron/ping] Error:', err.message)
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    )
  }
}
