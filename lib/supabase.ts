import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for your database tables
export interface LeaderboardEntry {
  id: string
  userid: string
  username: string
  profilepic: string
  count: number
  updated_at: string
  created_at: string
}

export interface CurrentMember {
  id: string
  userid: string
  username: string
  profilepic: string
  count: number
  updated_at: string
  created_at: string
}

export interface Stats {
  key: string
  value: number
  updated_at: string
  created_at: string
}
