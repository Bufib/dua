import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { CategoryType, PrayerWithCategory } from "@/utils/types";
// Note: Instead of getAllPrayersForCategory, import the new function that uses the join table:
import {
  getChildCategories,
  getPrayersForCategory, // <-- New function: queries via prayer_categories join table
  getCategoryByTitle,
} from "@/utils/initializeDatabase";
import { CoustomTheme } from "@/utils/coustomTheme";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import * as Haptics from "expo-haptics";

// Icons for different categories
const categoryIcons: { [key: string]: string } = {
  dua: "heart-outline",
  ziyarat: "compass-outline",
  salat: "people-outline",
  munajat: "book-outline",
  tasibeh: "star-outline",
  default: "leaf-outline", // Default fallback
};

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const colorScheme = useColorScheme();
  const themeStyles = CoustomTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "AR";

  const [childCategories, setChildCategories] = useState<CategoryType[]>([]);
  const [allPrayers, setAllPrayers] = useState<PrayerWithCategory[]>([]);
  const [filteredPrayers, setFilteredPrayers] = useState<PrayerWithCategory[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(
    null
  );
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<CategoryType | null>(null);

  // Helper function to get icon for category
  const getCategoryIcon = (name: string): string => {
    const lowercaseName = name.toLowerCase();
    for (const key in categoryIcons) {
      if (lowercaseName.includes(key)) {
        return categoryIcons[key];
      }
    }
    return categoryIcons.default;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setSelectedSubcategory(null);

        // Fetch category by title (e.g., "Ziyarat")
        const categoryData = await getCategoryByTitle(category);
        console.log("Category found:", categoryData);

        if (!categoryData) {
          console.error("Category not found");
          return;
        }
        setCurrentCategory(categoryData);

        // Fetch subcategories using the parent category ID
        const categoryRows = await getChildCategories(categoryData.id);
        console.log(categoryRows);
        setChildCategories(categoryRows);

        // IMPORTANT: Fetch prayers via the new function that uses the join table.
        // Use the main category's id to get both prayers from the main and extra associations.
        const prayerRows = await getPrayersForCategory(
          categoryData.id,
          language.toUpperCase()
        );
        setAllPrayers(prayerRows);
        setFilteredPrayers(prayerRows); // Initially show all prayers

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, language]);

  // Function to handle subcategory selection and filter prayers
  const handleSubcategoryPress = async (cat: CategoryType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle selection if already selected
    if (selectedSubcategory && selectedSubcategory.id === cat.id) {
      setSelectedSubcategory(null);
      setFilteredPrayers(allPrayers);
      return;
    }

    setSelectedSubcategory(cat);

    try {
      // IMPORTANT: Fetch prayers for this subcategory using the new join-based function.
      // Pass the subcategory's id.
      const subcategoryPrayers = await getPrayersForCategory(
        cat.id,
        language.toUpperCase()
      );
      setFilteredPrayers(subcategoryPrayers);
    } catch (error) {
      console.error("Error fetching subcategory prayers:", error);
      // Fallback filtering logic if needed
      const filtered = allPrayers.filter(
        (prayer) =>
          prayer.category_id === cat.id || prayer.category_title === cat.title
      );
      setFilteredPrayers(filtered.length > 0 ? filtered : allPrayers);
    }
  };

  const handlePrayerPress = (prayer: PrayerWithCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/[prayer]",
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
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: fadeAnim }}
      >
        {/* Simple Clean Header */}
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: colorScheme === "dark" ? "#444" : "#e8edf4" },
            ]}
          >
            <Ionicons
              name={getCategoryIcon(category)}
              size={24}
              color={colorScheme === "dark" ? "#90cdf4" : "#3b82f6"}
            />
          </View>
          <Text
            style={[
              styles.header,
              { color: colorScheme === "dark" ? "#fff" : "#1e293b" },
              isRTL && { textAlign: "right" },
            ]}
          >
            {category}
          </Text>
        </View>

        {/* Subcategories Section - Simple chips */}
        {childCategories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View
              style={[
                styles.sectionHeaderRow,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colorScheme === "dark" ? "#e2e8f0" : "#334155" },
                  isRTL && { textAlign: "right" },
                ]}
              >
                {t("categories")}
              </Text>
              {selectedSubcategory && (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedSubcategory(null);
                    setFilteredPrayers(allPrayers);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={styles.showAllButton}
                >
                  <Text
                    style={{
                      color: colorScheme === "dark" ? "#90cdf4" : "#3b82f6",
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {language === "AR"
                      ? "عرض الكل"
                      : language === "DE"
                      ? "Alle anzeigen"
                      : "Show All"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipContainer}
            >
              {childCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#2d3748" : "#f1f5f9",
                    },
                    selectedSubcategory?.id === cat.id && {
                      backgroundColor:
                        colorScheme === "dark" ? "#3b82f6" : "#dbeafe",
                      borderWidth: 1,
                      borderColor:
                        colorScheme === "dark" ? "#90cdf4" : "#3b82f6",
                    },
                  ]}
                  onPress={() => handleSubcategoryPress(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedSubcategory?.id === cat.id
                        ? {
                            color: colorScheme === "dark" ? "#fff" : "#3b82f6",
                            fontWeight: "600",
                          }
                        : {
                            color:
                              colorScheme === "dark" ? "#e2e8f0" : "#334155",
                          },
                    ]}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Prayers Section */}
        <View style={styles.sectionContainer}>
          <View
            style={[
              styles.sectionHeaderRow,
              isRTL && { flexDirection: "row-reverse" },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: colorScheme === "dark" ? "#e2e8f0" : "#334155" },
                isRTL && { textAlign: "right" },
              ]}
            >
              {t("prayers")}
              {selectedSubcategory && ` • ${selectedSubcategory.title}`}
            </Text>
            <Text
              style={{
                color: colorScheme === "dark" ? "#94a3b8" : "#94a3b8",
                fontSize: 14,
              }}
            >
              {filteredPrayers.length}
            </Text>
          </View>

          {filteredPrayers.length > 0 ? (
            <View style={styles.prayerList}>
              {filteredPrayers.map((prayer) => (
                <TouchableOpacity
                  key={prayer.id}
                  style={[
                    styles.prayerCard,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#1e293b" : "#ffffff",
                    },
                  ]}
                  onPress={() => handlePrayerPress(prayer)}
                  activeOpacity={0.8}
                >
                  <View style={styles.prayerHeader}>
                    <View style={styles.prayerTitleContainer}>
                      <Text
                        style={[
                          styles.prayerTitle,
                          {
                            color:
                              colorScheme === "dark" ? "#f8fafc" : "#1e293b",
                          },
                          isRTL && { textAlign: "right" },
                        ]}
                        numberOfLines={1}
                      >
                        {prayer.name}
                      </Text>
                    </View>
                  </View>
                  {prayer.prayer_text && (
                    <Text
                      style={[
                        styles.prayerText,
                        {
                          color: colorScheme === "dark" ? "#cbd5e0" : "#64748b",
                        },
                        isRTL && { textAlign: "right" },
                      ]}
                      numberOfLines={3}
                    >
                      {prayer.prayer_text.replace(/<[^>]*>/g, "").trim()}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.prayerFooter,
                      isRTL ? { flexDirection: "row-reverse" } : {},
                    ]}
                  >
                    <Text
                      style={[
                        styles.readMore,
                        {
                          color: colorScheme === "dark" ? "#90cdf4" : "#3b82f6",
                        },
                      ]}
                    >
                      {t("readMore")}
                    </Text>
                    <Ionicons
                      name={isRTL ? "chevron-back" : "chevron-forward"}
                      size={16}
                      color={colorScheme === "dark" ? "#90cdf4" : "#3b82f6"}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={36}
                color={colorScheme === "dark" ? "#64748b" : "#94a3b8"}
                style={styles.emptyStateIcon}
              />
              <Text
                style={[
                  styles.emptyStateText,
                  { color: colorScheme === "dark" ? "#94a3b8" : "#64748b" },
                  isRTL && { textAlign: "right" },
                ]}
              >
                {language === "ar"
                  ? "لا توجد صلوات في هذه الفئة"
                  : language === "de"
                  ? "Keine Gebete in dieser Kategorie"
                  : "No prayers in this category"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedSubcategory(null);
                  setFilteredPrayers(allPrayers);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.resetButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2d3748" : "#f1f5f9",
                  },
                ]}
              >
                <Text
                  style={{
                    color: colorScheme === "dark" ? "#90cdf4" : "#3b82f6",
                    fontWeight: "500",
                  }}
                >
                  {language === "ar"
                    ? "عرض كل الصلوات"
                    : language === "de"
                    ? "Alle Gebete anzeigen"
                    : "Show all prayers"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Clean Header styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
  },
  // Section styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  showAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  // Simple chip styles for subcategories
  chipContainer: {
    flexDirection: "row",
    paddingBottom: 8,
    paddingTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    marginRight: 10,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Clean prayer card styles
  prayerList: {
    gap: 16,
  },
  prayerCard: {
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  prayerFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMore: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  // Empty state
  emptyState: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  resetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 50,
  },
});
