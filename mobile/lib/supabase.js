import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://qgjfbhynkgqqdxmibdvq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnamZiaHlua2dxcWR4bWliZHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MjU3NjMsImV4cCI6MjA5NzIwMTc2M30.zPkVuNVxECBCDqede-UJL0kenpm1e_-Zkr_iPiozlYA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});