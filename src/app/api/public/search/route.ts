import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/public/search - Public search by email + serial code
export async function POST(request: Request) {
  const body = await request.json()
  const { email, serial } = body

  if (!email || !serial) {
    return NextResponse.json({ error: 'Email and serial code are required' }, { status: 400 })
  }

  // Search donation by serial and verify email matches
  const { data, error } = await supabase
    .from('my_donation')
    .select('donationId, BillNo, donationSerial, donationClient, iptvServerName, macaddress, customerclient, dateBegin, dateEnd, status, inactive, admin_inactive, iptv, iptvInternetProviderLock, iptvCountryLock, NPFS_Order_NO')
    .ilike('donationSerial', serial.trim())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Route not found. Please check your email and serial code.' }, { status: 404 })
  }

  // Verify email matches (case-insensitive)
  if (data.donationClient?.toLowerCase() !== email.trim().toLowerCase()) {
    return NextResponse.json({ error: 'Route not found. Please check your email and serial code.' }, { status: 404 })
  }

  // Calculate remaining days
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const endDate = new Date(data.dateEnd + 'T00:00:00')
  const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // Determine status
  const isActive = data.status === 1 && data.inactive === 0 && data.admin_inactive === 0
  const statusText = isActive ? 'Running' : 'Inactive'

  // Get countries for the dropdown
  const { data: countries } = await supabase
    .from('CountryName')
    .select('CountryCode, CountryName')
    .order('CountryName')

  return NextResponse.json({
    donationId: data.donationId,
    serial: data.donationSerial,
    email: data.donationClient,
    portal: data.iptvServerName,
    status: statusText,
    remainingDays: Math.max(0, remainingDays),
    macAddress: data.macaddress || '',
    internetProviderLock: data.iptvInternetProviderLock === 1 ? 'Enabled' : 'Disabled',
    countryLock: data.iptvCountryLock || 'All',
    banCount: 0, // Not tracked in current schema
    maxBans: 3,
    countries: countries || [],
  })
}
