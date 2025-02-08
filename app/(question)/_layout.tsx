import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Platform } from "react-native";
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
         headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
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
                type="layoutNavigationText"
              >
                {props.children}
              </ThemedText>
            </ThemedView>
          ),
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: true, }}
        />
      </Stack>
    </ThemeProvider>
  );
}
