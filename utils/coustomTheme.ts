import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";

export const lightTheme = {
  defaultBackgorundColor: {
    backgroundColor: Colors.light.background,
  },
  contrast: {
    backgroundColor: Colors.light.contrast,
  },

  text: {
    color: Colors.light.text,
  },
  searchResultCategory: {
    color: Colors.light.searchResultCategory,
  },

  activityIndicator: {
    color: Colors.light.activityIndicator,
  },
  newsMenuFixieren: {
    color: Colors.light.newsMenuFixieren,
  },
  newsMenuBearbeiten: {
    color: Colors.light.newsMenuBearbeiten,
  },
  newsMenuLoeschen: {
    color: Colors.light.newsMenuLoeschen,
  },
  borderColor: {
    borderColor: Colors.light.borderColor,
  },
};

export const darkTheme = {
  defaultBackgorundColor: {
    backgroundColor: Colors.dark.background,
    borderColor: Colors.dark.borderColor,
  },
  contrast: {
    backgroundColor: Colors.dark.contrast,
  },
  text: {
    color: Colors.dark.text,
  },
  searchResultCategory: {
    color: Colors.dark.searchResultCategory,
  },

  activityIndicator: {
    color: Colors.dark.activityIndicator,
  },
  newsMenuFixieren: {
    color: Colors.dark.newsMenuFixieren,
  },
  newsMenuBearbeiten: {
    color: Colors.dark.newsMenuBearbeiten,
  },
  newsMenuLoeschen: {
    color: Colors.dark.newsMenuLoeschen,
  },
  borderColor: {
    borderColor: Colors.dark.borderColor,
  },
};

export const coustomTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === "light" ? lightTheme : darkTheme;
};
