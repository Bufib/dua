import React, { useState, useEffect } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import {
  getUserCategories,
  getFavoritesByCategory,
  removePrayerFromFavorite,
  deleteFavoriteCategory,
} from "@/utils/initializeDatabase";
import { UserCategory, PrayerWithTranslations } from "@/utils/types";

export default function RenderFavoritePrayers() {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [prayers, setPrayers] = useState<PrayerWithTranslations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { refreshTriggerFavorites } = useRefreshFavorites();

  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load categories once
  useEffect(() => {
    (async () => {
      try {
        const cats = await getUserCategories();
        setCategories(cats);
        if (cats.length && selectedCategoryId === null) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [refreshTriggerFavorites]);

  // Load prayers on category or refresh
  useEffect(() => {
    if (selectedCategoryId == null) return;
    (async () => {
      setIsLoading(true);
      fadeAnim.setValue(0);
      try {
        const favs = await getFavoritesByCategory(selectedCategoryId);
        setPrayers(favs);
        setError(null);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      } catch {
        setError(t("errorLoadingFavorites"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedCategoryId, refreshTriggerFavorites]);

  const handleDeleteCategory = async (categoryId: number) => {
    Alert.alert(
      t("FavoriteCategories.confirmCategoryDeletionCategory"),
      t("FavoriteCategories.confirmCategoryDeletionMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => deleteCategory(categoryId),
        },
      ],
      { cancelable: true }
    );
  };
  const deleteCategory = async (categoryId: number) => {
    if (selectedCategoryId == null) return;
    if (categoryId === selectedCategoryId) {
      setSelectedCategoryId(null);
      setPrayers([]);
    }
    // Remove the category from the list
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Remove the prayers from the list
    setPrayers((prev) => prev.filter((p) => p.category_id !== categoryId));
    // Remove the category from the database
    // and remove the prayers from the database
    try {
      await deleteFavoriteCategory(categoryId);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setPrayers([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemovePrayerFromFavorite = (prayerId: number) => {
    Alert.alert(
      t("confirmRemovalTitle"),
      t("confirmRemovalMessage"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("yesRemove"),
          style: "destructive",
          onPress: async () => {
            if (selectedCategoryId == null) return;
            try {
              await removePrayerFromFavorite(prayerId, selectedCategoryId);
              setPrayers((prev) => prev.filter((p) => p.id !== prayerId));
            } catch (e) {
              console.error(e);
              setError(t("errorRemovingFavorite"));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme].activityIndicator}
        />
        <ThemedText style={styles.statusText}>
          {t("loadingFavorites")}
        </ThemedText>
      </ThemedView>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={56}
          color={Colors.universal.error}
        />
        <ThemedText style={styles.statusText}>{error}</ThemedText>
      </View>
    );
  }

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <ThemedView style={styles.container}>
      {/* Category selector */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.categoryList}
        keyExtractor={(c) => c.id.toString()}
        renderItem={({ item }) => {
          const selected = item.id === selectedCategoryId;
          return (
            <Pressable
              onPress={() => setSelectedCategoryId(item.id)}
              style={[
                styles.pill,
                {
                  backgroundColor: selected
                    ? item.color
                    : Colors.universal.secondary,
                  borderWidth: selected ? 0 : 1,
                  borderColor: Colors[colorScheme].border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  {
                    color: selected ? "#FFF" : Colors[colorScheme].text,
                  },
                ]}
              >
                {item.title}
              </ThemedText>
              <Ionicons
                name="remove-circle-outline"
                size={24}
                color="black"
                onPress={() => handleDeleteCategory(item.id)}
              />
            </Pressable>
          );
        }}
      />

      {/* Header */}
      {currentCategory && (
        <View style={styles.header}>
          <View
            style={[
              styles.headerMarker,
              { backgroundColor: currentCategory.color },
            ]}
          />
          <ThemedText style={styles.headerTitle}>
            {currentCategory.title}
          </ThemedText>
          <ThemedText style={styles.headerCount}>
            {prayers.length} {prayers.length === 1 ? t("prayer") : t("prayers")}
          </ThemedText>
        </View>
      )}

      {/* Empty vs. Prayer cards */}
      {!prayers.length ? (
        <View style={styles.centered}>
          <Ionicons
            name="heart-outline"
            size={56}
            color="red"
            style={{ opacity: 0.5 }}
          />
          <ThemedText style={styles.statusTitle}>
            {t("noFavoritesYet")}
          </ThemedText>
          <ThemedText style={styles.statusText}>
            {t("addFavoritesHint")}
          </ThemedText>
        </View>
      ) : (
        <Animated.FlatList
          data={prayers}
          keyExtractor={(p) => p.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/[prayer]",
                  params: { prayer: item.id.toString() },
                })
              }
              style={({ pressed }) => [
                styles.card,
                {
                  shadowOpacity: pressed ? 0.15 : 0.1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                  backgroundColor: Colors[colorScheme].contrast,
                },
              ]}
            >
              <Ionicons
                name="remove-circle-outline"
                size={25}
                color={Colors.universal.error}
                style={{ alignSelf: "flex-end", paddingBottom: 20 }}
                onPress={() => handleRemovePrayerFromFavorite(item.id)}
              />
              <View style={styles.cardHeader}>
                {item.arabic_title && (
                  <ThemedText style={styles.arabicTitle}>
                    {item.arabic_title}
                  </ThemedText>
                )}
                <ThemedText style={styles.cardTitle}>{item.name} </ThemedText>
              </View>
              <ThemedText numberOfLines={2} style={styles.cardBody}>
                {item.introduction || item.prayer_text?.slice(0, 100)}
              </ThemedText>
              <View style={styles.cardFooter}>
                <View style={[styles.tag, { backgroundColor: item.color }]}>
                  <Ionicons
                    name="bookmark-outline"
                    size={14}
                    color={Colors[colorScheme].iconDefault}
                  />
                  <ThemedText style={styles.tagText}>
                    {item.category_title}
                  </ThemedText>
                </View>
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/[prayer]",
                        params: { prayer: item.id.toString() },
                      })
                    }
                    style={styles.actionButton}
                  ></Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  statusTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  categoryList: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  pill: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  pillText: { fontSize: 14, fontWeight: "500" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerMarker: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1 },
  headerCount: { fontSize: 12, opacity: 0.6 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { marginBottom: 8 },
  arabicTitle: {
    fontSize: 18,
    textAlign: "right",
    marginBottom: 4,
    fontWeight: "500",
  },
  cardTitle: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  cardBody: {
    fontSize: 14,
    opacity: 0.75,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  removeButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,0,0,0.05)",
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
