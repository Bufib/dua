import React from "react";
import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "./ThemedText"; // Adjust path
import { CategoryItem } from "@/utils/types"; // Adjust path
import { CoustomTheme } from "@/utils/coustomTheme"; // Adjust path
import type { TFunction } from "i18next";
import { categories } from "@/utils/categories";

type CategoriesRowProps = {
  onPressCategory: (category: CategoryItem) => void;
  t: TFunction;
  themeStyles: ReturnType<typeof CoustomTheme>;
}

export const CategoriesRow: React.FC<CategoriesRowProps> = ({
  onPressCategory,
  t,
  themeStyles,
}) => {
  return (
    <View>
      <ThemedText style={[styles.sectionTitle]}>{t("categories")}</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => onPressCategory(category)} // Call prop handler
            style={({ pressed }) => [
              styles.categoryButton,
              {
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
              themeStyles.contrast,
            ]}
          >
            <Image
              source={category.image}
              style={styles.categoryImage}
              contentFit="contain"
            />
            <ThemedText style={styles.categoryTitle}>
              {category.title}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// Add relevant styles from HomeScreen
const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  categoriesContainer: {
    paddingBottom: 8,
    gap: 12,
  },
  categoryButton: {
    borderRadius: 14,
    padding: 12,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 15,
  },
});
