// export default RenderPrayer;

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
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
        console.log(prayer);
      } catch (error: any) {
        console.log("RenderPrayer fetchPrayerData " + error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrayerData();
  }, [prayerId]);

  const formatePrayer = (data: string) => {
    const formatedPrayer = data.split("\n");
    return formatedPrayer;
  };

  const fusePrayer = () => {

  }
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
              >
                <Text>{language}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </ThemedView>
      <ThemedView style={styles.bodyContainer}>
        {prayers &&
          formatePrayer(prayers.arabic_text ?? "")
            .filter((prayer) => prayer.trim() !== "")
            .map((prayer, index) => (
              <View
                style={[
                  styles.prayerContainer,
                  { backgroundColor: Colors[colorScheme].contrast },
                ]}
              >
                <Text
                  style={[styles.prayerText, styles.prayerTextArabic]}
                  key={index}
                >
                  {prayer}
                </Text>
                <Text style={styles.prayerIndex}> {index + 1}</Text>
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
    gap: 30
  },
  prayerText: {
    fontSize: 28,
    color: Colors.universal.secondary,
  },
  prayerIndex: {
    alignSelf: "center"
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
