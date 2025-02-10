import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/utils/supabase";
import { Link, useRouter } from "expo-router";
import useNotificationStore from "@/stores/notificationStore";
import { Linking } from "react-native";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id ?? null;
  const router = useRouter();

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

  // First useEffect: Register for notifications and save token
  const getNotifications = useNotificationStore(
    (state) => state.getNotifications
  );

  useEffect(() => {
    if (getNotifications) {
      registerForPushNotificationsAsync().then((token) => {
        setExpoPushToken(token);
      });
    } else {
      setExpoPushToken(undefined);
      // Clean up listeners
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    }
  }, [getNotifications]);

  // Second useEffect: Save/Remove the push token to/from Supabase
  useEffect(() => {
    const { getNotifications } = useNotificationStore.getState();

    if (!getNotifications && userId) {
      // Remove token from Supabase when notifications are disabled
      supabase
        .from("pending_notification")
        .delete()
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error("Error removing push token:", error);
        });
    } else if (expoPushToken && userId) {
      // Insert token when notifications are enabled
      supabase
        .from("pending_notification")
        .insert({
          user_id: userId,
          expo_push_token: expoPushToken.data,
        })
        .then(({ error }) => {
          if (error) console.error("Error saving push token:", error);
        });
    }
  }, [
    expoPushToken,
    userId,
    useNotificationStore((state) => state.getNotifications),
  ]);

  // Third useEffect: Set up notification listeners
  useEffect(() => {
    const { getNotifications } = useNotificationStore.getState();
    let isMounted = true;

    function redirect(notification: Notifications.Notification) {
      const questionId = notification.request.content.data?.questionId;
      if (questionId) {
        setTimeout(() => {
          router.push({
            pathname: "/(askQuestion)/[questionId]",
            params: {
              questionId,
            },
          });
        }, 1);
      }
    }

    if (getNotifications) {
      // Check for any pending notifications
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!isMounted || !response?.notification) return;
        redirect(response.notification);
      });

      notificationListener.current =
        Notifications.addNotificationReceivedListener(setNotification);

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response received:", response);
          redirect(response.notification);
        });
    }

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [useNotificationStore((state) => state.getNotifications)]);

  return {
    expoPushToken,
    notification,
  };
};
