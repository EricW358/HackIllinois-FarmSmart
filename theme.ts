import { Platform } from "react-native";
import { MD3DarkTheme, configureFonts } from "react-native-paper";

const fontConfig = {
  displayLarge: {
    fontFamily: Platform.select({
      web: "Inter, system-ui, -apple-system",
      ios: "System",
      default: "sans-serif",
    }),
    fontSize: 57,
    letterSpacing: 0,
    lineHeight: 64,
    fontWeight: "400",
  },
  // Add other font variants as needed
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4F46E5", // Modern indigo
    primaryContainer: "#312E81", // Darker indigo
    secondary: "#10B981", // Modern green
    secondaryContainer: "#065F46", // Darker green
    background: "#111827", // Dark background
    surface: "#1F2937", // Slightly lighter dark
    surfaceVariant: "#374151", // Even lighter dark
    error: "#EF4444", // Modern red
    errorContainer: "#991B1B", // Darker red
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onBackground: "#F9FAFB",
    onSurface: "#F3F4F6",
    onSurfaceVariant: "#E5E7EB",
    outline: "#4B5563",
    elevation: {
      level0: "transparent",
      level1: "#1F2937",
      level2: "#374151",
      level3: "#4B5563",
      level4: "#4B5563",
      level5: "#6B7280",
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 2,
};
