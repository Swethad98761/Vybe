import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? "https://nujtalyynchxkgrvurwo.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51anRhbHl5bmNoeGtncnZ1cndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2NTEyOTQsImV4cCI6MjEwNDIyNzI5NH0.fRZ7LkzwgWS8LG1yGP91rfXzyHMslwqaImudGHbDs8A";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
