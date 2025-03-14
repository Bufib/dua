// Function to get database instance
const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return await SQLite.openDatabaseAsync("content-database.db");
};import { useState, useLayoutEffect } from "react";
import { 
  View, 
  Pressable, 
  StyleSheet, 
  FlatList, 
  useColorScheme,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator
} from "react-native";
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

// Get the window width for responsive sizing
const { width } = Dimensions.get('window');

// Function to fetch specific favorite prayers with given IDs
const getFavoritePrayersWithIds = async (prayerIds: number[], language: string = "EN"): Promise<FavoritePrayer[]> => {
  if (!prayerIds || prayerIds.length === 0) return [];
  
  try {
    const db = await getDatabase();
    
    // Create placeholders for the SQL IN clause
    const placeholders = prayerIds.map(() => '?').join(',');
    
    const query = `
      SELECT 
        p.id,
        p.name,
        p.arabic_title,
        c.title as category_title,
        pt.introduction,
        SUBSTR(COALESCE(pt.main_body, ''), 1, 150) as prayer_text,
        pt.language_code
      FROM prayers p
      INNER JOIN categories c ON p.category_id = c.id
      LEFT JOIN prayer_translations pt ON p.id = pt.prayer_id AND pt.language_code = ?
      WHERE p.id IN (${placeholders})
      ORDER BY p.id;
    `;
    
    // Prepare parameters with language first, then prayer IDs
    const params = [language, ...prayerIds];
    
    // Execute the query
    const rows = await db.getAllAsync<FavoritePrayer>(query, params);
    return rows;
  } catch (error) {
    console.error("Error fetching specific favorite prayers:", error);
    return [];
  }
};

// Function to fetch all favorite prayers
// Function to fetch all favorite prayers with improved translation handling
const getFavoritePrayers = async (language: string = "de"): Promise<FavoritePrayer[]> => {
  try {
    const db = await getDatabase();
    
    // Get all favorite prayer IDs first
    const favoriteIds = await db.getAllAsync<{prayer_id: number, added_at: string}>(
      "SELECT prayer_id, added_at FROM favorites ORDER BY added_at DESC;"
    );
    
    if (!favoriteIds || favoriteIds.length === 0) {
      return [];
    }
    
    const fallbackLanguage = language === "EN" ? "DE" : "EN";
    
    // For each prayer, get its details
    const result = [];
    
    for (const favorite of favoriteIds) {
      // Get basic prayer info
      const prayerQuery = `
        SELECT 
          p.id,
          p.name,
          p.arabic_title,
          c.title as category_title
        FROM prayers p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?;
      `;
      
      const prayer = await db.getFirstAsync(prayerQuery, [favorite.prayer_id]);
      
      if (!prayer) continue;
      
      // Try to get translation in preferred language
      const translationQuery = `
        SELECT 
          introduction,
          SUBSTR(main_body, 1, 150) as prayer_text
        FROM prayer_translations
        WHERE prayer_id = ? AND language_code = ?;
      `;
      
      let translation = await db.getFirstAsync(translationQuery, [favorite.prayer_id, language]);
      
      // If no translation in preferred language or fields are null/empty, try fallback
      if (!translation || 
          (!translation.introduction && (!translation.prayer_text || translation.prayer_text.trim() === ''))) {
        translation = await db.getFirstAsync(translationQuery, [favorite.prayer_id, fallbackLanguage]);
      }
      
      // Add the prayer with its translation to result
      result.push({
        ...prayer,
        introduction: translation?.introduction || null,
        prayer_text: translation?.prayer_text || null,
        // Include the original added_at time for consistent ordering
        added_at: favorite.added_at
      });
    }
    
    return result;
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
  
  // Use the Zustand store for refreshing favorites
  const { refreshTriggerFavorites } = useRefreshFavorites();
  
  // Animation value for fade-in effect
  const fadeAnim = useState(new Animated.Value(0))[0];

  useLayoutEffect(() => {
    const loadFavoritePrayers = async () => {
      try {
        setIsLoading(true);
        // Get fallback language if needed
        const defaultLanguage = await AsyncStorage.getItem('@prayer_app_language') || "de";
        let fallbackLanguage = "en";  // Default fallback
        if (defaultLanguage === "en") fallbackLanguage = "de";
        
        // First try with user's language
        let favoritePrayers = await getFavoritePrayers(defaultLanguage);
        
        // For prayers without translations in the preferred language, try fallback
        if (favoritePrayers.length > 0) {
          // Get IDs of prayers without proper translations
          const incompleteIds = favoritePrayers
            .filter(p => !p.introduction && (!p.prayer_text || p.prayer_text.trim() === ''))
            .map(p => p.id);
            
          if (incompleteIds.length > 0) {
            // Get fallback translations
            const fallbackPrayers = await getFavoritePrayersWithIds(incompleteIds, fallbackLanguage);
            
            // Replace incomplete prayers with fallback translations
            favoritePrayers = favoritePrayers.map(prayer => {
              if (incompleteIds.includes(prayer.id)) {
                const fallback = fallbackPrayers.find(fb => fb.id === prayer.id);
                if (fallback) {
                  return {
                    ...prayer,
                    introduction: prayer.introduction || fallback.introduction,
                    prayer_text: prayer.prayer_text || fallback.prayer_text
                  };
                }
              }
              return prayer;
            });
          }
        }

        if (favoritePrayers) {
          setPrayers(favoritePrayers);
          setError(null);
          
          // Start fade-in animation
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
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
  }, [refreshTriggerFavorites, t, fadeAnim]);

  // Show error state
  if (error && !isLoading && prayers.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons 
          name="alert-circle-outline" 
          size={64} 
          color={Colors[colorScheme].error} 
          style={styles.errorIcon}
        />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
      <ActivityIndicator />
        <ThemedText style={styles.loadingText}>{t("loadingFavorites")}</ThemedText>
      </View>
    );
  }

  // Show empty state
  if ((prayers.length === 0 || !prayers) && !isLoading && !error) {
    return (
      <View style={[styles.centeredContainer, { backgroundColor: Colors[colorScheme].background }]}>
        <Ionicons 
          name="heart" 
          size={80} 
          color={Colors[colorScheme].prayerHeaderBackground} 
          style={styles.emptyIcon}
        />
        <ThemedText style={styles.emptyTitle}>{t("noFavoritesYet")}</ThemedText>
        <ThemedText style={styles.emptyText}>{t("addFavoritesHint")}</ThemedText>
      </View>
    );
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: Colors[colorScheme].background },
        { opacity: fadeAnim }
      ]}
    >
      <FlatList
        data={prayers}
        extraData={refreshTriggerFavorites}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item, index }) => (
          <Animated.View 
            style={{ 
              transform: [{ 
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }],
              opacity: fadeAnim
            }}
          >
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/[prayer]",
                  params: {
                    prayerId: item.id.toString(),
                    prayerTitle: item.name,
                  },
                })
              }
              style={({ pressed }) => [
                { transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
            >
              <ThemedView 
                style={[
                  styles.card, 
                  { backgroundColor: Colors[colorScheme].prayerIntroductionBackground }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.categoryTag}>
                    <Ionicons 
                      name="folder-outline" 
                      size={14} 
                      color={Colors[colorScheme].prayerHeaderBackground} 
                    />
                    <ThemedText style={styles.categoryText}>{item.category_title}</ThemedText>
                  </View>
                  <Ionicons
                    name="heart"
                    size={20}
                    color={Colors.universal.favoriteIcon}
                  />
                </View>
                
                <View style={styles.cardContent}>
                  <ThemedText style={styles.arabicTitle}>{item.arabic_title}</ThemedText>
                  <ThemedText style={styles.prayerTitle}>{item.name}</ThemedText>
                  
                  {/* Show introduction text with better fallback handling */}
                  <ThemedText 
                    style={styles.introText} 
                    numberOfLines={1}
                  >
                    {item.introduction || 
                     (item.prayer_text && 
                      typeof item.prayer_text === 'string' && 
                      item.prayer_text.trim() !== '' ? 
                        item.prayer_text.substring(0, 100) : 
                       "")}
                  </ThemedText>
                </View>
                
                <View style={styles.cardFooter}>
                  <ThemedText style={styles.readMoreText}>{t("readMore")}</ThemedText>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Colors[colorScheme].prayerHeaderBackground}
                  />
                </View>
              </ThemedView>
            </Pressable>
          </Animated.View>
        )}
      />
    </Animated.View>
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
    paddingHorizontal: 32,
  },
  flatListStyle: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  categoryTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(5, 121, 88, 0.1)',
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
    color: 'rgba(5, 121, 88, 1)',
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  arabicTitle: {
    fontSize: 22,
    textAlign: "right",
    marginBottom: 8,
    writingDirection: "rtl",
    fontWeight: "600",
  },
  prayerTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "700",
  },
  introText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
    color: 'rgba(5, 121, 88, 1)',
  },
  // Empty state styles
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: width * 0.8,
  },
  // Error state styles
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  // Loading state styles
  loadingImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
});

export default RenderFavoritePrayers;