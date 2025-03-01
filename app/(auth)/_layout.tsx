import { Stack, Redirect } from "expo-router";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";

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
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          color: theme.colors.onPrimary,
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
  );
}
