import * as React from "react";
import QuestionLinks from "@/components/QuestionLinks";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
export default function index() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  return (
    <TouchableWithoutFeedback
      style={{ flex: 1 }}
      onPress={() => Keyboard.dismiss()}
    >
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
    </TouchableWithoutFeedback>
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
