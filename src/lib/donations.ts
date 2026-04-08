import { supabase } from './supabase'

export interface Donation {
  donationId: number
  BillNo: string
  donationSerial: string
  donationClient: string
  donationStatus: string
  donationType: string
  iptvServerName: string
  serverName: string
  serverPort: string
  dateBegin: string
  dateEnd: string
  modifdte: string
  iks: number
  iptv: number
  privateServer: string
  monthServices: number
  client_id: number
  status: number
  customerclient: string
  macaddress: string
  inactive: number
  Active: number
  notify_expiration: number
  admin_inactive: number
  NPFS_Order_NO: string
  ORGORDER: string
  ServicesComment: string
  dateChange: string
  iptvInternetProviderLock: number
  iptvCountryLock: string
  ResellerActivation: number
}

export async function getDonationsByClient(clientId: number) {
  const { data, error } = await supabase
    .from('my_donation')
    .select('*')
    .eq('client_id', clientId)
    .eq('ResellerActivation', 1)
    .order('donationId', { ascending: false })

  if (error) throw error
  return data as Donation[]
}

export async function getActiveDonations(clientId: number) {
  const { data, error } = await supabase
    .from('my_donation')
    .select('*')
    .eq('client_id', clientId)
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .eq('ResellerActivation', 1)
    .order('donationId', { ascending: false })

  if (error) throw error
  return data as Donation[]
}

export async function getInactiveDonations(clientId: number) {
  const { data, error } = await supabase
    .from('my_donation')
    .select('*')
    .eq('client_id', clientId)
    .eq('ResellerActivation', 1)
    .or('inactive.eq.1,admin_inactive.eq.1')
    .order('donationId', { ascending: false })

  if (error) throw error
  return data as Donation[]
}

export async function getDonationCounts(clientId: number) {
  const { count: active } = await supabase
    .from('my_donation')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('status', 1)
    .eq('inactive', 0)
    .eq('admin_inactive', 0)
    .eq('ResellerActivation', 1)

  const { count: inactive } = await supabase
    .from('my_donation')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('ResellerActivation', 1)
    .or('inactive.eq.1,admin_inactive.eq.1')

  const { count: total } = await supabase
    .from('my_donation')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)
    .eq('ResellerActivation', 1)

  return {
    active: active || 0,
    inactive: inactive || 0,
    total: total || 0,
  }
}

export async function activateDonation(donationId: number) {
  const { error } = await supabase
    .from('my_donation')
    .update({ status: 1, inactive: 0, admin_inactive: 0 })
    .eq('donationId', donationId)

  if (error) throw error
}

export async function deactivateDonation(donationId: number) {
  const { error } = await supabase
    .from('my_donation')
    .update({ inactive: 1 })
    .eq('donationId', donationId)

  if (error) throw error
}

export async function updateDonationCode(donationId: number, newCode: string, oldCode: string, customerClient: string, macaddress: string) {
  // Update donation
  const { error: updateErr } = await supabase
    .from('my_donation')
    .update({ donationSerial: newCode })
    .eq('donationId', donationId)

  if (updateErr) throw updateErr

  // Record history
  const { error: histErr } = await supabase
    .from('historicalofchange')
    .insert({
      NewCode: newCode,
      OldCode: oldCode,
      donationId,
      customerClient,
      macaddress,
    })

  if (histErr) throw histErr
}

export async function renewDonation(donationSerial: string, email: string, billNo: string, comment: string) {
  const { error } = await supabase
    .from('my_renewDonation')
    .insert({ donationSerial, email, BillNo: billNo, comment })

  if (error) throw error
}

export async function searchDonation(query: string) {
  // Search by serial code
  const { data: byCode } = await supabase
    .from('my_donation')
    .select('*')
    .ilike('donationSerial', `%${query}%`)
    .limit(50)

  if (byCode && byCode.length > 0) return byCode as Donation[]

  // Search by client email
  const { data: byEmail } = await supabase
    .from('my_donation')
    .select('*')
    .ilike('donationClient', `%${query}%`)
    .limit(50)

  return (byEmail || []) as Donation[]
}

export async function getCountries() {
  const { data, error } = await supabase
    .from('CountryName')
    .select('idCountry, CountryCode, CountryName')
    .order('CountryName')

  if (error) throw error
  return data
}

export async function resetIptv(donationSerial: string, donationId: number) {
  const { error } = await supabase
    .from('iptvReset')
    .insert({ donationSerial, donationId: String(donationId) })

  if (error) throw error
}
