export const CONFIG = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
};

export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP: "/auth/sign-up",
    SIGN_IN: "/auth/sign-in",
    SIGN_OUT: "/auth/sign-out",
    RESET_PASSWORD: "/auth/reset-password",
  },
  CHAT: {
    SEND_MESSAGE: "/chat/send",
    GET_HISTORY: "/chat/history",
    GET_RECOMMENDATIONS: "/chat/recommendations",
  },
  FARM: {
    UPDATE_PROFILE: "/farm/profile",
    GET_ANALYTICS: "/farm/analytics",
  },
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: "@auth_token",
  USER_DATA: "@user_data",
  CHAT_HISTORY: "@chat_history",
};

export const CHAT_CONFIG = {
  MAX_MESSAGES: 50,
  MESSAGE_TIMEOUT: 30000, // 30 seconds
  TYPING_TIMEOUT: 3000, // 3 seconds
};
