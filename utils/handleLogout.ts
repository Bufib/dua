import { router } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { Alert } from "react-native";
import { logoutSuccess, logoutErrorGeneral } from "@/constants/messages";

const handleLogout = async () => {
  const clearSession = useAuthStore.getState().clearSession;

  try {
    await clearSession();
    logoutSuccess();
    router.replace("/"); // Navigate to home
  } catch (error: any) {
    console.error("Logout failed:", error);
    Alert.alert(logoutErrorGeneral, error.message);
  }
};

export default handleLogout;
