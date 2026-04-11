import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Available IPTV portals for cycling
const PORTALS = ['s1.iptv00.is', 's2.iptv00.is']

// POST /api/public/actions - Handle MAC change, IPTV reset, portal change, locks
export async function POST(request: Request) {
  const body = await request.json()
  const { action, donationId, email, serial } = body

  if (!action || !donationId || !email || !serial) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify ownership: the donation must match the email + serial
  const { data: donation, error: fetchErr } = await supabase
    .from('my_donation')
    .select('donationId, donationSerial, donationClient, macaddress, iptvServerName, iptvInternetProviderLock, iptvCountryLock, customerclient')
    .eq('donationId', donationId)
    .single()

  if (fetchErr || !donation) {
    return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  }

  if (donation.donationClient?.toLowerCase() !== email.toLowerCase() ||
      donation.donationSerial?.toLowerCase() !== serial.toLowerCase()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  switch (action) {
    case 'changeMac': {
      const { macAddress } = body
      if (!macAddress) {
        return NextResponse.json({ error: 'MAC address is required' }, { status: 400 })
      }
      // Validate MAC format
      const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      if (!macRegex.test(macAddress)) {
        return NextResponse.json({ error: 'Invalid MAC address format (e.g. 00:1A:79:32:05:E2)' }, { status: 400 })
      }

      const { error } = await supabase
        .from('my_donation')
        .update({ macaddress: macAddress.toUpperCase() })
        .eq('donationId', donationId)

      if (error) return NextResponse.json({ error: 'Failed to update MAC address' }, { status: 500 })

      // Record change in history
      await supabase.from('historicalofchange').insert({
        NewCode: donation.donationSerial,
        OldCode: donation.donationSerial,
        donationId,
        customerClient: donation.customerclient,
        macaddress: macAddress.toUpperCase(),
      })

      return NextResponse.json({ success: true, message: 'MAC Address updated successfully', macAddress: macAddress.toUpperCase() })
    }

    case 'iptvReset': {
      const { error } = await supabase
        .from('iptvReset')
        .insert({ donationSerial: serial, donationId: String(donationId) })

      if (error) return NextResponse.json({ error: 'Failed to reset IPTV' }, { status: 500 })

      return NextResponse.json({ success: true, message: 'IPTV Reset submitted successfully' })
    }

    case 'changePortal': {
      const currentPortal = donation.iptvServerName?.trim() || ''
      // Cycle to the next portal
      const currentIdx = PORTALS.findIndex(p => p === currentPortal)
      const nextPortal = PORTALS[(currentIdx + 1) % PORTALS.length]

      const { error } = await supabase
        .from('my_donation')
        .update({ iptvServerName: nextPortal })
        .eq('donationId', donationId)

      if (error) return NextResponse.json({ error: 'Failed to change portal' }, { status: 500 })

      return NextResponse.json({ success: true, message: `IPTV Portal Changed to: ${nextPortal} Successfully!`, portal: nextPortal })
    }

    case 'internetProviderLock': {
      const { enabled } = body
      const { error } = await supabase
        .from('my_donation')
        .update({ iptvInternetProviderLock: enabled ? 1 : 0 })
        .eq('donationId', donationId)

      if (error) return NextResponse.json({ error: 'Failed to update Internet Provider Lock' }, { status: 500 })

      return NextResponse.json({ success: true, message: `Internet Provider Lock ${enabled ? 'Enabled' : 'Disabled'}` })
    }

    case 'countryLock': {
      const { country } = body
      if (!country) return NextResponse.json({ error: 'Country is required' }, { status: 400 })

      const { error } = await supabase
        .from('my_donation')
        .update({ iptvCountryLock: country })
        .eq('donationId', donationId)

      if (error) return NextResponse.json({ error: 'Failed to update Country Lock' }, { status: 500 })

      return NextResponse.json({ success: true, message: `Country Lock set to: ${country}` })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
