// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// type NotificationState = {
//   getNotifications: boolean;
//   toggleGetNotifications: () => void;
// };

// const useNotificationStore = create<NotificationState>()(
//   persist(
//     (set, get) => ({
//       getNotifications: true,
//       toggleGetNotifications: () =>
//         set({ getNotifications: !get().getNotifications }),
//     }),
//     {
//       name: "notification-storage", 
//       storage: createJSONStorage(() => AsyncStorage),
//     }
//   )
// );

// export default useNotificationStore;
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as Notifications from "expo-notifications";

// type NotificationState = {
//   getNotifications: boolean;
//   toggleGetNotifications: () => Promise<void>;
// };

// const useNotificationStore = create<NotificationState>()(
//   persist(
//     (set, get) => ({
//       getNotifications: false,
//       toggleGetNotifications: async () => {
//         const currentState = get().getNotifications;
        
//         // Ask for permission when turning ON
//         if (!currentState) {
//           const { status } = await Notifications.requestPermissionsAsync();
//           if (status !== "granted") {
//             alert("Permission denied for notifications");
//             return;
//           }
//         }
        
//         set({ getNotifications: !currentState });
//       },
//     }),
//     {
//       name: "notification-storage",
//       storage: createJSONStorage(() => AsyncStorage),
//     }
//   )
// );

// export default useNotificationStore;


import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert, Linking } from "react-native";

type NotificationState = {
  getNotifications: boolean;
  permissionStatus: Notifications.PermissionStatus | 'undetermined';
  toggleGetNotifications: () => Promise<void>;
  checkPermissions: () => Promise<void>;
};

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      getNotifications: false,
      permissionStatus: 'undetermined',

      checkPermissions: async () => {
        const { status } = await Notifications.getPermissionsAsync();
        set({ permissionStatus: status });
      },

      toggleGetNotifications: async () => {
        const currentState = get().getNotifications;
        const currentPermission = get().permissionStatus;

        // If turning notifications on
        if (!currentState) {
          // Only request if permission is undetermined
          if (currentPermission === 'undetermined') {
            const { status } = await Notifications.requestPermissionsAsync();
            set({ permissionStatus: status });

            if (status !== 'granted') {
              Alert.alert(
                'Notifications Disabled',
                'To enable notifications, please grant permission in your device settings.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
              );
              return;
            }
          } 
          // If permission was previously denied
          else if (currentPermission !== 'granted') {
            Alert.alert(
              'Notifications Disabled',
              'To enable notifications, please grant permission in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return;
          }
        }

        set({ getNotifications: !currentState });
      },
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;