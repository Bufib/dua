import { create } from "zustand";

type NotificationState = {
  getNotifications: boolean;
  toggleGetNotifications: () => void;
};

const useNotificationStore = create<NotificationState>((set) => ({
  getNotifications: false,
  toggleGetNotifications: () =>
    set((state) => ({ getNotifications: !state.getNotifications })),
}));

export default useNotificationStore;
