import { Stack, Redirect } from "expo-router";
import { theme } from "../../constants/theme";
import { useAuth } from "../../hooks/useAuth";
import { IconButton } from "react-native-paper";

export default function MainLayout() {
  const { user, loading, signOut } = useAuth();

  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Redirect to login if user is not logged in
  if (!user) {
    return <Redirect href="/" />;
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
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="chat/index"
        options={{
          title: "Smart Farming Assistant",
          headerRight: () => (
            <IconButton
              icon="logout"
              iconColor={theme.colors.onPrimary}
              onPress={signOut}
            />
          ),
        }}
      />
    </Stack>
  );
}
