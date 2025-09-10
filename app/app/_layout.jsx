import { Stack } from "expo-router";
import { useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../styles/global.css";
import AuthLayout from "./(auth)/_layout";

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with your authentication logic

  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <AuthLayout onAuthSuccess={() => setIsAuthenticated(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
