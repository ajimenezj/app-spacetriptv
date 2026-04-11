import { supabase } from './supabase'

// Super admin email - only this user sees admin panel
export const ADMIN_EMAIL = 'ajimenezj@gmail.com'

export function isAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

// Get today's date in YYYY-MM-DD format
function today() {
  return new Date().toISOString().split('T')[0]
}

// Get first day of current month
function firstOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// ---- Admin Dashboard Stats ----
export async function getAdminStats() {
  const td = today()
  const fom = firstOfMonth()

  const [totalRes, activeRes, inactiveRes] = await Promise.all([
    supabase.from('my_donation').select('*', { count: 'exact', head: true }),
    supabase.from('my_donation').select('*', { count: 'exact', head: true })
      .eq('status', 1).eq('inactive', 0).eq('admin_inactive', 0),
    supabase.from('my_donation').select('*', { count: 'exact', head: true })
      .or('inactive.eq.1,admin_inactive.eq.1'),
  ])

  return {
    total: totalRes.count || 0,
    active: activeRes.count || 0,
    inactive: inactiveRes.count || 0,
  }
}

// Classify sale: 1-4 donations = Normal, 5+ = Reseller
function classifySale(row: { cant?: number }) {
  const qty = Number(row.cant) || 0
  return qty >= 5 ? 'Reseller' : 'Normal'
}

// ---- Sales Today ----
export async function getSalesToday() {
  const td = today()
  const { data } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient, amount, cant')
    .eq('is_paid', 1)
    .neq('is_refund', 1)
    .gte('PurchaseDate', td + 'T00:00:00')
    .lte('PurchaseDate', td + 'T23:59:59')
    .order('PurchaseDate', { ascending: true })

  return (data || []).map(r => ({ ...r, saleType: classifySale(r) }))
}

// ---- Sales This Month ----
export async function getSalesMonth() {
  const fom = firstOfMonth()
  const td = today()
  const { data } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient, amount, cant')
    .eq('is_paid', 1)
    .neq('is_refund', 1)
    .gte('PurchaseDate', fom + 'T00:00:00')
    .lte('PurchaseDate', td + 'T23:59:59')
    .order('PurchaseDate', { ascending: false })

  return (data || []).map(r => ({ ...r, saleType: classifySale(r) }))
}

// ---- Activated Today ----
export async function getActivatedToday() {
  const td = today()
  const { data } = await supabase
    .from('my_donation')
    .select('BillNo, donationSerial, iptvServerName, macaddress, customerclient, dateEnd, dateBegin, iptv, status, inactive, admin_inactive, NPFS_Order_NO, donationId, iptvCountryLock, iptvInternetProviderLock')
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .eq('dateBegin', td)
    .order('dateEnd', { ascending: true })

  return data || []
}

// ---- Expiring Today ----
export async function getExpiringToday() {
  const td = today()
  const { data } = await supabase
    .from('my_donation')
    .select('BillNo, donationSerial, iptvServerName, macaddress, customerclient, dateEnd, iptv, status, inactive, admin_inactive, NPFS_Order_NO, donationId')
    .eq('status', 1)
    .eq('dateEnd', td)
    .order('dateEnd', { ascending: true })

  return data || []
}

// ---- Expiring This Month ----
export async function getExpiringMonth() {
  const fom = firstOfMonth()
  const d = new Date()
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('my_donation')
    .select('BillNo, donationSerial, iptvServerName, macaddress, customerclient, dateEnd, iptv, status, inactive, admin_inactive, NPFS_Order_NO, donationId')
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .gte('dateEnd', fom)
    .lte('dateEnd', lastDay)
    .order('dateEnd', { ascending: true })

  return data || []
}

// ---- Expiring Next 20 Days (unified view) ----
export async function getExpiringNext20Days() {
  const td = today()
  const future = new Date()
  future.setDate(future.getDate() + 20)
  const endDate = future.toISOString().split('T')[0]

  const { data } = await supabase
    .from('my_donation')
    .select('BillNo, donationSerial, iptvServerName, macaddress, customerclient, dateEnd, iptv, status, inactive, admin_inactive, NPFS_Order_NO, donationId, donationClient')
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .gte('dateEnd', td)
    .lte('dateEnd', endDate)
    .order('dateEnd', { ascending: true })

  return (data || []).map(r => {
    const dEnd = new Date(r.dateEnd + 'T00:00:00')
    const now = new Date(td + 'T00:00:00')
    const daysLeft = Math.ceil((dEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return { ...r, daysLeft }
  })
}

// ---- Failed Payments ----
export async function getFailedPayments() {
  const fom = firstOfMonth()
  const td = today()
  const { data } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient')
    .eq('is_paid', 0)
    .gte('PurchaseDate', fom + 'T00:00:00')
    .lte('PurchaseDate', td + 'T23:59:59')
    .order('PurchaseDate', { ascending: false })

  return data || []
}

// ---- Full Refunds ----
export async function getFullRefunds() {
  const { data } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient, refundDate')
    .eq('is_paid', 1)
    .eq('is_refund', 1)
    .order('refundDate', { ascending: false })
    .limit(200)

  return data || []
}

// ---- Pending Payments ----
export async function getPendingPayments() {
  const fom = firstOfMonth()
  const td = today()
  const { data } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient')
    .eq('is_paid', 0)
    .gte('PurchaseDate', fom + 'T00:00:00')
    .order('PurchaseDate', { ascending: false })

  return data || []
}

// ---- Renewed Donations ----
export async function getRenewedDonations() {
  // Try with processed column first, fallback without it
  let { data, error } = await supabase
    .from('my_renewDonation')
    .select('renew_id, donationSerial, donationDate, email, BillNo, comment, processed')
    .order('renew_id', { ascending: false })
    .limit(200)

  if (error && error.code === '42703') {
    // processed column doesn't exist yet, fetch without it
    const res = await supabase
      .from('my_renewDonation')
      .select('renew_id, donationSerial, donationDate, email, BillNo, comment')
      .order('renew_id', { ascending: false })
      .limit(200)
    data = (res.data || []).map(r => ({ ...r, processed: 0 }))
  }

  return data || []
}

// ---- Mark renewals as processed ----
export async function markRenewalsProcessed(renewIds: number[]) {
  const { error } = await supabase
    .from('my_renewDonation')
    .update({ processed: 1 })
    .in('renew_id', renewIds)

  if (error) throw error
}

// ---- Changes Today ----
export async function getChangesToday() {
  const td = today()
  const { data } = await supabase
    .from('historicalofchange')
    .select('ChangeId, NewCode, OldCode, modifdte, customerClient, macaddress, donationId')
    .gte('modifdte', td + 'T00:00:00')
    .lte('modifdte', td + 'T23:59:59')
    .order('modifdte', { ascending: false })

  if (!data || data.length === 0) return []

  // Enrich with donation details
  const donationIds = [...new Set(data.map(r => r.donationId).filter(Boolean))]
  let donationMap: Record<number, any> = {}

  if (donationIds.length > 0) {
    const { data: donations } = await supabase
      .from('my_donation')
      .select('donationId, donationSerial, donationClient, BillNo, iptvServerName, dateEnd')
      .in('donationId', donationIds)

    for (const d of donations || []) {
      donationMap[d.donationId] = d
    }
  }

  return data.map(r => {
    const donation = donationMap[r.donationId] || {}
    return {
      ...r,
      donationSerial: donation.donationSerial || '',
      donationClient: donation.donationClient || '',
      BillNo: donation.BillNo || '',
      iptvServerName: donation.iptvServerName || '',
      dateEnd: donation.dateEnd || '',
    }
  })
}

// ---- Reports (Sales summary by website) ----
export async function getSalesSummary() {
  const fom = firstOfMonth()
  const td = today()
  const { data } = await supabase
    .from('ClientEmail')
    .select('webClient, amount, cant')
    .eq('is_paid', 1)
    .neq('is_refund', 1)
    .gte('PurchaseDate', fom + 'T00:00:00')
    .lte('PurchaseDate', td + 'T23:59:59')

  // Group by webClient manually
  const summary: Record<string, { total: number; codes: number }> = {}
  for (const row of (data || [])) {
    const key = row.webClient || 'Unknown'
    if (!summary[key]) summary[key] = { total: 0, codes: 0 }
    summary[key].total += Number(row.amount) || 0
    summary[key].codes += Number(row.cant) || 0
  }

  return Object.entries(summary).map(([web, s]) => ({
    webClient: web,
    totalSales: s.total.toFixed(2),
    totalCodes: s.codes,
  }))
}

// ---- Register Sale (Insert donation) ----
export async function registerSale(params: {
  orderNumber: string
  email: string
  amount: number
  webpage: string
  iptv: number
  serials: string[]
  serverURL: string
  nfpsOrder: string
}) {
  // Insert into ClientEmail
  const { error: ceErr } = await supabase
    .from('ClientEmail')
    .insert({
      ClientEmail: params.email,
      BillNo: params.orderNumber,
      is_paid: 1,
      webClient: params.webpage,
      amount: params.amount,
      cant: params.serials.length,
      iptv: params.iptv,
    })

  if (ceErr) throw ceErr

  // Insert each serial into AssignDonationsForm
  for (const serial of params.serials) {
    await supabase
      .from('AssignDonationsForm')
      .insert({
        BillNo: params.orderNumber,
        donationSerial: serial,
        serverURL: params.serverURL,
        AssignDonat: 1,
        NPFS_Order_NO: params.nfpsOrder,
      })
  }
}

// ---- Process Refund ----
export async function processRefund(billNo: string) {
  // Mark donations as inactive
  await supabase
    .from('my_donation')
    .update({ inactive: 1, admin_inactive: 1, ServicesComment: 'Full Refund' })
    .eq('BillNo', billNo)

  // Mark ClientEmail as refunded
  await supabase
    .from('ClientEmail')
    .update({ is_refund: 1, refundDate: today() })
    .eq('BillNo', billNo)
}

// ---- Bulk search donations by serial codes ----
export async function searchDonationsBulk(serials: string[]) {
  // Supabase .in() has a limit, batch in groups of 50
  const results: any[] = []
  for (let i = 0; i < serials.length; i += 50) {
    const batch = serials.slice(i, i + 50)
    const { data } = await supabase
      .from('my_donation')
      .select('donationId, BillNo, donationSerial, donationClient, customerclient, iptvServerName, macaddress, dateBegin, dateEnd, status, inactive, admin_inactive, iptv, iptvCountryLock, iptvInternetProviderLock, client_id')
      .in('donationSerial', batch)
    if (data) results.push(...data)
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0)

  return results.map(d => {
    const endDate = new Date(d.dateEnd + 'T00:00:00')
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isActive = d.status === 1 && d.inactive === 0 && d.admin_inactive === 0
    return {
      ...d,
      daysLeft,
      statusText: isActive ? 'Active' : 'Inactive',
    }
  })
}

// ---- Admin search donations by single query (serial, email, bill) ----
export async function adminSearchDonations(query: string) {
  const q = query.trim()
  if (!q) return []

  // Try by serial
  const { data: bySerial } = await supabase
    .from('my_donation')
    .select('donationId, BillNo, donationSerial, donationClient, customerclient, iptvServerName, macaddress, dateBegin, dateEnd, status, inactive, admin_inactive, iptv, client_id')
    .ilike('donationSerial', `%${q}%`)
    .limit(100)

  if (bySerial && bySerial.length > 0) return enrichResults(bySerial)

  // Try by client email
  const { data: byEmail } = await supabase
    .from('my_donation')
    .select('donationId, BillNo, donationSerial, donationClient, customerclient, iptvServerName, macaddress, dateBegin, dateEnd, status, inactive, admin_inactive, iptv, client_id')
    .ilike('donationClient', `%${q}%`)
    .limit(100)

  if (byEmail && byEmail.length > 0) return enrichResults(byEmail)

  // Try by BillNo
  const { data: byBill } = await supabase
    .from('my_donation')
    .select('donationId, BillNo, donationSerial, donationClient, customerclient, iptvServerName, macaddress, dateBegin, dateEnd, status, inactive, admin_inactive, iptv, client_id')
    .ilike('BillNo', `%${q}%`)
    .limit(100)

  return enrichResults(byBill || [])
}

function enrichResults(data: any[]) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return data.map(d => {
    const endDate = new Date(d.dateEnd + 'T00:00:00')
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const isActive = d.status === 1 && d.inactive === 0 && d.admin_inactive === 0
    return { ...d, daysLeft, statusText: isActive ? 'Active' : 'Inactive' }
  })
}

// ---- All Active Donations (admin view, no client_id filter) ----
export async function getAllActiveDonations() {
  const { data } = await supabase
    .from('my_donation')
    .select('donationId, BillNo, donationSerial, iptvServerName, macaddress, customerclient, dateEnd, dateBegin, iptv, status, inactive, admin_inactive, NPFS_Order_NO, iptvCountryLock, iptvInternetProviderLock, donationClient, client_id')
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .order('dateEnd', { ascending: true })
    .limit(500)

  return data || []
}
