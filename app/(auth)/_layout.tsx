import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: true,
            headerTintColor: "#057958",
            headerTitle: "Login",
            headerLeft: () => {
              return (
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color="#057958"
                  style={{ marginLeft: -16 }}
                  onPress={() => router.back()}
                />
              );
            },
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            headerTintColor: "#057958",
            headerTitle: "Registrieren",
            headerLeft: () => {
              return (
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color="#057958"
                  style={{ marginLeft: -16 }}
                  onPress={() => router.back()}
                />
              );
            },
          }}
        />
        <Stack.Screen
          name="forgotPassword"
          options={{
            headerShown: true,
            headerTintColor: "#057958",
            headerTitle: "Passwort vergessen",
            headerLeft: () => {
              return (
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color="#057958"
                  style={{ marginLeft: -16 }}
                  onPress={() => router.back()}
                />
              );
            },
          }}
        />
        <Stack.Screen
          name="resetPassword"
          options={{
            headerShown: true,
            headerTintColor: "#057958",
            headerTitle: "Passwort ändern",
            headerLeft: () => {
              return (
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color="#057958"
                  style={{ marginLeft: -16 }}
                  onPress={() => router.back()}
                />
              );
            },
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
