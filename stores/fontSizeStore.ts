import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Storage } from "expo-sqlite/kv-store";

interface FontSizeState {
  fontSize: number;
  lineHeight: number;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  loadSettings: () => Promise<void>;
}

const FONT_SIZE_KEY = "fontSize";
const LINE_HEIGHT_KEY = "lineHeight";

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      fontSize: 18, // Default font size
      lineHeight: 40, // Default line height

      // Setter for fontSize
      setFontSize: (size: number) => {
        set({ fontSize: size });
      },

      // Setter for lineHeight
      setLineHeight: (height: number) => {
        set({ lineHeight: height });
      },

      // Load settings from KV Store (optional custom logic)
      loadSettings: async () => {
        const storedFontSize = await Storage.getItem(FONT_SIZE_KEY);
        const storedLineHeight = await Storage.getItem(LINE_HEIGHT_KEY);

        set({
          fontSize: storedFontSize ? parseInt(storedFontSize, 10) : 20,
          lineHeight: storedLineHeight ? parseInt(storedLineHeight, 10) : 40,
        });
      },
    }),
    {
      name: "font-settings", // Unique key for the persisted state
      storage: createJSONStorage(() => Storage),
      partialize: (state) => ({
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
      }), // Only persist fontSize and lineHeight
    }
  )
);
