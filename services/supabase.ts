import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

// Get Supabase URL and anon key from environment variables
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate URL and key
if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
  throw new Error(
    "Invalid or missing Supabase URL. URL must start with https://"
  );
}

if (!supabaseAnonKey) {
  throw new Error("Missing Supabase anonymous key");
}

// Ensure URL is properly formatted
const formattedUrl = supabaseUrl.endsWith("/")
  ? supabaseUrl.slice(0, -1)
  : supabaseUrl;

export const supabase = createClient(formattedUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
    storage: {
      getItem: async (key: string) => {
        try {
          return await localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          await localStorage.setItem(key, value);
        } catch {}
      },
      removeItem: async (key: string) => {
        try {
          await localStorage.removeItem(key);
        } catch {}
      },
    },
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,
    },
  },
});

// Types for auth state
export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthError = {
  message: string;
};
