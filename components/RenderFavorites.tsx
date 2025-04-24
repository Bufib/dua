// import React, { useState, useLayoutEffect } from "react";
// import {
//   View,
//   Pressable,
//   StyleSheet,
//   FlatList,
//   useColorScheme,
//   Dimensions,
//   Animated,
//   ActivityIndicator
// } from "react-native";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "@/components/ThemedView";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useTranslation } from "react-i18next";
// import { Colors } from "@/constants/Colors";
// import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { getFavoritePrayers } from "@/utils/initializeDatabase"; // Adjust the import path as needed
// import { FavoritePrayer } from "@/utils/types"; // Adjust the import path as needed

// const { width } = Dimensions.get("window");

// function RenderFavoritePrayers() {
//   const [prayers, setPrayers] = useState<FavoritePrayer[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const colorScheme = useColorScheme() || "light";
//   const { t } = useTranslation();
//   const { refreshTriggerFavorites } = useRefreshFavorites();

//   // Animation value for fade-in effect
//   const fadeAnim = useState(new Animated.Value(0))[0];

//   useLayoutEffect(() => {
//     const loadFavoritePrayers = async () => {
//       try {
//         setIsLoading(true);
//         // Retrieve the user's language from AsyncStorage or fallback to "de"
//         const defaultLanguage =
//           (await AsyncStorage.getItem("@prayer_app_language")) || "en";
//         // Use the centralized getFavoritePrayers method (which handles translation fallback)
//         const favoritePrayers = await getFavoritePrayers(defaultLanguage);
//         setPrayers(favoritePrayers);
//         setError(null);
//         // Start fade-in animation
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.error("Error loading favorite prayers:", err);
//         setError(t("errorLoadingFavorites"));
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadFavoritePrayers();
//   }, [refreshTriggerFavorites, t, fadeAnim]);

//   if (isLoading) {
//     return (
//       <View style={styles.centeredContainer}>
//         <ActivityIndicator />
//         <ThemedText style={styles.loadingText}>
//           {t("loadingFavorites")}
//         </ThemedText>
//       </View>
//     );
//   }

//   if (error && prayers.length === 0) {
//     return (
//       <View style={styles.centeredContainer}>
//         <Ionicons
//           name="alert-circle-outline"
//           size={64}
//           color={Colors.universal.error}
//           style={styles.errorIcon}
//         />
//         <ThemedText style={styles.errorText}>{error}</ThemedText>
//       </View>
//     );
//   }

//   if (prayers.length === 0) {
//     return (
//       <View
//         style={[
//           styles.centeredContainer,
//           { backgroundColor: Colors[colorScheme].background },
//         ]}
//       >
//         <Ionicons
//           name="heart"
//           size={80}
//           color={Colors[colorScheme].prayerHeaderBackground}
//           style={styles.emptyIcon}
//         />
//         <ThemedText style={styles.emptyTitle}>{t("noFavoritesYet")}</ThemedText>
//         <ThemedText style={styles.emptyText}>{t("addFavoritesHint")}</ThemedText>
//       </View>
//     );
//   }

//   return (
//     <Animated.View
//       style={[
//         styles.container,
//         { backgroundColor: Colors[colorScheme].background },
//         { opacity: fadeAnim },
//       ]}
//     >
//       <FlatList
//         data={prayers}
//         keyExtractor={(item) => item.id.toString()}
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.flatListStyle}
//         renderItem={({ item }) => (
//           <Animated.View
//             style={{
//               transform: [
//                 {
//                   translateY: fadeAnim.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [50, 0],
//                   }),
//                 },
//               ],
//               opacity: fadeAnim,
//             }}
//           >
//             <Pressable
//               onPress={() =>
//                 router.push({
//                   pathname: "/[prayer]",
//                   params: {
//                     prayerId: item.id.toString(),
//                     prayerTitle: item.name,
//                   },
//                 })
//               }
//               style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
//             >
//               <ThemedView
//                 style={[
//                   styles.card,
//                   { backgroundColor: Colors[colorScheme].prayerIntroductionBackground },
//                 ]}
//               >
//                 <View style={styles.cardHeader}>
//                   <View style={styles.categoryTag}>
//                     <Ionicons
//                       name="folder-outline"
//                       size={14}
//                       color={Colors[colorScheme].prayerHeaderBackground}
//                     />
//                     <ThemedText style={styles.categoryText}>
//                       {item.category_title}
//                     </ThemedText>
//                   </View>
//                   <Ionicons
//                     name="heart"
//                     size={20}
//                     color={Colors.universal.favoriteIcon}
//                   />
//                 </View>

//                 <View style={styles.cardContent}>
//                   <ThemedText style={styles.arabicTitle}>{item.arabic_title}</ThemedText>
//                   <ThemedText style={styles.prayerTitle}>{item.name}</ThemedText>
//                   <ThemedText style={styles.introText} numberOfLines={1}>
//                     {item.introduction ||
//                       (item.prayer_text && item.prayer_text.trim() !== ""
//                         ? item.prayer_text.substring(0, 100)
//                         : "")}
//                   </ThemedText>
//                 </View>

//                 <View style={styles.cardFooter}>
//                   <ThemedText style={styles.readMoreText}>{t("readMore")}</ThemedText>
//                   <Ionicons
//                     name="chevron-forward"
//                     size={16}
//                     color={Colors[colorScheme].prayerHeaderBackground}
//                   />
//                 </View>
//               </ThemedView>
//             </Pressable>
//           </Animated.View>
//         )}
//       />
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   centeredContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 32,
//   },
//   flatListStyle: {
//     padding: 16,
//     paddingBottom: 32,
//   },
//   card: {
//     borderRadius: 16,
//     marginBottom: 16,
//     padding: 0,
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     overflow: "hidden",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//   },
//   categoryTag: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 4,
//     paddingHorizontal: 8,
//     borderRadius: 12,
//     backgroundColor: "rgba(5, 121, 88, 0.1)",
//   },
//   categoryText: {
//     fontSize: 12,
//     marginLeft: 4,
//     color: "rgba(5, 121, 88, 1)",
//     fontWeight: "500",
//   },
//   cardContent: {
//     padding: 16,
//     paddingTop: 0,
//   },
//   arabicTitle: {
//     fontSize: 22,
//     textAlign: "right",
//     marginBottom: 8,
//     writingDirection: "rtl",
//     fontWeight: "600",
//   },
//   prayerTitle: {
//     fontSize: 18,
//     marginBottom: 8,
//     fontWeight: "700",
//   },
//   introText: {
//     fontSize: 14,
//     opacity: 0.7,
//     marginTop: 4,
//     lineHeight: 20,
//     fontStyle: "italic",
//   },
//   cardFooter: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(0,0,0,0.05)",
//   },
//   readMoreText: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginRight: 4,
//     color: "rgba(5, 121, 88, 1)",
//   },
//   emptyIcon: {
//     marginBottom: 16,
//     opacity: 0.5,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "600",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   emptyText: {
//     fontSize: 16,
//     opacity: 0.7,
//     textAlign: "center",
//     lineHeight: 22,
//     maxWidth: width * 0.8,
//   },
//   errorIcon: {
//     marginBottom: 16,
//   },
//   errorText: {
//     fontSize: 16,
//     textAlign: "center",
//     opacity: 0.8,
//   },
//   loadingText: {
//     fontSize: 16,
//     opacity: 0.8,
//   },
// });

// export default RenderFavoritePrayers;

// import React, {
//   useState,
//   useLayoutEffect,
//   useEffect,
//   useCallback,
// } from "react";
// import {
//   View,
//   Pressable,
//   StyleSheet,
//   FlatList,
//   useColorScheme,
//   Dimensions,
//   Animated,
//   ActivityIndicator,
//   Text,
// } from "react-native";
// import { ThemedText } from "@/components/ThemedText";
// import { ThemedView } from "./ThemedView";
// import { Ionicons } from "@expo/vector-icons";
// import { router } from "expo-router";
// import { useTranslation } from "react-i18next";
// import { Colors } from "@/constants/Colors";
// import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";

// import {
//   getUserCategories,
//   getFavoritesByCategory,
// } from "@/utils/initializeDatabase";
// import { UserCategory, PrayerWithTranslations } from "@/utils/types";

// export default function RenderFavoritePrayers() {
//   const [categories, setCategories] = useState<UserCategory[]>([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
//     null
//   );

//   const [prayers, setPrayers] = useState<PrayerWithTranslations[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const colorScheme = useColorScheme() || "light";
//   const { t } = useTranslation();
//   const { refreshTriggerFavorites } = useRefreshFavorites();

//   const fadeAnim = useState(new Animated.Value(0))[0];

//   // 1) Load user categories on mount
//   useEffect(() => {
//     (async () => {
//       try {
//         const cats = await getUserCategories();
//         setCategories(cats);
//         // default to first category if exists
//         if (cats.length && selectedCategoryId === null) {
//           setSelectedCategoryId(cats[0].id);
//         }
//       } catch (e) {
//         console.error("Error loading categories", e);
//       }
//     })();
//   }, []);

//   // 2) Whenever the selected category or refresh trigger changes, reload prayers
//   useEffect(() => {
//     if (selectedCategoryId === null) return;

//     (async () => {
//       setIsLoading(true);
//       try {
//         const favs: PrayerWithTranslations[] = await getFavoritesByCategory(
//           selectedCategoryId
//         );
//         setPrayers(favs);
//         setError(null);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.error("Error loading favorites by category", err);
//         setError(t("errorLoadingFavorites"));
//       } finally {
//         setIsLoading(false);
//       }
//     })();
//   }, [selectedCategoryId, refreshTriggerFavorites]);

//   // 3) Render loading / empty / error states
//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator />
//         <ThemedText>{t("loadingFavorites")}</ThemedText>
//       </View>
//     );
//   }
//   if (error) {
//     return (
//       <View style={styles.centered}>
//         <Ionicons
//           name="alert-circle-outline"
//           size={64}
//           color={Colors.universal.error}
//         />
//         <ThemedText>{error}</ThemedText>
//       </View>
//     );
//   }
//   if (!prayers.length) {
//     return (
//       <View style={styles.centered}>
//         <Ionicons
//           name="heart-outline"
//           size={64}
//           color={Colors[colorScheme].text}
//         />
//         <ThemedText>{t("noFavoritesInCategory")}</ThemedText>
//       </View>
//     );
//   }

//   // 4) Render category selector + list of cards
//   return (
//     <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
//       {/* Horizontal category row */}
//       <FlatList
//         data={categories}
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.categoryRow}
//         keyExtractor={(c) => c.id.toString()}
//         renderItem={({ item }) => {
//           const isSelected = item.id === selectedCategoryId;
//           return (
//             <Pressable
//               onPress={() => setSelectedCategoryId(item.id)}
//               style={[
//                 styles.categoryButton,
//                 {
//                   backgroundColor: isSelected
//                     ? item.color
//                     : Colors[colorScheme].background,
//                 },
//               ]}
//             >
//               <Text
//                 style={{
//                   color: isSelected ? "#fff" : item.color,
//                   fontWeight: isSelected ? "600" : "500",
//                 }}
//               >
//                 {item.title}
//               </Text>
//             </Pressable>
//           );
//         }}
//       />

//       {/* Favorite prayers list */}
//       <FlatList
//         data={prayers}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.list}
//         renderItem={({ item }) => (
//           <Pressable
//             onPress={() =>
//               router.push({
//                 pathname: "/[prayer]",
//                 params: {
//                   prayerId: item.id.toString(),
//                   prayerTitle: item.name,
//                 },
//               })
//             }
//           >
//             <ThemedView style={styles.card}>
//               {/* You can reuse your existing cardHeader / cardContent / cardFooter */}
//               <View style={styles.cardHeader}>
//                 <Ionicons name="folder-outline" size={14} color={item.color} />
//                 <ThemedText style={{ color: item.color, marginLeft: 4 }}>
//                   {item.category_title}
//                 </ThemedText>
//                 <Ionicons
//                   name="heart"
//                   size={20}
//                   color={Colors.universal.favoriteIcon}
//                 />
//               </View>

//               <View style={styles.cardContent}>
//                 <ThemedText style={styles.arabicTitle}>
//                   {item.arabic_title}
//                 </ThemedText>
//                 <ThemedText style={styles.prayerTitle}>{item.name}</ThemedText>
//                 <ThemedText numberOfLines={1} style={styles.introText}>
//                   {item.introduction || item.prayer_text?.slice(0, 100)}
//                 </ThemedText>
//               </View>

//               <View style={styles.cardFooter}>
//                 <ThemedText style={{ color: item.color }}>
//                   {t("readMore")}
//                 </ThemedText>
//                 <Ionicons name="chevron-forward" size={16} color={item.color} />
//               </View>
//             </ThemedView>
//           </Pressable>
//         )}
//       />
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
//   categoryRow: { padding: 8 },
//   categoryButton: {
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     marginRight: 8,
//     borderWidth: 1,
//   },
//   list: { padding: 16, paddingBottom: 32 },
//   card: {
//     borderRadius: 16,
//     marginBottom: 16,
//     overflow: "hidden",
//     backgroundColor: Colors.universal.secondary,
//     padding: 16,
//   },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between" },
//   cardContent: { marginTop: 8 },
//   cardFooter: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginTop: 8,
//   },
//   arabicTitle: { fontSize: 20, textAlign: "right" },
//   prayerTitle: { fontSize: 18, fontWeight: "600", marginTop: 4 },
//   introText: { fontSize: 14, opacity: 0.8, marginTop: 4, fontStyle: "italic" },
// });

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
  Dimensions,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "./ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/Colors";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import { getUserCategories, getFavoritesByCategory } from "@/utils/initializeDatabase";
import { UserCategory, PrayerWithTranslations } from "@/utils/types";

const { width } = Dimensions.get("window");

export default function RenderFavoritePrayers() {
  const [categories, setCategories] = useState<UserCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [prayers, setPrayers] = useState<PrayerWithTranslations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { refreshTriggerFavorites } = useRefreshFavorites();

  // Animation value
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Load user categories on mount
  useEffect(() => {
    (async () => {
      try {
        const cats = await getUserCategories();
        setCategories(cats);
        if (cats.length && selectedCategoryId === null) {
          setSelectedCategoryId(cats[0].id);
        }
      } catch (e) {
        console.error("Error loading categories", e);
      }
    })();
  }, []);

  // Load prayers when category changes
  useEffect(() => {
    if (selectedCategoryId === null) return;

    (async () => {
      setIsLoading(true);
      fadeAnim.setValue(0);
      
      try {
        const favs: PrayerWithTranslations[] = await getFavoritesByCategory(selectedCategoryId);
        setPrayers(favs);
        setError(null);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } catch (err) {
        console.error("Error loading favorites by category", err);
        setError(t("errorLoadingFavorites"));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [selectedCategoryId, refreshTriggerFavorites]);

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={Colors[colorScheme].primary} />
        <ThemedText style={styles.statusText}>{t("loadingFavorites")}</ThemedText>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.universal.error}
        />
        <ThemedText style={styles.statusText}>{error}</ThemedText>
      </View>
    );
  }

  // Render empty state
  if (!prayers.length) {
    return (
      <View style={styles.centered}>
        <Ionicons
          name="heart-outline"
          size={48}
          color={Colors[colorScheme].text}
          style={{ opacity: 0.6 }}
        />
        <ThemedText style={styles.statusTitle}>{t("noFavoritesInCategory")}</ThemedText>
        <ThemedText style={styles.statusText}>
          {t("addFavoritesHint")}
        </ThemedText>
      </View>
    );
  }

  // Find current category object
  const currentCategory = categories.find(cat => cat.id === selectedCategoryId);

  return (
    <View style={styles.container}>
      {/* Category pills */}
      <View style={styles.categoryWrapper}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(c) => c.id.toString()}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedCategoryId;
            return (
              <Pressable
                onPress={() => setSelectedCategoryId(item.id)}
                style={({ pressed }) => [
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected 
                      ? item.color 
                      : colorScheme === 'dark' ? '#2A2A2A' : '#F5F5F5',
                    opacity: pressed ? 0.9 : 1
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { 
                      color: isSelected 
                        ? '#FFFFFF' 
                        : colorScheme === 'dark' ? '#FFFFFF' : '#333333',
                      opacity: isSelected ? 1 : 0.8
                    }
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Category title */}
      {currentCategory && (
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryMarker, { backgroundColor: currentCategory.color }]} />
          <ThemedText style={styles.categoryHeaderText}>
            {currentCategory.title}
          </ThemedText>
          <Text style={styles.prayerCount}>
            {prayers.length} {prayers.length === 1 ? t("prayer") : t("prayers")}
          </Text>
        </View>
      )}

      {/* Prayer list */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={prayers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
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
                styles.card,
                { 
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ translateY: pressed ? 1 : 0 }]
                }
              ]}
            >
              <View style={styles.cardTop}>
                {item.arabic_title && (
                  <ThemedText style={styles.arabicTitle}>
                    {item.arabic_title}
                  </ThemedText>
                )}
                <ThemedText style={styles.titleText}>{item.name}</ThemedText>
              </View>
              
              <ThemedText numberOfLines={2} style={styles.previewText}>
                {item.introduction || item.prayer_text?.slice(0, 100)}
              </ThemedText>
              
              <View style={styles.cardFooter}>
                <View style={[styles.cardTag, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name="bookmark-outline" size={14} color={item.color} />
                  <Text style={[styles.tagText, { color: item.color }]}>
                    {item.category_title}
                  </Text>
                </View>
                
                <View style={styles.actionRow}>
                  <ThemedText style={[styles.readButton, { color: item.color }]}>
                    {t("readMore")}
                  </ThemedText>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={item.color} 
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </View>
            </Pressable>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 24
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  categoryWrapper: {
    paddingTop: 12,
  },
  categoryList: { 
    paddingHorizontal: 16, 
    paddingBottom: 12,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 100,
    marginRight: 10,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  categoryMarker: {
    width: 3,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  prayerCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  listContainer: {
    flex: 1,
  },
  list: { 
    padding: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  cardTop: {
    marginBottom: 8,
  },
  arabicTitle: { 
    fontSize: 18, 
    textAlign: "right",
    marginBottom: 8,
    fontWeight: "500",
  },
  titleText: { 
    fontSize: 16, 
    fontWeight: "600", 
    lineHeight: 22,
  },
  previewText: { 
    fontSize: 14, 
    opacity: 0.7, 
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  cardTag: {
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
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  readButton: {
    fontSize: 13,
    fontWeight: "600",
  }
});