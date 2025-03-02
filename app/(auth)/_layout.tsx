import { Stack, Redirect } from "expo-router";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { View, StyleSheet, SafeAreaView } from "react-native";

// Dark purple background color (HSL: 260, 50%, 1%)
const BACKGROUND_COLOR = "#030106";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to chat if user is logged in
  if (user) {
    return <Redirect href="/(main)/chat" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: BACKGROUND_COLOR,
            },
            headerTintColor: theme.colors.onPrimary,
            headerTitleStyle: {
              color: theme.colors.onPrimary,
            },
            contentStyle: {
              backgroundColor: BACKGROUND_COLOR,
            },
          }}
        >
          <Stack.Screen
            name="login"
            options={{
              title: "Sign In",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="register"
            options={{
              title: "Create Account",
              headerShown: false,
            }}
          />
        </Stack>
      </View>
    </SafeAreaView>
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
