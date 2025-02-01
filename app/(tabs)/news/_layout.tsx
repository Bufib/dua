import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import Entypo from "@expo/vector-icons/Entypo";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { MenuProvider } from "react-native-popup-menu";
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <MenuProvider>
        <Stack screenOptions={{headerTintColor: "#000"}}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="addNews" options={{ headerShown: false }} />
        </Stack>
      </MenuProvider>
    </ThemeProvider>
  );
}
