import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: "#000" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
