import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://eurxkbnxqblgxmcviygg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cnhrYm54cWJsZ3htY3ZpeWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTI2NTYsImV4cCI6MjEwMjAyODY1Nn0.M0tJsAaZm1NQVNoNeASy9YhpH1F4V-LDtvCUIs_q08c';

// Verificamos si es navegador web O dispositivo nativo (iOS/Android)
const isClient = typeof window !== 'undefined' || Platform.OS !== 'web';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Usamos AsyncStorage en Android, iOS y Browser
    storage: isClient ? AsyncStorage : undefined,
    autoRefreshToken: isClient,
    persistSession: isClient,
    detectSessionInUrl: isClient,
  },
});