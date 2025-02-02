import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Stack
      screenOptions={{
        headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
