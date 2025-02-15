import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { Alert } from "react-native";
import { logoutSuccess, logoutErrorGeneral } from "@/constants/messages";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

const handleLogout = async () => {
  const clearSession = useAuthStore.getState().clearSession;
  const hasInternet = useConnectionStatus();

  try {
    if (!hasInternet) {
      Alert.alert("Fehler", "Es besteht derzet keine Internetverbindung" )
      return; 
    }
    await clearSession();
    logoutSuccess();
    router.replace("/"); // Navigate to home
  } catch (error: any) {
    console.error("Logout failed:", error);
    Alert.alert(logoutErrorGeneral, error.message);
  }
};

export default handleLogout;
