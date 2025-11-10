// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ekglpimylsvgibcibhbo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ2xwaW15bHN2Z2liY2liaGJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MDA1NjQsImV4cCI6MjA3ODM3NjU2NH0.BvoJK5APgRf7eO1P2ZGscuO0YcyFYqryCAU8afUvn50'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
