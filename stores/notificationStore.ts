import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type NotificationState = {
  getNotifications: boolean;
  toggleGetNotifications: () => void;
};

const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      getNotifications: false,
      toggleGetNotifications: () =>
        set({ getNotifications: !get().getNotifications }),
    }),
    {
      name: "notification-storage", 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;
