// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Resource } from 'i18next';

// Translations
const resources: Resource = {
  de: {
    translation: {
      welcome: 'Willkommen zur Gebets-App',
      selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
      german: 'Deutsch',
      arabic: 'Arabisch',
      continue: 'Fortfahren',
      settings: 'Einstellungen',
      language: 'Sprache',
      theme: 'Thema',
      about: 'Über',
      home: 'Start',
      prayers: 'Gebete',
      homeSubtitle: 'Finden Sie Frieden und Verbindung durch Gebet',
      // Add more translations here
    }
  },
  ar: {
    translation: {
      welcome: 'مرحبًا بك في تطبيق الصلاة',
      selectLanguage: 'اختر لغتك المفضلة',
      german: 'ألمانية',
      arabic: 'عربية',
      continue: 'استمر',
      settings: 'إعدادات',
      language: 'لغة',
      theme: 'سمة',
      about: 'حول',
      home: 'الرئيسية',
      prayers: 'الصلوات',
      homeSubtitle: 'ابحث عن السلام والتواصل من خلال الصلاة',
      // Add more translations here
    }
  },
  en: {
    translation: {
      welcome: 'Welcome to Prayer App',
      selectLanguage: 'Select your preferred language',
      german: 'German',
      arabic: 'Arabic',
      continue: 'Continue',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      about: 'About',
      home: 'Home',
      prayers: 'Prayers',
      homeSubtitle: 'Find peace and connection through prayer',
      // Add more translations here
    }
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'de', // Default language
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;