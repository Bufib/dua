import { TextStyle, TextProps } from "react-native";

export type PayPalType = {
  id: number;
  created_at: string;
  paypal_link: string; // updated to match DB column name
};

export type VersionType = {
  id: number;
  created_at: string;
  version: string;
};

export type Sizes = {
  elementSize: number;
  fontSize: number;
  iconSize: number;
  imageSize: number;
  gap: number;
};

/* --- Database-related types --- */

// Matches the "categories" table
export type CategoryType = {
  id: number;
  title: string;
  parent_id?: number[] | null; // ARRAY type from the DB
};

// Represents the "daily_or_monthly" table
export type DailyOrMonthly = {
  id: number;
  monthly: boolean;
};

// Matches the "daily_prayers" table
export type DailyPrayer = {
  id: number;
  prayer_id: number;
};

// Matches the "languages" table
export type LanguageType = {
  id: number;
  created_at: string;
  language_code: string;
};

// Matches the "prayer_translations" table
export type PrayerTranslation = {
  id: number;
  prayer_id: number;
  language_code: string;
  translated_introduction?: string | null;
  translated_text?: string | null;
  translated_notes?: string | null;
  source?: string | null;
  created_at?: string;
  updated_at?: string;
};

// Matches the "prayers" table
export type PrayerType = {
  id: number;
  name?: string | null;
  arabic_title?: string | null;
  category_id: number;
  created_at?: string;
  updated_at?: string;
  translated_languages: string[];
  arabic_text?: string | null;
  arabic_notes?: string | null;
  transliteration_text?: string | null;
  source?: string | null;
  arabic_introduction?: string | null;
};

// A prayer along with its translations
export type PrayerWithTranslations = PrayerType & {
  translations: PrayerTranslation[];
};

// Other types that build on PrayerType (often from join queries)
export type PrayerWithCategory = PrayerType &
  PrayerTranslation & {
    category_title: string;
    prayer_text: string;
  };

export type FavoritePrayer = PrayerType & {
  category_title: string;
  introduction: string | null;
  prayer_text: string | null;
};

// The remaining types can be kept as-is if they’re not directly tied to DB schema

export type TodoItem = {
  id: number;
  text: string;
  completed: boolean;
};

export type WeeklyTodos = {
  [key: string]: TodoItem[];
};

export type TodoToDelete = {
  dayIndex: number | null;
  todoId: number | null;
};

export type CategoryItem = {
  id: number;
  title: string;
  image: any;
  value: string;
};

export type PrayerData = {
  title: string;
  text: string;
  category: string;
};

export type PrayersByLanguage = {
  [key: string]: PrayerData;
};
