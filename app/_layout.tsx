import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { theme } from "../theme";
import { View, StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTitleStyle: {
              color: theme.colors.onSurface,
              fontSize: 18,
              fontWeight: "600",
            },
            headerTitleAlign: "center",
            headerShadowVisible: false,
            headerBackTitle: "",
            headerTintColor: theme.colors.primary,
            headerShown: false,
            contentStyle: {
              backgroundColor: theme.colors.background,
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
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
