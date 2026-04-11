import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/public/search-order - Search donations by Order Number + Email
export async function POST(request: Request) {
  const body = await request.json()
  const { orderNumber, email } = body

  if (!orderNumber || !email) {
    return NextResponse.json({ error: 'Order number and email are required' }, { status: 400 })
  }

  // First verify the order exists and email matches
  const { data: order } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, amount, cant')
    .eq('BillNo', orderNumber.trim())
    .ilike('ClientEmail', email.trim())
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found. Please check your order number and email.' }, { status: 404 })
  }

  // Find all donations assigned to this order
  const { data: assignments } = await supabase
    .from('AssignDonationsForm')
    .select('donationSerial')
    .eq('BillNo', orderNumber.trim())

  const serials = (assignments || []).map(a => a.donationSerial).filter(Boolean)

  if (serials.length === 0) {
    return NextResponse.json({
      order: {
        billNo: order.BillNo,
        email: order.ClientEmail,
        date: order.PurchaseDate,
        amount: order.amount,
        quantity: order.cant,
      },
      donations: [],
    })
  }

  // Get donation details for each serial
  const { data: donations } = await supabase
    .from('my_donation')
    .select('donationId, donationSerial, iptvServerName, macaddress, dateEnd, status, inactive, admin_inactive')
    .in('donationSerial', serials)

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const donationList = (donations || []).map(d => {
    const endDate = new Date(d.dateEnd + 'T00:00:00')
    const remainingDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isActive = d.status === 1 && d.inactive === 0 && d.admin_inactive === 0
    return {
      serial: d.donationSerial,
      portal: d.iptvServerName,
      macAddress: d.macaddress || '',
      dateEnd: d.dateEnd,
      remainingDays: Math.max(0, remainingDays),
      status: isActive ? 'Running' : 'Inactive',
    }
  })

  return NextResponse.json({
    order: {
      billNo: order.BillNo,
      email: order.ClientEmail,
      date: order.PurchaseDate,
      amount: order.amount,
      quantity: order.cant,
    },
    donations: donationList,
  })
}
