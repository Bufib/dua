// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Resource } from 'i18next';

// Types for our translations
interface DayNamesType {
  short: string[];
  full: string[];
}

interface TranslationType {
  // Core app translations
  welcome: string;
  selectLanguage: string;
  german: string;
  arabic: string;
  english: string;
  continue: string;
  settings: string;
  language: string;
  theme: string;
  about: string;
  home: string;
  prayers: string;
  homeSubtitle: string;
  
  // Prayer categories
  dua: string;
  ziyarat: string;
  salat: string;
  munajat: string;
  tasbih: string;
  
  // Home screen - Today's prayer
  todaysPrayer: string;
  readMore: string;
  categories: string;
  
  // Weekly calendar
  weeklyPrayers: string;
  addPrayer: string;
  addForDay: string;
  enterPrayer: string;
  add: string;
  cancel: string;
  noPrayersForDay: string;
  
  // Delete confirmation
  confirmDelete: string;
  deleteQuestion: string;
  delete: string;
  
  // Days of week
  days: DayNamesType;
}

// Translations resources
const resources: Resource = {
  de: {
    translation: {
      // Core app translations
      welcome: 'Willkommen zur Gebets-App',
      selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
      german: 'Deutsch',
      arabic: 'Arabisch',
      english: 'Englisch',
      continue: 'Fortfahren',
      settings: 'Einstellungen',
      language: 'Sprache',
      theme: 'Thema',
      about: 'Über',
      home: 'Start',
      prayers: 'Gebete',
      homeSubtitle: 'Finden Sie Frieden und Verbindung durch Gebet',
      
      // Prayer categories
      dua: "Dua",
      ziyarat: "Ziyarat",
      salat: "Salat",
      munajat: "Munajat",
      tasbih: "tasbih",
      
      // Home screen - Today's prayer
      todaysPrayer: "Heutiges Gebet",
      readMore: "Vollständig lesen",
      categories: "Kategorien",
      
      // Weekly calendar
      weeklyPrayers: "Gebetsplan für die Woche",
      addPrayer: "Gebet hinzufügen",
      addForDay: "Gebet hinzufügen für",
      enterPrayer: "Geben Sie das Gebet ein...",
      add: "Hinzufügen",
      cancel: "Abbrechen",
      noPrayersForDay: "Keine Gebete für diesen Tag",
      
      // Delete confirmation
      confirmDelete: "Löschen bestätigen",
      deleteQuestion: "Möchtest du dieses Gebet wirklich löschen?",
      delete: "Löschen",
      
      // Days of week
      days: {
        short: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        full: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
      }
    }
  },
  ar: {
    translation: {
      // Core app translations
      welcome: 'مرحبًا بك في تطبيق الصلاة',
      selectLanguage: 'اختر لغتك المفضلة',
      german: 'ألمانية',
      arabic: 'عربية',
      english: 'إنجليزية',
      continue: 'استمر',
      settings: 'إعدادات',
      language: 'لغة',
      theme: 'سمة',
      about: 'حول',
      home: 'الرئيسية',
      prayers: 'الصلوات',
      homeSubtitle: 'ابحث عن السلام والتواصل من خلال الصلاة',
      
      // Prayer categories
      dua: "دعاء",
      ziyarat: "زيارة",
      salat: "صلاة",
      munajat: "مناجاة",
      tasbih: "تسبيح",
      
      // Home screen - Today's prayer
      todaysPrayer: "صلاة اليوم",
      readMore: "قراءة المزيد",
      categories: "الفئات",
      
      // Weekly calendar
      weeklyPrayers: "جدول الصلاة الأسبوعي",
      addPrayer: "إضافة صلاة",
      addForDay: "إضافة صلاة ليوم",
      enterPrayer: "أدخل الصلاة...",
      add: "إضافة",
      cancel: "إلغاء",
      noPrayersForDay: "لا توجد صلوات لهذا اليوم",
      
      // Delete confirmation
      confirmDelete: "تأكيد الحذف",
      deleteQuestion: "هل أنت متأكد أنك تريد حذف هذه الصلاة؟",
      delete: "حذف",
      
      // Days of week
      days: {
        short: ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'],
        full: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
      }
    }
  },
  en: {
    translation: {
      // Core app translations
      welcome: 'Welcome to Prayer App',
      selectLanguage: 'Select your preferred language',
      german: 'German',
      arabic: 'Arabic',
      english: 'English',
      continue: 'Continue',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      about: 'About',
      home: 'Home',
      prayers: 'Prayers',
      homeSubtitle: 'Find peace and connection through prayer',
      
      // Prayer categories
      dua: "Dua",
      ziyarat: "Ziyarat",
      salat: "Salat",
      munajat: "Munajat",
      tasbih: "tasbih",
      
      // Home screen - Today's prayer
      todaysPrayer: "Today's Prayer",
      readMore: "Read more",
      categories: "Categories",
      
      // Weekly calendar
      weeklyPrayers: "Weekly Prayer Schedule",
      addPrayer: "Add Prayer",
      addForDay: "Add prayer for",
      enterPrayer: "Enter prayer...",
      add: "Add",
      cancel: "Cancel",
      noPrayersForDay: "No prayers for this day",
      
      // Delete confirmation
      confirmDelete: "Confirm Deletion",
      deleteQuestion: "Are you sure you want to delete this prayer?",
      delete: "Delete",
      
      // Days of week
      days: {
        short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        full: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
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