import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text } from "react-native-paper";

// This component wraps chart components and handles SVG-related errors
const ChartWrapper = ({
  children,
  fallbackText = "Chart visualization",
}: {
  children: React.ReactNode;
  fallbackText?: string;
}) => {
  // If we're on web and experiencing SVG issues, we can add special handling
  if (Platform.OS === "web") {
    // Suppress console errors related to SVG responder events
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("onStartShouldSetResponder") ||
          args[0].includes("Unknown event handler property"))
      ) {
        // Ignore these specific SVG-related errors
        return;
      }
      originalConsoleError(...args);
    };

    // Restore console.error when component unmounts
    React.useEffect(() => {
      return () => {
        console.error = originalConsoleError;
      };
    }, []);
  }

  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChartWrapper;
