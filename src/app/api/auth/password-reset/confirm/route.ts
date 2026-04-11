import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'

function getBaseUrl(request: Request): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) return `${forwardedProto}://${forwardedHost}`
  return new URL(request.url).origin
}

// POST /api/auth/password-reset/confirm - Set new password
export async function POST(request: Request) {
  const formData = await request.formData()
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const token = formData.get('token') as string || ''
  const password = formData.get('password') as string || ''
  const confirmPassword = formData.get('confirmPassword') as string || ''
  const baseUrl = getBaseUrl(request)

  if (!email || !token || !password) {
    return NextResponse.redirect(
      new URL(`/password-reset/confirm?token=${token}&email=${encodeURIComponent(email)}&error=All+fields+are+required`, baseUrl)
    )
  }

  if (password.length < 6) {
    return NextResponse.redirect(
      new URL(`/password-reset/confirm?token=${token}&email=${encodeURIComponent(email)}&error=Password+must+be+at+least+6+characters`, baseUrl)
    )
  }

  if (password !== confirmPassword) {
    return NextResponse.redirect(
      new URL(`/password-reset/confirm?token=${token}&email=${encodeURIComponent(email)}&error=Passwords+do+not+match`, baseUrl)
    )
  }

  // Verify token
  const { data: user } = await supabase
    .from('users')
    .select('user_id, user_password_reset_hash, user_password_reset_timestamp')
    .eq('user_email', email)
    .single()

  if (!user || user.user_password_reset_hash !== token) {
    return NextResponse.redirect(
      new URL('/password-reset?error=Invalid+or+expired+reset+link.+Please+request+a+new+one', baseUrl)
    )
  }

  // Check if token is expired (1 hour)
  if (user.user_password_reset_timestamp) {
    const tokenTime = new Date(user.user_password_reset_timestamp).getTime()
    const now = Date.now()
    if (now - tokenTime > 60 * 60 * 1000) {
      return NextResponse.redirect(
        new URL('/password-reset?error=Reset+link+has+expired.+Please+request+a+new+one', baseUrl)
      )
    }
  }

  // Hash new password and update
  const newHash = bcrypt.hashSync(password, 10)
  const { error } = await supabase
    .from('users')
    .update({
      user_password_hash: newHash,
      user_password_reset_hash: null,
      user_password_reset_timestamp: null,
    })
    .eq('user_id', user.user_id)

  if (error) {
    return NextResponse.redirect(
      new URL(`/password-reset/confirm?token=${token}&email=${encodeURIComponent(email)}&error=Failed+to+update+password.+Try+again`, baseUrl)
    )
  }

  return NextResponse.redirect(
    new URL('/login?success=Password+reset+successfully.+You+can+now+log+in', baseUrl)
  )
}
