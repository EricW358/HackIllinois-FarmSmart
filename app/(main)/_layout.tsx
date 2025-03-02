import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { IconButton, Surface } from "react-native-paper";
import {
  StyleSheet,
  Platform,
  Text,
  View,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Exact colors from the Tailwind CSS variables
const COLORS = {
  background: "#030106", // HSL: 260, 50%, 1% (extremely dark purple-black)
  foreground: "#F1F5FB", // --foreground: 210 40% 98%
  primary: "#A855F7", // --primary: 270 100% 70%
  primaryForeground: "#F1F5FB", // --primary-foreground: 210 40% 98%
  secondary: "#D946EF", // --secondary: 290 100% 70%
  secondaryForeground: "#F1F5FB", // --secondary-foreground: 210 40% 98%
  muted: "#1E1433", // --muted: 260 50% 15%
  mutedForeground: "#A1B4CC", // --muted-foreground: 215 20% 65%
  border: "#1E1433", // --border: 260 50% 15%

  // Neon gradient colors
  purple: "#A855F7", // purple-500
  pink: "#EC4899", // pink-500
  blue: "#3B82F6", // blue-500
};

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />
      <View style={styles.container}>
        <Stack
          screenOptions={{
            header: ({ navigation, route, options }) => (
              <View style={styles.headerWrapper}>
                <View style={styles.header}>
                  <View style={styles.headerContent}>
                    <View style={styles.logoContainer}>
                      <LinearGradient
                        colors={[COLORS.purple, COLORS.pink, COLORS.blue]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoGradient}
                      >
                        <Text style={styles.logoText}>FS</Text>
                      </LinearGradient>

                      <Text style={styles.titleGradient}>{options.title}</Text>
                    </View>

                    <View style={styles.actionsContainer}>
                      <IconButton
                        icon="logout"
                        iconColor={COLORS.foreground}
                        size={18}
                        onPress={signOut}
                        style={styles.logoutButton}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ),
            headerStyle: {
              backgroundColor: COLORS.background,
            },
            headerTintColor: COLORS.foreground,
            headerTitleStyle: {
              color: COLORS.foreground,
            },
            headerTitleAlign: "center",
            contentStyle: {
              backgroundColor: COLORS.background,
            },
          }}
        >
          <Stack.Screen
            name="chat/index"
            options={{
              title: "FarmSmart",
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
    backgroundColor: COLORS.background, // HSL: 260, 50%, 5%
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background, // HSL: 260, 50%, 5%
  },
  headerWrapper: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border}80`,
    backgroundColor: COLORS.background, // HSL: 260, 50%, 5%
  },
  header: {
    height: 64,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: COLORS.foreground,
    fontWeight: "bold",
    fontSize: 14,
  },
  titleGradient: {
    fontSize: 20,
    fontWeight: "bold",
    // Using a text shadow to simulate the gradient text effect
    textShadowColor: COLORS.purple,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    color: COLORS.foreground,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    margin: 0,
  },
});
