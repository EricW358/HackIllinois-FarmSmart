import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Surface,
  useTheme,
  IconButton,
} from "react-native-paper";
import { Link } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const theme = useTheme();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await signUp(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surfaceVariant]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <Surface
        style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
        elevation={4}
      >
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Create Account
        </Text>
        <Text
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Join FarmSmart to get started
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                background: theme.colors.surface,
              },
            }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                background: theme.colors.surface,
              },
            }}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
                iconColor={theme.colors.onSurfaceVariant}
              />
            }
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            contentStyle={styles.inputContent}
            theme={{
              colors: {
                primary: theme.colors.primary,
                onSurface: theme.colors.onSurface,
                background: theme.colors.surface,
              },
            }}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                iconColor={theme.colors.onSurfaceVariant}
              />
            }
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign Up
          </Button>

          <View style={styles.footer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{" "}
            </Text>
            <Link href="/login" asChild>
              <Button
                mode="text"
                compact
                style={{ marginLeft: -8 }}
                labelStyle={{ color: theme.colors.primary }}
              >
                Sign In
              </Button>
            </Link>
          </View>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: "transparent",
  },
  inputContent: {
    backgroundColor: "transparent",
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    height: 48,
  },
  buttonContent: {
    height: 48,
  },
  error: {
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
});
