import { TextStyle, TextProps } from "react-native";
import { string } from "zod";

export type QuestionType = {
  id: number;
  title: string;
  question: string;
  answer: string;
  answer_sistani: string;
  answer_khamenei: string;
  category_name: string;
  subcategory_name: string;
  created_at: string;
};

export type PayPalType = {
  id: number;
  created_at: string;
  paypay_Link: string;
};

export type VersionType = {
  id: number;
  created_at: string;
  version: string;
};

export type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type CaptchaEvent = {
  nativeEvent: {
    data: string;
  };
};

export type SearchResults = {
  id: number;
  category_name: string;
  subcategory_name: string;
  question: string;
  title: string;
};

export type BlinkingTextProps = {
  text?: string;
  style?: TextStyle;
  lightColor?: string;
  darkColor?: string;
  blinkDuration?: number;
  startDelay?: number;
  useTheming?: boolean;
  children?: React.ReactNode;
  textProps?: Omit<TextProps, "style">;
};

export type QuestionFromUser = {
  id: string;
  user_id: string;
  question: string;
  answer?: string;
  status: "Beantwortet" | "Beantwortung steht noch aus" | "Abgelehnt";
  marja: string;
  title: string;
  gender: string;
  age: string;
  internal_url: string[];
  external_url: string[];
  created_at: string;
  approval_status: string;
};

export type Sizes = {
  elementSize: number;
  fontSize: number;
  iconSize: number;
  imageSize: number;
  gap: number;
};

export type CategoryType = {
  id: number;
  title: string;
  parent_id?: string | null;
  category: string;
};

export type PrayerType = {
  id: number;
  name: string;
  arabic_title?: string | null;
  category_id: number;
  created_at: string;
  updated_at: string;
  arabic_text?: string; // als optional
  arabic_notes?: string | null;
  transliteration_text?: string; // als optional
  transliteration_notes?: string | null;
  source?: string | null;
  translated_languages: string[];
  arabic_introduction?: string;
};

export type PrayerTranslation = {
  id: number;
  prayer_id: number;
  language_code: string;
  introduction?: string | null;
  main_body: string | null;
  notes?: string | null;
  source?: string | null;
  created_at: string;
  updated_at: string;
};

export type PrayerWithCategory = {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  arabic_title?: string;
  created_at: string;
  updated_at: string;
  translated_languages: string[];
  category_title: string;
  introduction?: string;
  prayer_text: string;
  notes?: string;
  source?: string;
};

export interface FavoritePrayer extends PrayerType {
  category_title: string;
  introduction: string | null;
  prayer_text: string | null;
}

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
export interface PrayerWithTranslations extends PrayerType {
  translations: PrayerTranslation[];
}

export type DailyPrayer = {
  id: number;
  title: string;
  created_at: string;
  arabic_text?: string;
  german_text?: string;
  english_text?: string;
  category_id: number;
  category_title?: string; // new property
};
