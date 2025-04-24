import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
import { ActivityIndicator, Appearance } from "react-native";
import { Storage } from "expo-sqlite/kv-store";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/queryClient";
import { useAuthStore } from "@/stores/authStore";
import { NoInternet } from "@/components/NoInternet";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { SupabaseRealtimeProvider } from "@/components/SupabaseRealtimeProvider";
import useNotificationStore from "@/stores/notificationStore";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import ReMountManager from "@/components/ReMountManager";
import { View, Text } from "react-native";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { Colors } from "@/constants/Colors";
import { I18nextProvider } from "react-i18next";
import i18n from "@/utils/i18n";
import { LanguageProvider } from "@/context/LanguageContext";
import LanguageGate from "@/components/LanguageGate";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize database
  const dbInitialized = useInitializeDatabase();
  console.log(dbInitialized);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const [isSessionRestored, setIsSessionRestored] = useState(false);
  const hasInternet = useConnectionStatus();
  const { expoPushToken, notification } = usePushNotifications();
  const [storesHydrated, setStoresHydrated] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);

  // Musst be before 'if (!dbInitialized)' or 'Rendered more hooks' appearce because if (!loaded || !dbInitialized) -> we return and the useEffect benath it doesn't get used
  useEffect(() => {
    const setColorTheme = () => {
      const savedColorScheme = Storage.getItemSync("isDarkMode");
      Appearance.setColorScheme(savedColorScheme === "true" ? "dark" : "light");
    };
    setColorTheme();
  }, []);

  useEffect(() => {
    const hydrateStores = async () => {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useFontSizeStore.persist.rehydrate(),
        useNotificationStore.persist.rehydrate(),
        useNotificationStore.getState().checkPermissions(),
      ]);

      setStoresHydrated(true);
    };

    hydrateStores();
  }, []);

  // Session restoration effect
  useEffect(() => {
    const initSession = async () => {
      await restoreSession();
      setIsSessionRestored(true);
    };
    initSession();
  }, []);

  //! Store push token
  // useEffect(() => {
  //   if (expoPushToken?.data) {
  //     console.log("Push Token:", expoPushToken.data);
  //   }
  // }, [expoPushToken]);

  //! Handle notifications
  // useEffect(() => {
  //   if (notification) {
  //     console.log("Received notification:", notification);
  //   }
  // }, [notification]);

  // Debounce showing the loadingScreen by 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Test
    if (!dbInitialized && hasInternet) {
      timer = setTimeout(() => {
        setShowLoadingScreen(true);
      }, 2000);
    } else {
      // If DB becomes initialized or connectivity changes, reset the flag
      setShowLoadingScreen(false);
    }

    return () => clearTimeout(timer); // Properly clear the timeout on cleanup
  }, [dbInitialized, hasInternet]);

  // Hide splash screen when everything is ready
  useEffect(() => {
    if (dbInitialized && isSessionRestored && storesHydrated) {
      SplashScreen.hideAsync();
      return;
    }

    if (!hasInternet) {
      SplashScreen.hideAsync();
      Toast.show({
        type: "error",
        text1: "Keine Internetverbindung",
        text2: "Daten können nicht geladen werden!",
      });
      // Quits the useEffect tree
      return;
    }

    SplashScreen.hideAsync();
  }, [dbInitialized, isSessionRestored, storesHydrated, hasInternet]);

  // Show loading video
  if (!dbInitialized && showLoadingScreen) {
    return (
      // Add this return
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.universal.third,
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
        }}
      >
        <Text
          style={{
            fontSize: 30,
            color: Colors.universal.primary,
            fontWeight: "700",
          }}
        >
          Fragen werden geladen!
        </Text>
        <ActivityIndicator size={"large"} />
        <Text
          style={{
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Je nach Internetverbindung, kann das einen Augenblick dauern.
        </Text>
        <Toast />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <I18nextProvider i18n={i18n}>
          <LanguageProvider>
            <LanguageGate>
              <ReMountManager>
                <NoInternet showUI={false} showToast={true} />
                <QueryClientProvider client={queryClient}>
                  <SupabaseRealtimeProvider>
                    <SQLiteProvider databaseName="islam-fragen.db">
                      <Stack
                        screenOptions={{
                          headerTintColor:
                            colorScheme === "dark" ? "#d0d0c0" : "#000",
                        }}
                      >
                        <Stack.Screen
                          name="index"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(tabs)"
                          options={{ headerShown: false }}
                        />
                        <Stack.Screen
                          name="(search)"
                          options={{
                            headerShown: true,
                            headerBackTitle: i18n.t("back"),
                            headerTitle: "Suche",
                          }}
                        />
                        <Stack.Screen
                          name="[prayer]"
                          options={{
                            headerShown: true,
                            headerBackTitle: i18n.t("back"),
                          }}
                        />

                        <Stack.Screen name="+not-found" />
                      </Stack>
                      <StatusBar style="auto" />
                    </SQLiteProvider>
                  </SupabaseRealtimeProvider>
                </QueryClientProvider>
                <Toast />
              </ReMountManager>
            </LanguageGate>
          </LanguageProvider>
        </I18nextProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
