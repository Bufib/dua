import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { CategoryType, PrayerWithCategory } from "@/utils/types";
import {
  getChildCategories,
  getAllPrayersForCategory,
  getCategoryByTitle,
} from "@/utils/initializeDatabase";
import { CoustomTheme } from "@/utils/coustomTheme";
import { useColorScheme } from "react-native";

export default function CategoryScreen() {
  const { categoryName } = useLocalSearchParams<{
    categoryName: string;
  }>();
  const colorScheme = useColorScheme();
  const themeStyles = CoustomTheme();

  const [childCategories, setChildCategories] = useState<CategoryType[]>([]);
  const [prayers, setPrayers] = useState<PrayerWithCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("EN"); // Default to English

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch category by title
        const category = await getCategoryByTitle(categoryName);
        console.log("Category found:", category);
        
        if (!category) {
          console.error("Category not found");
          return;
        }

        // Fetch subcategories using the parent category ID
        const categoryRows = await getChildCategories(category.id);
        setChildCategories(categoryRows);

        // Fetch prayers for this category and all subcategories
        const prayerRows = await getAllPrayersForCategory(
          categoryName,
          language
        );
        setPrayers(prayerRows);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryName, language]);

  const handleCategoryPress = (category: CategoryType) => {
    router.push({
      pathname: "/(tabs)/home/(category)/[category]",
      params: { categoryName: category.title }, // Pass the category name
    });
  };

  const handlePrayerPress = (prayer: PrayerWithCategory) => {
    router.push({
      pathname: "/(tabs)/home/(prayer)/[prayer]",
      params: { prayerId: prayer.id, prayerTitle: prayer.name },
    });
  };

  if (loading) {
    return (
      <View
        style={[styles.loaderContainer, themeStyles.defaultBackgorundColor]}
      >
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "#fff" : "#666"}
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.header]}>{categoryName}</Text>

        {/* Subcategories Section */}
        {childCategories.length > 0 && (
          <>
            <Text style={[styles.sectionTitle]}>Kategorien</Text>
            <View style={styles.grid}>
              {childCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.card, themeStyles.contrast]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={[styles.cardTitle]}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Prayers Section */}
        {prayers.length > 0 && (
          <>
            <View style={styles.prayerList}>
              {prayers.map((prayer) => (
                <TouchableOpacity
                  key={prayer.id}
                  style={[styles.prayerCard, themeStyles.contrast]}
                  onPress={() => handlePrayerPress(prayer)}
                >
                  <Text style={[styles.prayerTitle]}>{prayer.name}</Text>
                  {prayer.prayer_text && (
                    <Text
                      style={[styles.prayerText, themeStyles.secondaryText]}
                      numberOfLines={2}
                    >
                      {prayer.prayer_text.replace(/<[^>]*>/g, "").trim()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Empty State */}
        {childCategories.length === 0 && prayers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, themeStyles.secondaryText]}>
              Keine Inhalte verfügbar
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  prayerList: {
    marginTop: 8,
  },
  prayerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
  },
});