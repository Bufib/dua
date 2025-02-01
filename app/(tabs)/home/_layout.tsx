import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import { ThemeProvider,DarkTheme, DefaultTheme } from "@react-navigation/native";
export default function RootLayout() {
  const colorScheme = useColorScheme()
  return (
     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <Stack screenOptions={{headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000"}}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="category"
        options={{

          headerLeft: () => {
            return (
              <Ionicons
                name="chevron-back-outline"
                size={30}
                style={{ marginLeft: -16 }}
                onPress={() => router.back()}
                color={colorScheme === "dark" ? "#d0d0c0" : "#000"}
              />
            );
          },
        }}
      />
      <Stack.Screen
        name="subcategory"
        options={{ headerShown: true }}
      />
    </Stack>
    </ThemeProvider>
  );
}
