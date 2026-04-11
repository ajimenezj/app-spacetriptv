import { NextResponse } from 'next/server'
import { sendBulkRenewalReminders, ReminderEmailData } from '@/lib/email'
import { isAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  // Verify admin session
  const cookieHeader = request.headers.get('cookie') || ''
  let sessionEmail = ''
  try {
    const sessionMatch = cookieHeader.match(/session=([^;]+)/)
    if (sessionMatch) {
      const session = JSON.parse(decodeURIComponent(sessionMatch[1]))
      sessionEmail = session.user_email || ''
    }
  } catch {
    // ignore parse errors
  }

  if (!isAdmin(sessionEmail)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const recipients: ReminderEmailData[] = body.recipients

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
    }

    // Limit to 50 emails per batch to avoid rate limits
    if (recipients.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 recipients per batch' }, { status: 400 })
    }

    const results = await sendBulkRenewalReminders(recipients)

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    })
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || 'Failed to send emails',
    }, { status: 500 })
  }
}
