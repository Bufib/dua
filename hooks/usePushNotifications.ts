// import { useState, useEffect, useRef } from "react";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";

// import Constants from "expo-constants";

// import { Platform } from "react-native";

// export interface PushNotificationState {
//   expoPushToken?: Notifications.ExpoPushToken;
//   notification?: Notifications.Notification;
// }

// export const usePushNotifications = (): PushNotificationState => {
//   Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldPlaySound: false,
//       shouldShowAlert: true,
//       shouldSetBadge: false,
//     }),
//   });

//   const [expoPushToken, setExpoPushToken] = useState<
//     Notifications.ExpoPushToken | undefined
//   >();

//   const [notification, setNotification] = useState<
//     Notifications.Notification | undefined
//   >();

//   const notificationListener = useRef<Notifications.Subscription>();
//   const responseListener = useRef<Notifications.Subscription>();

//   async function registerForPushNotificationsAsync() {
//     let token;
//     if (Device.isDevice) {
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;

//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") {
//         alert("Failed to get push token for push notification");
//         return;
//       }

//       token = await Notifications.getExpoPushTokenAsync({
//         projectId: Constants.expoConfig?.extra?.eas.projectId,
//       });
//     } else {
//       alert("Must be using a physical device for Push notifications");
//     }

//     if (Platform.OS === "android") {
//       Notifications.setNotificationChannelAsync("default", {
//         name: "default",
//         importance: Notifications.AndroidImportance.MAX,
//         vibrationPattern: [0, 250, 250, 250],
//         lightColor: "#FF231F7C",
//       });
//     }

//     return token;
//   }

//   useEffect(() => {
//     registerForPushNotificationsAsync().then((token) => {
//       setExpoPushToken(token);
//     });

//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         setNotification(notification);
//       });

//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         console.log(response);
//       });

//     return () => {
//       Notifications.removeNotificationSubscription(
//         notificationListener.current!
//       );

//       Notifications.removeNotificationSubscription(responseListener.current!);
//     };
//   }, []);

//   return {
//     expoPushToken,
//     notification,
//   };
// };



import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/utils/supabase";

export interface PushNotificationState {
  expoPushToken?: Notifications.ExpoPushToken;
  notification?: Notifications.Notification;
}

export const usePushNotifications = (): PushNotificationState => {
  const { session } = useAuthStore();
  const userId = session?.user?.id ?? null;

  // Set up notification handler for foreground notifications
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Function to register for push notifications
  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
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
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  // First useEffect: Register for notifications and save token
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token);
    });
  }, []);

  // Second useEffect: Save the push token to Supabase if available
  useEffect(() => {
    if (expoPushToken && userId) {
      // Consider using upsert() if you want to avoid duplicate tokens.
      supabase
        .from("pending_notification")
        .insert({
          user_id: userId,
          expo_push_token: expoPushToken.data,
        })
        .then(({ error }) => {
          if (error) {
            console.error("Error saving push token:", error);
            // In production, you might want to report this error to your error monitoring service.
          }
        });
    }
  }, [expoPushToken, userId]);

  // Third useEffect: Set up notification listeners
  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
