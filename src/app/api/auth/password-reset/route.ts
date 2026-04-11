import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import { sendPasswordResetEmail } from '@/lib/email'

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(request.url).origin
}

// POST /api/auth/password-reset - Request password reset
export async function POST(request: Request) {
  const formData = await request.formData()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const baseUrl = getBaseUrl(request)

  if (!email) {
    return NextResponse.redirect(
      new URL('/password-reset?error=Please+enter+your+email', baseUrl)
    )
  }

  // Check if user exists
  const { data: user } = await supabase
    .from('users')
    .select('user_id, user_email')
    .eq('user_email', email)
    .single()

  // Always show success message (don't reveal if email exists)
  if (!user) {
    return NextResponse.redirect(
      new URL('/password-reset?success=If+your+email+is+registered,+you+will+receive+a+reset+link', baseUrl)
    )
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTimestamp = new Date().toISOString()

  // Store token in database
  const { error: updateErr } = await supabase
    .from('users')
    .update({
      user_password_reset_hash: resetToken,
      user_password_reset_timestamp: resetTimestamp,
    })
    .eq('user_id', user.user_id)

  if (updateErr) {
    return NextResponse.redirect(
      new URL('/password-reset?error=Something+went+wrong.+Please+try+again', baseUrl)
    )
  }

  // Send email
  try {
    await sendPasswordResetEmail(email, resetToken, baseUrl)
  } catch (err) {
    console.error('SendGrid error:', err)
    // Don't reveal email sending failures to the user
  }

  return NextResponse.redirect(
    new URL('/password-reset?success=If+your+email+is+registered,+you+will+receive+a+reset+link', baseUrl)
  )
}
