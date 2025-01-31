import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerTintColor: "#057958",
            headerTitle: "Deine Fragen",
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
          name="askQuestion"
          options={{ headerShown: true, headerTitle: "" }}
        />
        <Stack.Screen
          name="[questionId]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTintColor: "#057958",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
