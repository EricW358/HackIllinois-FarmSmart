import { Stack } from "expo-router";
import { PaperProvider, MD3DarkTheme } from "react-native-paper";
import { theme } from "../theme";
import { View, StyleSheet, StatusBar, SafeAreaView } from "react-native";

// Dark purple background color (HSL: 260, 50%, 1%)
const BACKGROUND_COLOR = "#030106";

// Create a custom theme with forced dark background
const forcedDarkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: BACKGROUND_COLOR,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={forcedDarkTheme}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={BACKGROUND_COLOR}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: BACKGROUND_COLOR,
              },
              headerTitleStyle: {
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "600",
              },
              headerTitleAlign: "center",
              headerShadowVisible: false,
              headerBackTitle: "",
              headerTintColor: "#FFFFFF",
              headerShown: false,
              contentStyle: {
                backgroundColor: BACKGROUND_COLOR,
              },
            }}
          >
            <Stack.Screen
              name="(auth)/login"
              options={{
                headerTitle: "Sign In",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(auth)/register"
              options={{
                headerTitle: "Create Account",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(main)/chat/index"
              options={{
                headerTitle: "FarmSmart",
              }}
            />
          </Stack>
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
});
