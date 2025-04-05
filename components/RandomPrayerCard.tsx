// src/components/RandomPrayerCard.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./ThemedText"; // Adjust path
import { DailyPrayer } from "@/utils/types"; // Adjust path
import { CoustomTheme } from "@/utils/coustomTheme"; // Adjust path
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next"; // Import TFunction type

interface RandomPrayerCardProps {
  prayer: DailyPrayer | null;
  isLoading: boolean;
  language: string;
  onPressReadMore: (prayer: DailyPrayer) => void;
  t: TFunction; // Use TFunction type for t prop
  themeStyles: ReturnType<typeof CoustomTheme>;
  colorScheme: ColorSchemeName;
  isRTL: boolean;
  flexDirection: object; // Pass calculated style object
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
    // Optional: Show a loading indicator specifically for this card
    return (
      <View
        style={[
          styles.randomPrayerCard,
          themeStyles.contrast,
          styles.loadingContainer,
        ]}
      >
        <ActivityIndicator
          size="small"
          color={colorScheme === "dark" ? "#fff" : "#000"}
        />
      </View>
    );
  }

  if (!prayer) {
    // Optional: Show a message if no prayer is available
    return (
      <View style={[styles.randomPrayerCard, themeStyles.contrast]}>
        <ThemedText>{t("noPrayerAvailable")}</ThemedText>
      </View>
    );
  }

  const handleReadMore = () => {
    onPressReadMore(prayer); // Pass the prayer object back
  };

  return (
    <View style={[styles.randomPrayerCard, themeStyles.contrast]}>
      <View style={[styles.prayerHeader, flexDirection]}>
        <ThemedText style={styles.todayTitle}>{t("randomPrayer")}</ThemedText>
        <View style={styles.prayerCategory}>
          <ThemedText style={styles.categoryText}>
            {t(`${prayer.category_title}`)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.prayerTitle]}>{prayer.title}</ThemedText>
      <ThemedText style={[styles.prayerText]} numberOfLines={1}>
        {language === "AR"
          ? prayer.arabic_text
          : language === "EN"
          ? prayer.english_text
          : prayer.german_text}
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

// Add relevant styles from HomeScreen or create new ones
const styles = StyleSheet.create({
  // Today's Prayer Section
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
    height: 150, // Example height
    justifyContent: "center",
    alignItems: "center",
  },
});
