// export default RenderPrayer;

import { StyleSheet, Text, View } from "react-native";
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
    const formatedPrayer = data.split(" ");
    return formatedPrayer;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerContainer}>
        <View
          style={[
            styles.header,
            { backgroundColor: Colors[colorScheme].contrast },
          ]}
        >
          <View style={styles.headerNameContainer}>
            <ThemedText style={styles.headerTitleText} type="subtitle">
              {prayers && prayers.name}
            </ThemedText>
            <ThemedText>-</ThemedText>
            <ThemedText style={styles.headerTitleText} type="subtitle">
              {prayers && prayers.arabic_title}
            </ThemedText>
          </View>
          <ThemedText style={styles.headerIntroduction} type="defaultSemiBold">
            {prayers
              ? prayers.translated_languages === null ||
                !prayers.translated_languages.includes(language)
                ? prayers.arabic_introduction
                : prayers.translations.find((t) => t.language_code === language)
                    ?.introduction || prayers.arabic_introduction
              : null}
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
};

export default RenderPrayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flex: 1 / 3,
  },
  header: {
    flex: 1,
    padding: 15,
    margin: 10,
    borderWidth: 1,
    borderRadius: 10,
    gap: 10,
  },
  headerNameContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  headerTitleText: {},
  headerIntroduction: {},
  bodyContainer: {},
  footerContainer: {},
});
