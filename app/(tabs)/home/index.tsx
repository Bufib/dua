import * as React from "react";
import QuestionLinks from "@/components/QuestionLinks";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
export default function index() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <ThemedText type="title" style={styles.greeting}>
        {t("welcome")}
      </ThemedText>
      <QuestionLinks />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    color: Colors.universal.primary,
    padding: 20,
  },
});
