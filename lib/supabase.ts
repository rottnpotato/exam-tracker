import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper functions for map counter
export async function getMapCounter() {
  const { data, error } = await supabase
    .from('map_counter')
    .select('count, last_reset_date')
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // no rows returned
      return { count: 0, lastResetDate: new Date().toISOString() }
    }
    throw error
  }

  return {
    count: data.count,
    lastResetDate: data.last_reset_date
  }
}

export async function incrementMapCounter() {
  const today = new Date().toISOString().split('T')[0]
  
  // First, check if we need to reset the counter
  const { data: currentData } = await supabase
    .from('map_counter')
    .select('count, last_reset_date')
    .single()

  if (!currentData || new Date(currentData.last_reset_date).toISOString().split('T')[0] !== today) {
    // Reset counter for new day
    const { data, error } = await supabase
      .from('map_counter')
      .upsert({ id: 1, count: 1, last_reset_date: today })
      .select()
      .single()

    if (error) throw error
    return data.count
  }

  // Increment existing counter
  const { data, error } = await supabase.rpc('increment_map_counter')

  if (error) throw error
  return data
}