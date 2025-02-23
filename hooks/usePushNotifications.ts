import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import useNotificationStore from "@/stores/notificationStore";

const TOKEN_STORAGE_KEY = "pushTokenStored";
export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id ?? null;
  const router = useRouter();
  const getNotifications = useNotificationStore(
    (state) => state.getNotifications
  );

  // Set up notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldShowAlert: true,
      shouldSetBadge: true,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Notification setup
  useEffect(() => {
    if (!getNotifications || !userId) return;
    const setupNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
        await supabase
          .from("user_token")
          .upsert({ user_id: userId, expo_push_token: token.data });
      }
    };
    setupNotifications();
  }, [getNotifications, userId]);

  // Notification listeners
  useEffect(() => {
    if (!getNotifications) return;
    notificationListener.current =
      Notifications.addNotificationReceivedListener(setNotification);
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [getNotifications]);

  // Function to register for push notifications
  async function registerForPushNotificationsAsync() {
    const { getNotifications } = useNotificationStore.getState();
    if (!getNotifications) return;
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        // In production, replace alert with a more user-friendly UI notification or log the error.
        alert("Failed to get push token for push notification");
        return;
      }

      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas.projectId,
      });
    } else {
      alert("Must be using a physical device for Push notifications");
    }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#057958",
      });
    }

    return token;
  }

  function redirect(notification: Notifications.Notification) {
    setTimeout(() => {
      router.push({
        pathname: "/(tabs)/home",
      });
    }, 1);
  }

  function handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    redirect(response.notification);
  }

  return {
    expoPushToken,
    notification,
  };
};
