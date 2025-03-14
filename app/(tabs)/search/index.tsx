import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useColorScheme,
  Animated,
  ActivityIndicator,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import debounce from "lodash/debounce";
import { searchPrayers } from "@/utils/initializeDatabase";
import { PrayerWithCategory } from "@/utils/types";
import { SafeAreaView } from "react-native-safe-area-context";

const SEARCH_HISTORY_KEY = "@prayer_app_search_history";
const MAX_HISTORY_ITEMS = 5;

export default function PrayerSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<PrayerWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("DE");

  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  // Load search history and language preference from storage
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load search history
        const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (historyJson) {
          setSearchHistory(JSON.parse(historyJson));
        }

        // Load language preference
        const language = await AsyncStorage.getItem("@prayer_app_language");
        if (language) {
          setCurrentLanguage(language.toUpperCase());
        }
      } catch (err) {
        console.error("Error loading search data:", err);
      }
    };

    loadInitialData();
  }, []);

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce(async (term: string, language: string) => {
      if (!term.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }

      try {
        const results = await searchPrayers(term, language);
        setSearchResults(results);

        // Add to search history if there are results
        if (results.length > 0) {
          addToSearchHistory(term);
        }

        // Animate results in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("Search error:", err);
        setError(t("errorSearching"));
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [fadeAnim, t]
  );

  // Handle search input changes
  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setError(null);

    // Reset fade animation for new results
    fadeAnim.setValue(0);

    if (text.trim()) {
      setIsLoading(true);
      setShowHistory(false);
      debouncedSearch(text, currentLanguage);
    } else {
      setSearchResults([]);
      setIsLoading(false);
      setShowHistory(true);
    }
  };

  // Add term to search history
  const addToSearchHistory = async (term: string) => {
    try {
      const trimmedTerm = term.trim();
      if (!trimmedTerm) return;

      // Create new history array without the current term (if it exists)
      const filteredHistory = searchHistory.filter(
        (item) => item.toLowerCase() !== trimmedTerm.toLowerCase()
      );

      // Add the term to the beginning
      const newHistory = [trimmedTerm, ...filteredHistory].slice(
        0,
        MAX_HISTORY_ITEMS
      );

      setSearchHistory(newHistory);
      await AsyncStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(newHistory)
      );
    } catch (err) {
      console.error("Error saving search history:", err);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setShowHistory(true);
    inputRef.current?.focus();
  };

  // Use a history item
  const useHistoryItem = (term: string) => {
    setSearchTerm(term);
    setShowHistory(false);
    setIsLoading(true);
    debouncedSearch(term, currentLanguage);
  };

  // Clear search history
  const clearHistory = async () => {
    try {
      setSearchHistory([]);
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) {
      console.error("Error clearing search history:", err);
    }
  };

  // Handle input focus animations
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        Animated.timing(inputFocusAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        Animated.timing(inputFocusAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [inputFocusAnim]);

  // Input container animation styles
  const inputContainerStyle = {
    paddingHorizontal: inputFocusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 8],
    }),
    marginTop: inputFocusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 8],
    }),
  };

  // Render prayer item
  const renderPrayerItem = ({ item }: { item: PrayerWithCategory }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [
          {
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
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
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <ThemedView style={styles.resultCard}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryTag}>
              <Ionicons
                name="folder-outline"
                size={14}
                color={Colors[colorScheme].prayerHeaderBackground}
              />
              <ThemedText style={styles.categoryText}>
                {item.category_title}
              </ThemedText>
            </View>
          </View>

          <View style={styles.cardContent}>
            {item.arabic_title && (
              <ThemedText style={styles.arabicTitle}>
                {item.arabic_title}
              </ThemedText>
            )}
            <ThemedText style={styles.prayerTitle}>{item.name}</ThemedText>
            {item.prayer_text && (
              <ThemedText
                style={styles.previewText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.prayer_text}
              </ThemedText>
            )}
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
  );

  // Render history item
  const renderHistoryItem = ({ item }: { item: string }) => (
    <Pressable style={styles.historyItem} onPress={() => useHistoryItem(item)}>
      <Ionicons
        name="time-outline"
        size={18}
        color={Colors[colorScheme].text}
      />
      <ThemedText style={styles.historyText}>{item}</ThemedText>
    </Pressable>
  );

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      {/* Search Input */}
      <Animated.View style={[styles.searchInputContainer, inputContainerStyle]}>
        <View style={styles.searchInputWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={Colors[colorScheme].text}
            style={styles.searchIcon}
          />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder={t("searchPlaceholder")}
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            value={searchTerm}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="never"
            autoFocus
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors[colorScheme].tabIconDefault}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme].prayerHeaderBackground}
          />
          <ThemedText style={styles.loadingText}>{t("searching")}</ThemedText>
        </View>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={Colors[colorScheme].error}
          />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && !isLoading && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <ThemedText style={styles.historyTitle}>
              {t("recentSearches")}
            </ThemedText>
            <TouchableOpacity onPress={clearHistory}>
              <ThemedText style={styles.clearHistoryText}>
                {t("clear")}
              </ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `history-${index}`}
            scrollEnabled={false}
          />
        </View>
      )}

      {/* No Results */}
      {searchTerm.length > 0 &&
        searchResults.length === 0 &&
        !isLoading &&
        !error && (
          <View style={styles.emptyResultsContainer}>
            <Ionicons
              name="search-outline"
              size={64}
              color={Colors[colorScheme].tabIconDefault}
              style={styles.emptyIcon}
            />
            <ThemedText style={styles.emptyTitle}>{t("noResults")}</ThemedText>
            <ThemedText style={styles.emptyText}>
              {t("tryDifferentSearch")}
            </ThemedText>
          </View>
        )}

      {/* Search Results */}
      {searchResults.length > 0 && !isLoading && (
        <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
          <FlatList
            data={searchResults}
            renderItem={renderPrayerItem}
            keyExtractor={(item) => `prayer-${item.id}`}
            contentContainerStyle={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInputContainer: {
    paddingVertical: 8,
    marginBottom: 8,
    zIndex: 10,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    padding: 0,
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 22,
  },
  resultsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  resultCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    backgroundColor: "rgba(5, 121, 88, 0.1)",
  },
  categoryText: {
    fontSize: 12,
    marginLeft: 4,
    color: "rgba(5, 121, 88, 1)",
    fontWeight: "500",
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
  previewText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
    color: "rgba(5, 121, 88, 1)",
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
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
  },
  historyContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  clearHistoryText: {
    fontSize: 14,
    opacity: 0.7,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  historyText: {
    fontSize: 16,
    marginLeft: 12,
  },
});
