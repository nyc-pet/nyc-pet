import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="pet/[id]"
          options={{
            headerShown: true,
            headerTitle: "Pet Details",
            headerBackTitle: "Back",
            headerTintColor: "#f97316",
            presentation: "card",
          }}
        />
      </Stack>
    </>
  );
}
