import { useState, useLayoutEffect } from "react";
import { View, Pressable, StyleSheet, FlatList, useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

// Type for the favorite prayer item
interface FavoritePrayer {
  id: number;
  name: string;
  arabic_title: string;
  category_title: string;
  introduction?: string;
  prayer_text?: string;
}

// Function to get database instance
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync("content-database.db");
};

// Function to fetch all favorite prayers - should be moved to initializeDatabase.ts
const getFavoritePrayers = async (language: string = "de"): Promise<FavoritePrayer[]> => {
  try {
    const db = await getDatabase();
    
    // Query to fetch favorite prayers with their details
    const query = `
      SELECT 
        p.id,
        p.name,
        p.arabic_title,
        c.title as category_title,
        pt.introduction,
        pt.main_body as prayer_text
      FROM favorites f
      INNER JOIN prayers p ON f.prayer_id = p.id
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN prayer_translations pt ON p.id = pt.prayer_id AND pt.language_code = ?
      ORDER BY f.added_at DESC;
    `;
    
    // Execute the query
    const rows = await db.getAllAsync<FavoritePrayer>(query, [language]);
    return rows;
  } catch (error) {
    console.error("Error fetching favorite prayers:", error);
    throw error;
  }
};

function RenderFavoritePrayers() {
  const [prayers, setPrayers] = useState<FavoritePrayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  
  // Access refresh trigger from store if available
  const { refreshTriggerFavorites } = useRefreshFavorites();

  useLayoutEffect(() => {
    const loadFavoritePrayers = async () => {
      try {
        setIsLoading(true);
        const language = await AsyncStorage.getItem('@prayer_app_language') || "de";
        const favoritePrayers = await getFavoritePrayers(language);

        if (favoritePrayers) {
          setPrayers(favoritePrayers);
          setError(null);
        } else {
          console.log("Can't load favorite prayers");
          setPrayers([]);
          setError(t("errorLoadingFavorites"));
        }
      } catch (error) {
        console.error("Error loading favorite prayers:", error);
        setPrayers([]);
        setError(t("errorLoadingFavorites"));
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoritePrayers();
  }, [refreshTriggerFavorites, t]);

  // Show error state
  if (error && !isLoading && prayers.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText>{error}</ThemedText>
      </View>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText>{t("loadingFavorites")}</ThemedText>
      </View>
    );
  }

  // Show empty state
  if ((prayers.length === 0 || !prayers) && !isLoading && !error) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>
          {t("noFavoritesYet")}
          {"\n"}
          {t("addFavoritesHint")}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <FlatList
        data={prayers}
        extraData={refreshTriggerFavorites}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors[colorScheme].background }}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(prayers)/prayer",
                params: {
                  prayerId: item.id.toString(),
                  prayerTitle: item.name,
                },
              })
            }
          >
            <ThemedView style={[styles.item, { backgroundColor: Colors[colorScheme].prayerIntroductionBackground }]}>
              <View style={styles.prayerContainer}>
                <ThemedText style={styles.titleText}>{item.name}</ThemedText>
                <ThemedText style={styles.arabicTitleText} numberOfLines={1}>
                  {item.arabic_title}
                </ThemedText>
                <View style={styles.categoryContainer}>
                  <Ionicons 
                    name="folder-outline" 
                    size={14} 
                    color={Colors[colorScheme].prayerSourceText} 
                  />
                  <ThemedText style={styles.categoryText}>{item.category_title}</ThemedText>
                </View>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={Colors.universal.favoriteIcon}
                  style={styles.favoriteIcon}
                />
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors[colorScheme].text}
                />
              </View>
            </ThemedView>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  flatListStyle: {
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prayerContainer: {
    flex: 1,
    marginRight: 10,
  },
  titleText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "600",
    marginBottom: 4,
  },
  arabicTitleText: {
    fontSize: 16,
    textAlign: "left",
    marginBottom: 6,
    writingDirection: "rtl",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 13,
    marginLeft: 4,
    opacity: 0.7,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteIcon: {
    marginRight: 12,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
  },
});

export default RenderFavoritePrayers;