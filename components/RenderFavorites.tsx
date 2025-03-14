import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useColorScheme,
  Dimensions,
  Animated,
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
import { getFavoritePrayers } from "@/utils/initializeDatabase"; // Adjust the import path as needed
import { FavoritePrayer } from "@/utils/types"; // Adjust the import path as needed

const { width } = Dimensions.get("window");

function RenderFavoritePrayers() {
  const [prayers, setPrayers] = useState<FavoritePrayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { refreshTriggerFavorites } = useRefreshFavorites();

  // Animation value for fade-in effect
  const fadeAnim = useState(new Animated.Value(0))[0];

  useLayoutEffect(() => {
    const loadFavoritePrayers = async () => {
      try {
        setIsLoading(true);
        // Retrieve the user's language from AsyncStorage or fallback to "de"
        const defaultLanguage =
          (await AsyncStorage.getItem("@prayer_app_language")) || "en";
        // Use the centralized getFavoritePrayers method (which handles translation fallback)
        const favoritePrayers = await getFavoritePrayers(defaultLanguage);
        setPrayers(favoritePrayers);
        setError(null);
        // Start fade-in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("Error loading favorite prayers:", err);
        setError(t("errorLoadingFavorites"));
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoritePrayers();
  }, [refreshTriggerFavorites, t, fadeAnim]);

  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator />
        <ThemedText style={styles.loadingText}>
          {t("loadingFavorites")}
        </ThemedText>
      </View>
    );
  }

  if (error && prayers.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={64}
          color={Colors.universal.error}
          style={styles.errorIcon}
        />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (prayers.length === 0) {
    return (
      <View
        style={[
          styles.centeredContainer,
          { backgroundColor: Colors[colorScheme].background },
        ]}
      >
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
        { opacity: fadeAnim },
      ]}
    >
      <FlatList
        data={prayers}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: fadeAnim,
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
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
            >
              <ThemedView
                style={[
                  styles.card,
                  { backgroundColor: Colors[colorScheme].prayerIntroductionBackground },
                ]}
              >
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
                  <Ionicons
                    name="heart"
                    size={20}
                    color={Colors.universal.favoriteIcon}
                  />
                </View>

                <View style={styles.cardContent}>
                  <ThemedText style={styles.arabicTitle}>{item.arabic_title}</ThemedText>
                  <ThemedText style={styles.prayerTitle}>{item.name}</ThemedText>
                  <ThemedText style={styles.introText} numberOfLines={1}>
                    {item.introduction ||
                      (item.prayer_text && item.prayer_text.trim() !== ""
                        ? item.prayer_text.substring(0, 100)
                        : "")}
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
    overflow: "hidden",
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
  introText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
    lineHeight: 20,
    fontStyle: "italic",
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
  errorIcon: {
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.8,
  },
});

export default RenderFavoritePrayers;
