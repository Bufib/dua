import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase.ts";
import { SQLiteProvider } from "expo-sqlite";
import Toast from "react-native-toast-message";
import { Appearance } from "react-native";
import { Storage } from "expo-sqlite/kv-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import NetInfo from "@react-native-community/netinfo";
import { noInternet } from "@/constants/messages";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize database
  const dbInitialized = useInitializeDatabase();
  const { restoreSession } = useAuthStore();
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const { expoPushToken, notification } = usePushNotifications();

  // Musst be before 'if (!dbInitialized)' or 'Rendered more hooks' appearce because if (!loaded || !dbInitialized) -> we return and the useEffect benath it doesn't get used
  useEffect(() => {
    const setColorTheme = () => {
      const savedColorScheme = Storage.getItemSync("isDarkMode");
      Appearance.setColorScheme(savedColorScheme === "true" ? "dark" : "light");
    };
    setColorTheme();
  }, []);

  // Check internet connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Show toast on connectivity change
  useEffect(() => {
    if (isConnected === false) {
      noInternet();
    }
  }, [isConnected]);

  // Session restoration effect
  useEffect(() => {
    const initSession = async () => {
      await restoreSession();
      setIsSessionRestored(true);
    };
    initSession();
  }, []);

  //! Store push token
  useEffect(() => {
    if (expoPushToken?.data) {
      console.log("Push Token:", expoPushToken.data);
    }
  }, [expoPushToken]);

  //! Handle notifications
  useEffect(() => {
    if (notification) {
      console.log("Received notification:", notification);
    }
  }, [notification]);

  // Hide splash screen when everything is ready
  useEffect(() => {
    if (dbInitialized && isSessionRestored) {
      SplashScreen.hideAsync();
    }
  }, [dbInitialized, isSessionRestored]);

  if (!dbInitialized || !isSessionRestored) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <SupabaseRealtimeProvider>
          <SQLiteProvider databaseName="islam-fragen.db">
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(search)" options={{ headerShown: true, headerBackTitle: "Zurück", headerTitle: "Suche", headerTintColor: "#057958"}} />
              <Stack.Screen
                name="(question)"
                options={{ headerShown: false }}
              />
               <Stack.Screen
                name="(askQuestion)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </SQLiteProvider>
        </SupabaseRealtimeProvider>
      </QueryClientProvider>
      <Toast />
    </ThemeProvider>
  );
}
