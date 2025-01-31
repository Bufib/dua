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
import { View, Text } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Platform } from "react-native";
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerTitle: (props) => (
            <ThemedView
              style={{
                width: 250,
                backgroundColor: "transparent",
                alignItems: Platform.OS === "ios" ? "center" : "flex-start",
              }}
            >
              <ThemedText
                numberOfLines={1}
                ellipsizeMode="tail"
                type="defaultSemiBold"
              >
                {props.children}
              </ThemedText>
            </ThemedView>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: true, headerTintColor: "#057958" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
