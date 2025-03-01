import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { Link, Redirect } from "expo-router";
import { theme } from "../constants/theme";
import { useAuth } from "../hooks/useAuth";

export default function Welcome() {
  const { user, loading } = useAuth();

  // If user is already logged in, redirect to chat
  if (user) {
    return <Redirect href="/(main)/chat" />;
  }

  // Show loading state
  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text variant="displayLarge" style={styles.title}>
        Smart Farming Assistant
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Your AI-powered farming companion
      </Text>
      <View style={styles.buttonContainer}>
        <Link href="/auth/login" asChild>
          <Button mode="contained" style={styles.button}>
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register" asChild>
          <Button mode="outlined" style={styles.button}>
            Create Account
          </Button>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.secondary,
    textAlign: "center",
    marginBottom: 40,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 16,
  },
  button: {
    width: "100%",
  },
});
