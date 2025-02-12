import { TextStyle, TextProps } from "react-native";

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

export type Paypal = {
  link: string;
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
  approval_status: string
};

export type Sizes = {
  elementSize: number;
  fontSize: number;
  iconSize: number;
  imageSize: number;
  gap: number;
}