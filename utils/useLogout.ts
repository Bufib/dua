import { useCallback } from "react";
import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { Alert } from "react-native";
import { logoutSuccess, logoutErrorGeneral } from "@/constants/messages";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

export const useLogout = () => {
  const clearSession = useAuthStore.getState().clearSession;
  const hasInternet = useConnectionStatus();

  const logout = useCallback(async () => {
    try {
      console.log("logging out");
      if (!hasInternet) {
        Alert.alert("Fehler", "Es besteht derzeit keine Internetverbindung");
        return;
      }

      await clearSession();
      logoutSuccess();
      router.replace("/"); // Navigate to home
    } catch (error: any) {
      console.error("Logout failed:", error);
      Alert.alert(logoutErrorGeneral, error.message);
    }
  }, [clearSession, hasInternet]);

  return logout;
};
