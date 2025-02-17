import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MenuProvider } from "react-native-popup-menu";
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <MenuProvider>
        <Stack
          screenOptions={{
            headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="add" options={{ headerShown: false }} />
          <Stack.Screen name="addNews" options={{ headerShown: false }} />
        </Stack>
      </MenuProvider>
    </ThemeProvider>
  );
}
