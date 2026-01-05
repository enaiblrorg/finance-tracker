import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Initialize Supabase client
// NOTE: These will be replaced with actual values from env
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client with platform-specific storage
let supabase: SupabaseClient;

// Only use AsyncStorage on native platforms, not during web SSR
if (Platform.OS !== 'web') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
} else {
    // Web platform - use default localStorage
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    });
}

export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };
