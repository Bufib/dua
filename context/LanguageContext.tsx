// src/context/LanguageContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/utils/i18n";

// Constants
const LANGUAGE_KEY = "@prayer_app_language";
const FIRST_LAUNCH_KEY = "@prayer_app_first_launch";

// Define types for the context value
interface LanguageContextType {
  language: string;
  changeLanguage: (newLanguage: string) => Promise<void>;
  isFirstLaunch: boolean;
  completeFirstLaunch: () => Promise<void>;
  isLoading: boolean;
}

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Props interface for the provider component
interface LanguageProviderProps {
  children: ReactNode;
}

// Fix the function component declaration
export const LanguageProvider = ({
  children,
}: LanguageProviderProps): JSX.Element => {
  const [language, setLanguage] = useState<string>("EN"); // Default to English
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if it's the first launch and get saved language
  useEffect(() => {
    const checkFirstLaunch = async (): Promise<void> => {
      try {
        setIsLoading(true);
        // Check if it's the first launch
        const firstLaunchValue = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);

        if (firstLaunchValue === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);

          // Get the saved language preference
          const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
          if (savedLanguage) {
            setLanguage(savedLanguage.toUpperCase());
            i18n.changeLanguage(savedLanguage); // Update i18n language
          }
        }
      } catch (error) {
        console.error("Error checking first launch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Function to change language
  const changeLanguage = async (newLanguage: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, newLanguage);
      setLanguage(newLanguage.toUpperCase());
      i18n.changeLanguage(newLanguage); // Update i18n language
    } catch (error) {
      console.error("Error setting language:", error);
    }
  };

  // Mark as not first launch
  const completeFirstLaunch = async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(FIRST_LAUNCH_KEY, "false");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error marking first launch as complete:", error);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        isFirstLaunch,
        completeFirstLaunch,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
