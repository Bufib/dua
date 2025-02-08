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

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

type NotificationState = {
  getNotifications: boolean;
  toggleGetNotifications: () => Promise<void>;
};

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      getNotifications: true,
      toggleGetNotifications: async () => {
        const currentState = get().getNotifications;
        if (!currentState) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== "granted") {
            alert("Permission denied for notifications");
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