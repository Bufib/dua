// export default RenderPrayer;

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useMemo } from "react";
import {
  getPrayerWithTranslations,
  PrayerTranslation,
  PrayerWithTranslations,
} from "@/utils/initializeDatabase";
import { useLayoutEffect, useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { useColorScheme } from "react-native";
import i18n from "@/utils/i18n";
import { Colors } from "@/constants/Colors";
import { ScrollView } from "react-native";
const RenderPrayer = () => {
  const { prayerId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [prayers, setPrayers] = useState<PrayerWithTranslations | null>(null);
  const { language } = useLanguage();
  const [selectTranslations, setSelectTranslations] = useState<
    Record<string, boolean>
  >({});
  const colorScheme = useColorScheme() || "light";
  const { t } = i18n;

  useLayoutEffect(() => {
    console.log("language " + language);
    const fetchPrayerData = async () => {
      try {
        setIsLoading(true);
        // prayerID [0] in case more than one id is returned
        const prayer = await getPrayerWithTranslations(
          parseInt(prayerId[0], 10)
        );
        // All the Prayer with all the translations for this specific ID
        setPrayers(prayer);
      } catch (error: any) {
        console.log("RenderPrayer fetchPrayerData " + error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrayerData();
  }, [prayerId]);

  // Initialize default selected translations so that the app language is selected by default.
  useEffect(() => {
    if (prayers) {
      const initialSelection: Record<string, boolean> = {};
      prayers.translated_languages.forEach((lang) => {
        // Normalize the translation language by taking the first two characters and uppercasing them.
        const normalizedLang = lang.slice(0, 2).toUpperCase();
        // Compare with the app language (assumed to be in uppercase, e.g. "EN")
        initialSelection[lang] = normalizedLang === language;
      });
      setSelectTranslations(initialSelection);
    }
  }, [prayers, language]);
  
  // Format the prayer
  const formattedPrayer = useMemo(() => {
    if (!prayers) return null;

    // Split Arabic and transliteration texts into arrays of lines.
    const arabicLines = prayers.arabic_text
      ? prayers.arabic_text.split("\n").filter((line) => line.trim() !== "")
      : [];
    const transliterationLines = prayers.transliteration_text
      ? prayers.transliteration_text
          .split("\n")
          .filter((line) => line.trim() !== "")
      : [];

    // Map translations with language names from `translated_languages`
    const translations = prayers.translations.map((translation, index) => ({
      language:
        prayers.translated_languages[index] || translation.language_code,
      lines: translation.main_body
        ? translation.main_body.split("\n").filter((line) => line.trim() !== "")
        : [],
    }));

    return { arabicLines, transliterationLines, translations };
  }, [prayers]);

  // Get the amount of lines
  const indices = useMemo(() => {
    if (!formattedPrayer) return [];
    const maxLines = Math.max(
      formattedPrayer.arabicLines.length,
      formattedPrayer.transliterationLines.length,
      formattedPrayer.translations.length
    );
    return Array.from({ length: maxLines }, (_, i) => i);
  }, [formattedPrayer]);
  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      contentContainerStyle={styles.scrollContent}
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedView style={styles.header}>
          <View style={styles.headerNameContainer}>
            <ThemedText style={styles.headerTitleText} type="subtitle">
              {prayers && prayers.name}
            </ThemedText>
            <ThemedText>-</ThemedText>
            <ThemedText style={styles.headerTitleText} type="subtitle">
              {prayers && prayers.arabic_title}
            </ThemedText>
          </View>
          <View
            style={[
              styles.headerIntroductionContainer,
              { backgroundColor: Colors[colorScheme].contrast },
            ]}
          >
            <ThemedText
              style={styles.headerIntroduction}
              type="defaultSemiBold"
            >
              {prayers
                ? prayers.translated_languages === null ||
                  !prayers.translated_languages.includes(language)
                  ? prayers.arabic_introduction
                  : prayers.translations.find(
                      (t) => t.language_code === language
                    )?.introduction || prayers.arabic_introduction
                : null}
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.languageContainer}>
        <ScrollView
          style={styles.languageButtonsScroll}
          contentContainerStyle={styles.languageButtonsScrollContent}
          horizontal
        >
          {prayers &&
            prayers.translated_languages.map((language) => (
              <TouchableOpacity
                key={language.toString()}
                style={styles.languageButton}
                onPress={() =>
                  setSelectTranslations((prev) => ({
                    ...prev,
                    [language]: !prev[language],
                  }))
                }
              >
                <Text>{language}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </ThemedView>
      {/* Body: Render each prayer line */}
      <ThemedView style={styles.bodyContainer}>
        {isLoading && <ActivityIndicator />}
        {formattedPrayer &&
          indices.map((i) => (
            <View key={i} style={styles.prayerContainer}>
              <Text style={[styles.prayerText, styles.prayerTextArabic]}>
                {formattedPrayer.arabicLines[i] || ""}
              </Text>
              <Text style={styles.prayerText}>
                {formattedPrayer.transliterationLines[i] || ""}
              </Text>
              {formattedPrayer.translations.map((translation, idx) =>
                selectTranslations[translation.language] ? (
                  <View key={idx} style={styles.translationContainer}>
                    <Text style={styles.translationLanguage}>
                      {translation.language}
                    </Text>
                    <Text style={styles.translationText}>
                      {translation.lines[i] || ""}
                    </Text>
                  </View>
                ) : null
              )}
            </View>
          ))}
      </ThemedView>
    </ScrollView>
  );
};

export default RenderPrayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: 20,
  },
  headerContainer: {
    flex: 1,
  },
  header: {
    flex: 1,
    margin: 10,
    gap: 10,
  },
  headerNameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  headerTitleText: {},
  headerIntroductionContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
  },
  headerIntroduction: {},
  bodyContainer: {
    flex: 1,
    gap: 10,
  },
  prayerContainer: {
    flex: 1,
    padding: 10,
    gap: 30,
  },
  prayerText: {
    fontSize: 28,
    color: Colors.universal.secondary,
  },
  prayerIndex: {
    alignSelf: "center",
  },
  prayerTextArabic: {
    textAlign: "right",
  },

  languageContainer: {
    flex: 1,
  },
  languageButtonsScroll: {},
  languageButtonsScrollContent: {
    marginLeft: 15,
    gap: 10,
  },
  languageButton: {
    padding: 10,
    backgroundColor: Colors.universal.secondary,
    borderRadius: 7,
  },
  footerContainer: {},
});
