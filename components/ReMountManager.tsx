import React, { useEffect, useCallback } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { initializeDatabase } from "@/utils/initializeDatabase";
import useNotificationStore from "@/stores/notificationStore";

const REFETCH_THRESHOLD = 5 * 60 * 1000; // 5 minutes
const LAST_FETCH_KEY = "lastFetchTime";

interface ReMountManagerProps {
  children: React.ReactNode;
  onInitialize?: () => void;
}

const ReMountManager = ({ children, onInitialize }: ReMountManagerProps) => {
  const checkPermissions = useNotificationStore((state) => state.checkPermissions);

  const updateLastFetchTime = useCallback(async () => {
    await AsyncStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
  }, []);

  const initializeDatabaseHandler = useCallback(async () => {
    try {
      await initializeDatabase();
      console.log("Database reinitialized successfully.");
      await updateLastFetchTime();
      onInitialize?.();
    } catch (error) {
      console.error("Error reinitializing database:", error);
    }
  }, [updateLastFetchTime, onInitialize]);

  const shouldReinitialize = useCallback(async () => {
    const lastFetchTime = await AsyncStorage.getItem(LAST_FETCH_KEY);
    const timeSinceLastFetch = Date.now() - parseInt(lastFetchTime || "0", 10);
    return timeSinceLastFetch > REFETCH_THRESHOLD;
  }, []);

  const handleAppStateChange = useCallback(
    async (nextAppState: AppState["currentState"]) => {
      try {
        const netState = await NetInfo.fetch();
        if (nextAppState === "active") {
          await checkPermissions();
          if (netState.isConnected) {
            const needsReinitialization = await shouldReinitialize();
            if (needsReinitialization) {
              await initializeDatabaseHandler();
            }
          }
        } else if (nextAppState === "background" || nextAppState === "inactive") {
          await updateLastFetchTime();
        }
      } catch (error) {
        console.error("Error handling app state change:", error);
      }
    },
    [checkPermissions, initializeDatabaseHandler, shouldReinitialize, updateLastFetchTime]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => subscription.remove();
  }, [handleAppStateChange]);

  return <>{children}</>;
};

export default ReMountManager;