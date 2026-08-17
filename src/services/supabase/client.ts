import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const SUPABASE_URL = "https://eurxkbnxqblgxmcviygg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cnhrYm54cWJsZ3htY3ZpeWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTI2NTYsImV4cCI6MjEwMjAyODY1Nn0.M0tJsAaZm1NQVNoNeASy9YhpH1F4V-LDtvCUIs_q08c";

const isClient = typeof window !== "undefined" || Platform.OS !== "web";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: isClient ? AsyncStorage : undefined,
    autoRefreshToken: isClient,
    persistSession: isClient,
    detectSessionInUrl: isClient,
  },
});
