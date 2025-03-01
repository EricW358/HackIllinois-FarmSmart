import { MD3LightTheme, configureFonts } from "react-native-paper";

const fontConfig = {
  displayLarge: {
    fontFamily: "System",
    fontSize: 57,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: "System",
    fontSize: 45,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: "System",
    fontSize: 36,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 44,
  },
  bodyLarge: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.15,
    lineHeight: 24,
  },
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2E7D32", // Forest Green
    secondary: "#66BB6A", // Light Green
    tertiary: "#81C784", // Pale Green
    error: "#B00020",
    background: "#F5F5F5",
    surface: "#FFFFFF",
    text: "#000000",
    disabled: "#757575",
    placeholder: "#9E9E9E",
  },
  fonts: configureFonts({ config: fontConfig }),
};

export type AppTheme = typeof theme;
