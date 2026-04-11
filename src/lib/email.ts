import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || ''
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
}

// Default sender - must be verified in SendGrid
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@spacetriptv.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'SpaceTripTV'

export interface ReminderEmailData {
  to: string
  customerName?: string
  serial: string
  dateEnd: string
  daysLeft: number
}

// ---- Renewal Reminder Email ----
export async function sendRenewalReminder(data: ReminderEmailData) {
  if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not configured')

  const daysText = data.daysLeft === 0
    ? 'expires today'
    : data.daysLeft === 1
    ? 'expires tomorrow'
    : `expires in ${data.daysLeft} days`

  const msg = {
    to: data.to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `SpaceTripTV - Your subscription ${daysText}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SpaceTripTV</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151;">Dear ${data.customerName || 'Valued Customer'},</p>
          <p style="font-size: 16px; color: #374151;">
            This is a friendly reminder that your SpaceTripTV subscription <strong>${daysText}</strong>.
          </p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; font-size: 14px; color: #4b5563;">
              <tr><td style="padding: 4px 0; font-weight: bold;">Serial:</td><td style="padding: 4px 0; font-family: monospace;">${data.serial}</td></tr>
              <tr><td style="padding: 4px 0; font-weight: bold;">Expiration Date:</td><td style="padding: 4px 0;">${data.dateEnd}</td></tr>
              <tr><td style="padding: 4px 0; font-weight: bold;">Days Remaining:</td><td style="padding: 4px 0;"><span style="background: ${data.daysLeft <= 3 ? '#fef2f2' : '#fefce8'}; color: ${data.daysLeft <= 3 ? '#dc2626' : '#ca8a04'}; padding: 2px 8px; border-radius: 12px; font-weight: bold;">${data.daysLeft} day${data.daysLeft !== 1 ? 's' : ''}</span></td></tr>
            </table>
          </div>
          <p style="font-size: 16px; color: #374151;">Please renew your subscription to continue enjoying our service without interruption.</p>
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Best regards,<br><strong>SpaceTripTV Team</strong></p>
        </div>
        <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">This is an automated notification from SpaceTripTV.</p>
      </div>
    `,
    text: `Dear ${data.customerName || 'Customer'},\n\nYour SpaceTripTV subscription ${daysText}.\n\nSerial: ${data.serial}\nExpiration: ${data.dateEnd}\nDays remaining: ${data.daysLeft}\n\nPlease renew to continue enjoying our service.\n\nBest regards,\nSpaceTripTV Team`,
  }

  await sgMail.send(msg)
}

// Send bulk renewal reminders
export async function sendBulkRenewalReminders(recipients: ReminderEmailData[]) {
  if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not configured')

  const results = { sent: 0, failed: 0, errors: [] as string[] }

  for (const recipient of recipients) {
    try {
      await sendRenewalReminder(recipient)
      results.sent++
    } catch (err: any) {
      results.failed++
      results.errors.push(`${recipient.to}: ${err.message || 'Unknown error'}`)
    }
  }

  return results
}

// ---- Password Reset Email ----
export async function sendPasswordResetEmail(email: string, resetToken: string, baseUrl: string) {
  if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY is not configured')

  const resetLink = `${baseUrl}/password-reset/confirm?token=${resetToken}&email=${encodeURIComponent(email)}`

  const msg = {
    to: email,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: 'SpaceTripTV - Password Reset',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">SpaceTripTV</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; color: #374151;">Hello,</p>
          <p style="font-size: 16px; color: #374151;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 14px; color: #6b7280;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
      </div>
    `,
    text: `SpaceTripTV - Password Reset\n\nWe received a request to reset your password.\n\nClick this link to set a new password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
  }

  await sgMail.send(msg)
}
