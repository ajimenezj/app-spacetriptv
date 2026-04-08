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

// ---- Sales Today ----
export async function getSalesToday() {
  const td = today()
  const { data, error } = await supabase
    .from('ClientEmail')
    .select('BillNo, ClientEmail, PurchaseDate, webClient, amount, cant')
    .eq('is_paid', 1)
    .neq('is_refund', 1)
    .gte('PurchaseDate', td + 'T00:00:00')
    .lte('PurchaseDate', td + 'T23:59:59')
    .order('PurchaseDate', { ascending: true })

  return data || []
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

  return data || []
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
  const { data } = await supabase
    .from('my_renewDonation')
    .select('renew_id, donationSerial, donationDate, email, BillNo, comment')
    .order('renew_id', { ascending: false })
    .limit(200)

  return data || []
}

// ---- Changes Today ----
export async function getChangesToday() {
  const td = today()
  const { data } = await supabase
    .from('historicalofchange')
    .select('NewCode, OldCode, modifdte, customerClient, macaddress')
    .gte('modifdte', td + 'T00:00:00')
    .lte('modifdte', td + 'T23:59:59')
    .order('modifdte', { ascending: false })

  return data || []
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
