import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import i18n from "@/utils/i18n";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="impressum"
          options={{ headerShown: true, headerBackTitle: i18n.t("back") }}
        />
        <Stack.Screen
          name="about"
          options={{ presentation: "modal", headerTitle: "Über die App" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
