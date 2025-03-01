import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput, HelperText } from "react-native-paper";
import { Link } from "expo-router";
import { theme } from "../../constants/theme";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const { signIn, loading, error } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    // Reset error state
    setEmailError("");

    // Validate email
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    signIn(email, password);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>
      <View style={styles.form}>
        <View>
          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            disabled={loading}
            error={!!emailError || (error?.message?.includes("email") ?? false)}
          />
          {emailError ? (
            <HelperText type="error" visible={true}>
              {emailError}
            </HelperText>
          ) : null}
        </View>
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          disabled={loading}
          error={!password && error != null}
        />
        {error && !emailError && (
          <HelperText type="error" visible={true}>
            {error.message}
          </HelperText>
        )}
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          disabled={!email || !password || loading}
        >
          Sign In
        </Button>
        <View style={styles.footer}>
          <Text variant="bodyMedium">Don't have an account? </Text>
          <Link href="/auth/register">
            <Text style={styles.link}>Sign Up</Text>
          </Link>
        </View>
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
    marginBottom: 32,
    color: theme.colors.primary,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  link: {
    color: theme.colors.primary,
  },
});
