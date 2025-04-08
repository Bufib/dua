// src/components/RandomPrayerCard.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { DailyPrayer, PrayerWithTranslations } from "@/utils/types";
import { CoustomTheme } from "@/utils/coustomTheme";
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next";
import { router } from "expo-router";

interface RandomPrayerCardProps {
  // The prayer object could be either the basic DailyPrayer or PrayerWithTranslations.
  prayer: DailyPrayer | PrayerWithTranslations | null;
  isLoading: boolean;
  language: string;
  onPressReadMore: (prayer: DailyPrayer) => void;
  t: TFunction;
  themeStyles: ReturnType<typeof CoustomTheme>;
  colorScheme: ColorSchemeName;
  isRTL: boolean;
  flexDirection: object;
}

export const RandomPrayerCard: React.FC<RandomPrayerCardProps> = ({
  prayer,
  isLoading,
  language,
  onPressReadMore,
  t,
  themeStyles,
  colorScheme,
  isRTL,
  flexDirection,
}) => {
  if (isLoading) {
    return (
      <View style={[styles.randomPrayerCard, themeStyles.contrast, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={colorScheme === "dark" ? "#fff" : "#000"} />
      </View>
    );
  }

  if (!prayer) {
    return (
      <View style={[styles.randomPrayerCard, themeStyles.contrast]}>
        <ThemedText>{t("noPrayerAvailable")}</ThemedText>
      </View>
    );
  }

  const handleReadMore = () => {
   router.push({
        pathname: "/[prayer]",
        params: { prayerID: prayer.id.toString() },
      });
  };

  // Determine which text to display:
  // If language is "AR", use prayer.arabic_text; otherwise, check if translations exist.
  let displayText = "";
  if (language.toUpperCase() === "AR") {
    displayText = prayer.arabic_text;
  } else if ("translations" in prayer && prayer.translations.length > 0) {
    // For non-Arabic, show the first matching translation's text.
    displayText = prayer.translations[0].translated_text;
  } else {
    // Fallback if translations aren't available.
    displayText = prayer.arabic_text;
  }

  return (
    <View style={[styles.randomPrayerCard, themeStyles.contrast]}>
      <View style={[styles.prayerHeader, flexDirection]}>
        <ThemedText style={styles.todayTitle}>{t("randomPrayer")}</ThemedText>
        <View style={styles.prayerCategory}>
          <ThemedText style={styles.categoryText}>
            {t(prayer.category_title)}
          </ThemedText>
        </View>
      </View>
      {/* Use prayer.name or prayer.title as appropriate */}
      <ThemedText style={styles.prayerTitle}>{prayer.name}</ThemedText>
      <ThemedText style={styles.prayerText} numberOfLines={1}>
        {displayText}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.readMoreButton,
          { backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0" },
          isRTL ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
        onPress={handleReadMore}
      >
        <ThemedText style={styles.readMoreText}>{t("readMore")}</ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  randomPrayerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  prayerCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  readMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
});
