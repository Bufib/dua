import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { ThemedView } from "./ThemedView";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";
import { useLanguage } from "@/context/LanguageContext";
type Name = {
  arabic: string;
  transliteration: string;
  german: string;
  english: string;
};
const NameCard = ({ name }: { name: Name }) => {
  const colorScheme = useColorScheme() || "light";
  const { language } = useLanguage();
  return (
    <ThemedView
      style={[styles.card, { backgroundColor: Colors[colorScheme].contrast }]}
    >
      <ThemedText style={styles.arabicName} type="title">
        {name.arabic}
      </ThemedText>
      <ThemedText style={styles.transliteration} type="subtitle">
        {name.transliteration}
      </ThemedText>
      {language === "DE" ? (
        <ThemedText style={styles.meaning} type="default">
          {name.german}
        </ThemedText>
      ) : language === "EN" ? (
        <ThemedText style={styles.meaning} type="default">
          {name.english}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 20,
    margin: 7,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  arabicName: {
    lineHeight: 40,
  },
  transliteration: {
    fontStyle: "italic",
    fontWeight: 500
  },
  meaning: {
    textAlign: "center",
  },
});

export default NameCard;
