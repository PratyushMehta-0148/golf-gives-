import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Subscription pricing (in GBP pence)
export const PLANS = {
  monthly: { label: 'Monthly', price: 999, priceDisplay: '£9.99', interval: 'month' },
  yearly: { label: 'Yearly', price: 9999, priceDisplay: '£99.99', interval: 'year', savings: 'Save £19.89' },
}

// Prize pool distribution
export const PRIZE_DISTRIBUTION = {
  '5-match': 0.40,
  '4-match': 0.35,
  '3-match': 0.25,
}
