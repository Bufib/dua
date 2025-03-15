// import React, { useState, useEffect, useRef } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   useColorScheme,
//   Animated,
//   ActivityIndicator,
//   Platform,
//   Share,
//   Modal,
//   Alert,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "@/constants/Colors";
// import { useFontSizeStore } from "@/stores/fontSizeStore";
// import FontSizePickerModal from "@/components/FontSizePickerModal";
// import { useLocalSearchParams, router } from "expo-router";
// import {
//   isPrayerInFavorite,
//   addPrayerToFavorite,
//   removePrayerFromFavorite,
//   getPrayer
// } from "@/utils/initializeDatabase";
// import { useLanguage } from "@/context/LanguageContext";
// import { useTranslation } from "react-i18next";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";

// // Define types for prayer content
// interface PrayerSegment {
//   arabic: string;
//   transliteration: string;
//   translations: {
//     [key: string]: string;
//   };
// }

// interface PrayerData {
//   id: number;
//   title: string;
//   arabicTitle: string;
//   introduction: string | null;
//   segments: PrayerSegment[];
//   notes: string | null;
//   source: string | null;
//   languages_available: string[];
// }

// const RenderPrayer = () => {
//   // Translations
//   const { t } = useTranslation();

//   // Get prayer ID from URL params
//   const { prayerId, prayerTitle } = useLocalSearchParams<{
//     prayerId: string; //! why string?
//     prayerTitle: string;
//   }>();

//   // State
//   const [loading, setLoading] = useState(true);
//   const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const [selectedLanguages, setSelectedLanguages] = useState({
//     arabic: true,
//     transliteration: true,
//   });
//   const [bookmarkedSegment, setBookmarkedSegment] = useState<number | null>(
//     null
//   );
//   const [importantSegments, setImportantSegments] = useState<number[]>([]);
//   const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
//   const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
//   const { triggerRefreshFavorites } = useRefreshFavorites();
//   // Animations
//   const headerAnimation = useRef(new Animated.Value(0)).current;

//   // Hooks
//   const colorScheme = useColorScheme() || "light";
//   const { fontSize, lineHeight } = useFontSizeStore();
//   const insets = useSafeAreaInsets();
//   const { language, changeLanguage } = useLanguage();
//   const scrollRef = useRef<ScrollView>(null);

//   // Theme colors from Colors constant
//   const theme = {
//     primary: Colors.universal.primary, // #057958 - Main green
//     primaryDark: colorScheme === "dark" ? "#046347" : "#046347", // Darkened primary
//     primaryLight: Colors.universal.secondary, // #2ea853 - Secondary green
//     secondary: Colors.universal.third, // #e8f5e9 - Light green/background
//     textPrimary: colorScheme === "dark" ? Colors.dark.text : Colors.light.text, // #d0d0c0 or #000000
//     textSecondary: colorScheme === "dark" ? "#a0a090" : "#333333", // Muted text colors
//     background:
//       colorScheme === "dark" ? Colors.dark.background : Colors.light.background, // #242c40 or #fbf9f1
//     backgroundLight:
//       colorScheme === "dark" ? "#2d374d" : Colors.universal.third, // Slightly lighter background
//     divider:
//       colorScheme === "dark"
//         ? "rgba(208, 208, 192, 0.2)"
//         : "rgba(5, 121, 88, 0.15)", // Divider based on text/primary
//     bookmarkBackground:
//       colorScheme === "dark"
//         ? "rgba(5, 121, 88, 0.2)"
//         : "rgba(5, 121, 88, 0.1)", // Bookmark background
//     importantBackground:
//       colorScheme === "dark"
//         ? "rgba(5, 121, 88, 0.1)"
//         : "rgba(5, 121, 88, 0.05)", // Important background
//   };

//   // Storage keys
//   const BOOKMARK_STORAGE_KEY = `prayer_bookmark_${prayerId}`;
//   const IMPORTANT_STORAGE_KEY = `prayer_important_${prayerId}`;

//   // Header opacity based on scroll
//   const headerOpacity = headerAnimation.interpolate({
//     inputRange: [0, 100],
//     outputRange: [0, 1],
//     extrapolate: "clamp",
//   });

//   // Load bookmark and important segments from storage
//   useEffect(() => {
//     const loadUserPreferences = async () => {
//       if (!prayerId) return;

//       try {
//         // Load bookmark
//         const bookmarkData = await AsyncStorage.getItem(BOOKMARK_STORAGE_KEY);
//         if (bookmarkData) {
//           setBookmarkedSegment(JSON.parse(bookmarkData));
//         }

//         // Load important segments
//         const importantData = await AsyncStorage.getItem(IMPORTANT_STORAGE_KEY);
//         if (importantData) {
//           setImportantSegments(JSON.parse(importantData));
//         }
//       } catch (error) {
//         console.error("Error loading user preferences:", error);
//       }
//     };

//     loadUserPreferences();
//   }, [prayerId]);

//   // Check if prayer is in favorites
//   useEffect(() => {
//     const checkFavoriteStatus = async () => {
//       if (prayerId) {
//         const id = parseInt(prayerId, 10);
//         if (!isNaN(id)) {
//           const status = await isPrayerInFavorite(id);
//           setIsFavorite(status);
//         }
//       }
//     };

//     checkFavoriteStatus();
//   }, [prayerId]);

//   // Fetch prayer data
//   useEffect(() => {
//     const fetchPrayerData = async () => {
//     }
//     fetchPrayerData();
//   }, [prayerId, language]);

//   // Toggle favorite status
//   const toggleFavorite = async () => {
//     try {
//       if (!prayerId) return;

//       const id = parseInt(prayerId, 10);
//       if (isNaN(id)) return;

//       if (isFavorite) {
//         await removePrayerFromFavorite(id);
//         triggerRefreshFavorites();
//         setIsFavorite(false);
//       } else {
//         await addPrayerToFavorite(id);
//         triggerRefreshFavorites();
//         setIsFavorite(true);
//       }
//     } catch (error) {
//       console.error("Error toggling favorite status:", error);
//     }
//   };

//   // Set bookmark for a segment
//   const setBookmark = async (index: number) => {
//     try {
//       // If there's already a bookmark and it's different from the current one
//       if (bookmarkedSegment !== null && bookmarkedSegment !== index) {
//         // Show confirmation alert
//         Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
//           {
//             text: t("cancel"),
//             style: "cancel",
//           },
//           {
//             text: t("replace"),
//             onPress: async () => {
//               setBookmarkedSegment(index);
//               await AsyncStorage.setItem(
//                 BOOKMARK_STORAGE_KEY,
//                 JSON.stringify(index)
//               );
//               // You can also update in Supabase
//             },
//           },
//         ]);
//       } else if (bookmarkedSegment === index) {
//         // If clicking the same bookmark, remove it
//         setBookmarkedSegment(null);
//         await AsyncStorage.removeItem(BOOKMARK_STORAGE_KEY);
//       } else {
//         // If no bookmark exists, add this one
//         setBookmarkedSegment(index);
//         await AsyncStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(index));
//       }
//     } catch (error) {
//       console.error("Error setting bookmark:", error);
//     }
//   };

//   // Toggle important for a segment
//   const toggleImportantSegment = async (index: number) => {
//     try {
//       let newImportantSegments = [...importantSegments];

//       if (newImportantSegments.includes(index)) {
//         // Remove from important
//         newImportantSegments = newImportantSegments.filter((i) => i !== index);
//       } else {
//         // Add to important
//         newImportantSegments.push(index);
//       }

//       setImportantSegments(newImportantSegments);
//       await AsyncStorage.setItem(
//         IMPORTANT_STORAGE_KEY,
//         JSON.stringify(newImportantSegments)
//       );

//       // You can also store these in Supabase
//       // e.g., supabaseClient.from('prayer_important').upsert(...)
//     } catch (error) {
//       console.error("Error toggling important:", error);
//     }
//   };

//   // Share prayer
//   const handleShare = async () => {
//     if (!prayerData) return;

//     try {
//       let shareText = `${prayerData.title}\n${prayerData.arabicTitle}\n\n`;

//       if (prayerData.introduction) {
//         shareText += `${prayerData.introduction}\n\n`;
//       }

//       prayerData.segments.forEach((segment) => {
//         if (selectedLanguages.arabic) {
//           shareText += `${segment.arabic}\n`;
//         }

//         if (selectedLanguages.transliteration) {
//           shareText += `${segment.transliteration}\n`;
//         }

//         shareText += `${
//           segment.translations[language] || segment.translations.en
//         }\n`;

//         shareText += "\n";
//       });

//       await Share.share({
//         message: shareText,
//         title: prayerData.title,
//       });
//     } catch (error) {
//       console.error("Error sharing prayer:", error);
//     }
//   };

//   // Handle scroll events to animate header
//   const handleScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { y: headerAnimation } } }],
//     { useNativeDriver: false }
//   );

//   // Back button handler
//   const handleBack = () => {
//     router.back();
//   };

//   // Toggle display settings
//   const toggleDisplaySetting = (key: "arabic" | "transliteration") => {
//     setSelectedLanguages((prev) => ({
//       ...prev,
//       [key]: !prev[key],
//     }));
//   };

//   // Settings Modal Component
//   const SettingsModal = () => (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={isSettingsModalVisible}
//       onRequestClose={() => setIsSettingsModalVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View
//           style={[
//             styles.modalContainer,
//             { backgroundColor: theme.backgroundLight },
//           ]}
//         >
//           <View style={styles.modalHeader}>
//             <Text style={[styles.modalTitle, { color: theme.primary }]}>
//               {t("settings")}
//             </Text>
//             <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
//               <Ionicons name="close" size={24} color={theme.primary} />
//             </TouchableOpacity>
//           </View>

//           <View style={styles.modalContent}>
//             <TouchableOpacity
//               style={[
//                 styles.settingsItem,
//                 { borderBottomColor: theme.divider },
//               ]}
//               onPress={() => setFontSizeModalVisible(true)}
//             >
//               <View style={styles.settingsItemLeft}>
//                 <Ionicons
//                   name="text"
//                   size={22}
//                   color={theme.primary}
//                   style={styles.settingsItemIcon}
//                 />
//                 <Text
//                   style={[
//                     styles.settingsItemText,
//                     { color: theme.textPrimary },
//                   ]}
//                 >
//                   {t("adjustFontSize")}
//                 </Text>
//               </View>
//               <Ionicons
//                 name="chevron-forward"
//                 size={22}
//                 color={theme.textSecondary}
//               />
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={[styles.modalButton, { backgroundColor: theme.primary }]}
//             onPress={() => setIsSettingsModalVisible(false)}
//           >
//             <Text style={styles.modalButtonText}>{t("close")}</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <View
//         style={[styles.loadingContainer, { backgroundColor: theme.background }]}
//       >
//         <ActivityIndicator
//           size="large"
//           color={Colors[colorScheme].prayerLoadingIndicator}
//         />
//         <Text
//           style={{
//             marginTop: 12,
//             color: theme.textSecondary,
//             fontSize: 16,
//           }}
//         >
//           {t("loadingPrayer")}
//         </Text>
//       </View>
//     );
//   }

//   if (!prayerData) {
//     return (
//       <View
//         style={[styles.loadingContainer, { backgroundColor: theme.background }]}
//       >
//         <Ionicons
//           name="alert-circle-outline"
//           size={48}
//           color={colorScheme === "dark" ? "#f87171" : "#ef4444"}
//         />
//         <Text
//           style={{
//             marginTop: 12,
//             color: theme.textSecondary,
//             fontSize: 16,
//             textAlign: "center",
//           }}
//         >
//           {t("unableToLoadPrayer")}
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { backgroundColor: theme.background }]}>
//       {/* Main Scroll Content */}
//       <ScrollView
//         ref={scrollRef}
//         style={styles.scrollView}
//         contentContainerStyle={[
//           styles.contentContainer,
//           { paddingTop: insets.top + 16 },
//         ]}
//         showsVerticalScrollIndicator={false}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//       >
//         {/* Prayer Header Section */}
//         <View
//           style={[
//             styles.prayerHeader,
//             {
//               backgroundColor: Colors[colorScheme].prayerHeaderBackground,
//               borderRadius: 16,
//             },
//           ]}
//         >
//           <View style={styles.prayerTitleContainer}>
//             <Text
//               style={[
//                 styles.prayerTitle,
//                 { color: Colors[colorScheme].prayerHeaderText },
//               ]}
//             >
//               {prayerData.title}
//             </Text>
//             <Text
//               style={[
//                 styles.prayerArabicTitle,
//                 { color: Colors[colorScheme].prayerHeaderSubtitle },
//               ]}
//             >
//               {prayerData.arabicTitle}
//             </Text>
//           </View>

//           <View style={styles.headerActions}>
//             <TouchableOpacity
//               style={[
//                 styles.iconButton,
//                 { backgroundColor: "rgba(255, 255, 255, 0.2)" },
//               ]}
//               onPress={toggleFavorite}
//             >
//               <Ionicons
//                 name={isFavorite ? "heart" : "heart-outline"}
//                 size={22}
//                 color={Colors.universal.prayerHeaderIcon}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.iconButton,
//                 { backgroundColor: "rgba(255, 255, 255, 0.2)" },
//               ]}
//               onPress={handleShare}
//             >
//               <Ionicons
//                 name="share-outline"
//                 size={22}
//                 color={Colors.universal.prayerHeaderIcon}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.iconButton,
//                 { backgroundColor: "rgba(255, 255, 255, 0.2)" },
//               ]}
//               onPress={() => setIsSettingsModalVisible(true)}
//             >
//               <Ionicons
//                 name="settings-outline"
//                 size={22}
//                 color={Colors.universal.prayerHeaderIcon}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Introduction Card */}
//         {prayerData.introduction && (
//           <View
//             style={[
//               styles.introductionCard,
//               { backgroundColor: theme.backgroundLight },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.introductionText,
//                 {
//                   fontSize: fontSize - 1,
//                   lineHeight: lineHeight - 2,
//                   color: theme.textSecondary,
//                 },
//               ]}
//             >
//               {prayerData.introduction}
//             </Text>
//           </View>
//         )}

//         {/* Language Selection with Toggle Options */}
//         <View style={styles.languageSelectorContainer}>
//           <View style={styles.languageRow}>
//             {/* Language buttons */}
//             <View style={styles.languageButtons}>
//               {prayerData.languages_available.map((lang) => (
//                 <TouchableOpacity
//                   key={lang}
//                   style={[
//                     styles.languageButton,
//                     lang === language && styles.languageButtonActive,
//                     {
//                       backgroundColor:
//                         lang === language
//                           ? Colors[colorScheme].prayerButtonBackgroundActive
//                           : Colors[colorScheme].prayerButtonBackground,
//                     },
//                   ]}
//                   onPress={() => {
//                     /* Use the changeLanguage function from the hook */
//                     if (lang !== language) {
//                       changeLanguage(lang);
//                     }
//                   }}
//                 >
//                   <Text
//                     style={[
//                       styles.languageButtonText,
//                       lang === language && styles.languageButtonTextActive,
//                       {
//                         color:
//                           lang === language
//                             ? Colors[colorScheme].prayerButtonTextActive
//                             : Colors[colorScheme].prayerButtonText,
//                       },
//                     ]}
//                   >
//                     {lang.toUpperCase()}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>

//           {/* Display Toggles */}
//           <View style={styles.displayOptionsContainer}>
//             <TouchableOpacity
//               style={[
//                 styles.displayOptionToggle,
//                 {
//                   backgroundColor: selectedLanguages.arabic
//                     ? Colors[colorScheme].prayerButtonBackground
//                     : "rgba(5, 121, 88, 0.1)",
//                 },
//               ]}
//               onPress={() => toggleDisplaySetting("arabic")}
//             >
//               <Text
//                 style={[
//                   styles.displayOptionText,
//                   { color: Colors[colorScheme].prayerButtonText },
//                 ]}
//               >
//                 {t("arabic")}
//               </Text>
//               <Ionicons
//                 name={selectedLanguages.arabic ? "checkbox" : "square-outline"}
//                 size={18}
//                 color={Colors[colorScheme].prayerActionIcon}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[
//                 styles.displayOptionToggle,
//                 {
//                   backgroundColor: selectedLanguages.transliteration
//                     ? Colors[colorScheme].prayerButtonBackground
//                     : "rgba(5, 121, 88, 0.1)",
//                 },
//               ]}
//               onPress={() => toggleDisplaySetting("transliteration")}
//             >
//               <Text
//                 style={[
//                   styles.displayOptionText,
//                   { color: Colors[colorScheme].prayerButtonText },
//                 ]}
//               >
//                 {t("transliteration")}
//               </Text>
//               <Ionicons
//                 name={
//                   selectedLanguages.transliteration
//                     ? "checkbox"
//                     : "square-outline"
//                 }
//                 size={18}
//                 color={theme.primary}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Prayer Segments - Connected Flow */}
//         <View
//           style={[
//             styles.prayerFlowContainer,
//             {
//               backgroundColor:
//                 colorScheme === "dark"
//                   ? "rgba(36, 44, 64, 0.6)"
//                   : "rgba(255, 255, 255, 0.9)",
//               borderWidth: 1,
//               borderColor: theme.divider,
//             },
//           ]}
//         >
//           {prayerData.segments.map((segment, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.prayerSegment,
//                 index === 0 && styles.firstSegment,
//                 index === prayerData.segments.length - 1 && styles.lastSegment,
//                 // Add special background for bookmarked segment
//                 bookmarkedSegment === index && {
//                   backgroundColor: Colors[colorScheme].prayerBookmarkBackground,
//                   borderLeftWidth: 4,
//                   borderLeftColor: Colors[colorScheme].prayerBookmarkBorder,
//                 },
//                 // Add background for important segments (if not already bookmarked)
//                 bookmarkedSegment !== index &&
//                   importantSegments.includes(index) && {
//                     backgroundColor:
//                       Colors[colorScheme].prayerImportantBackground,
//                   },
//               ]}
//             >
//               {/* Segment Actions */}
//               <View style={styles.segmentActions}>
//                 <TouchableOpacity
//                   style={styles.segmentActionButton}
//                   onPress={() => setBookmark(index)}
//                 >
//                   <Ionicons
//                     name={
//                       bookmarkedSegment === index
//                         ? "bookmark"
//                         : "bookmark-outline"
//                     }
//                     size={20}
//                     color={
//                       bookmarkedSegment === index
//                         ? Colors[colorScheme].prayerActionIcon
//                         : Colors[colorScheme].prayerActionIconInactive
//                     }
//                   />
//                 </TouchableOpacity>

//                 <TouchableOpacity
//                   style={styles.segmentActionButton}
//                   onPress={() => toggleImportantSegment(index)}
//                 >
//                   <Ionicons
//                     name={
//                       importantSegments.includes(index)
//                         ? "star"
//                         : "star-outline"
//                     }
//                     size={20}
//                     color={
//                       importantSegments.includes(index)
//                         ? Colors[colorScheme].prayerActionIcon
//                         : Colors[colorScheme].prayerActionIconInactive
//                     }
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* Arabic Text */}
//               {selectedLanguages.arabic && (
//                 <Text
//                   style={[
//                     styles.arabicText,
//                     {
//                       fontSize: fontSize + 6,
//                       lineHeight: lineHeight + 10,
//                       color: Colors[colorScheme].prayerArabicText,
//                     },
//                   ]}
//                 >
//                   {segment.arabic}
//                 </Text>
//               )}

//               {/* Transliteration */}
//               {selectedLanguages.transliteration && (
//                 <Text
//                   style={[
//                     styles.transliterationText,
//                     {
//                       fontSize: fontSize - 2,
//                       lineHeight: lineHeight - 2,
//                       color: Colors[colorScheme].prayerTransliterationText,
//                     },
//                   ]}
//                 >
//                   {segment.transliteration}
//                 </Text>
//               )}

//               {/* Translation (always shown) */}
//               <Text
//                 style={[
//                   styles.translationText,
//                   {
//                     fontSize: fontSize,
//                     lineHeight: lineHeight,
//                     marginTop:
//                       selectedLanguages.arabic ||
//                       selectedLanguages.transliteration
//                         ? 8
//                         : 0,
//                     color: Colors[colorScheme].prayerTranslationText,
//                     fontWeight: bookmarkedSegment === index ? "600" : "normal",
//                   },
//                 ]}
//               >
//                 {segment.translations[language] || segment.translations.en}
//               </Text>

//               {/* Subtle divider between segments (except last) */}
//               {index < prayerData.segments.length - 1 && (
//                 <View
//                   style={[
//                     styles.segmentDivider,
//                     { backgroundColor: theme.divider },
//                   ]}
//                 />
//               )}
//             </View>
//           ))}
//         </View>

//         {/* Notes Section (if available) */}
//         {prayerData.notes && (
//           <View
//             style={[
//               styles.notesContainer,
//               { backgroundColor: theme.backgroundLight },
//             ]}
//           >
//             <Text style={[styles.notesTitle, { color: theme.primary }]}>
//               {t("notes")}
//             </Text>
//             <Text
//               style={[
//                 styles.notesText,
//                 {
//                   fontSize: fontSize - 1,
//                   lineHeight: lineHeight - 2,
//                   color: theme.textSecondary,
//                 },
//               ]}
//             >
//               {prayerData.notes}
//             </Text>
//           </View>
//         )}

//         {/* Source Citation */}
//         {prayerData.source && (
//           <View style={styles.sourceContainer}>
//             <Text
//               style={[
//                 styles.sourceText,
//                 { color: colorScheme === "dark" ? "#A5D6A7" : "#757575" },
//               ]}
//             >
//               {t("source")}: {prayerData.source}
//             </Text>
//           </View>
//         )}

//         {/* Bottom padding for safe area */}
//         <View style={{ height: 20 + insets.bottom }} />
//       </ScrollView>

//       {/* Settings Modal */}
//       <SettingsModal />

//       {/* Font Size Picker Modal */}
//       <FontSizePickerModal
//         visible={fontSizeModalVisible}
//         onClose={() => {
//           setFontSizeModalVisible(false);
//           setIsSettingsModalVisible(true);
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   scrollView: {
//     flex: 1,
//   },
//   contentContainer: {
//     padding: 16,
//   },
//   // Prayer header
//   prayerHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     padding: 16,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: Colors.universal.prayerPrimaryColor,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   prayerTitleContainer: {
//     flex: 1,
//   },
//   prayerTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   prayerArabicTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     writingDirection: "rtl",
//   },
//   headerActions: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   // Introduction card
//   introductionCard: {
//     borderRadius: 14,
//     marginBottom: 20,
//     padding: 16,
//     elevation: 1,
//     shadowColor: "#43A047",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   introductionText: {
//     lineHeight: 22,
//   },
//   // Language selection styles
//   languageSelectorContainer: {
//     marginBottom: 20,
//   },
//   languageRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   languageButtons: {
//     flexDirection: "row",
//   },
//   languageButton: {
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 8,
//     marginRight: 8,
//   },
//   languageButtonActive: {
//     backgroundColor: "#43A047",
//   },
//   languageButtonText: {
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   languageButtonTextActive: {
//     color: "#ffffff",
//   },
//   // Display options
//   displayOptionsContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: 8,
//   },
//   displayOptionToggle: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     flex: 1,
//     marginRight: 8,
//   },
//   displayOptionText: {
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   // Modal settings
//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.universal.prayerSettingsModalOverlay,
//   },
//   modalContainer: {
//     width: "85%",
//     borderRadius: 16,
//     padding: 20,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   modalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//   },
//   modalContent: {
//     marginBottom: 20,
//   },
//   modalButton: {
//     padding: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   modalButtonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   // Connected prayer flow styles
//   prayerFlowContainer: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 24,
//     elevation: 1,
//     shadowColor: "#43A047",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   prayerSegment: {
//     padding: 16,
//     paddingBottom: 8,
//     paddingTop: 8,
//     backgroundColor: "transparent",
//     position: "relative",
//   },
//   segmentActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginBottom: 8,
//   },
//   segmentActionButton: {
//     padding: 4,
//     marginLeft: 12,
//   },
//   firstSegment: {
//     paddingTop: 16,
//   },
//   lastSegment: {
//     paddingBottom: 16,
//   },
//   arabicText: {
//     textAlign: "right",
//     writingDirection: "rtl",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   transliterationText: {
//     textAlign: "left",
//     fontStyle: "italic",
//     marginBottom: 4,
//   },
//   translationText: {
//     textAlign: "left",
//   },
//   segmentDivider: {
//     height: 1,
//     marginTop: 10,
//     marginBottom: 2,
//   },
//   // Notes
//   notesContainer: {
//     borderRadius: 14,
//     marginBottom: 16,
//     padding: 16,
//     elevation: 1,
//     shadowColor: "#43A047",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   notesTitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     marginBottom: 8,
//   },
//   notesText: {
//     fontStyle: "italic",
//   },
//   // Source citation styles
//   sourceContainer: {
//     marginTop: 8,
//     paddingVertical: 8,
//   },
//   sourceText: {
//     fontSize: 13,
//     fontStyle: "italic",
//     textAlign: "center",
//   },
//   // Settings items
//   settingsItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   settingsItemLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   settingsItemIcon: {
//     marginRight: 12,
//   },
//   settingsItemText: {
//     fontSize: 16,
//   },
// });

// export default RenderPrayer;
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Animated,
  ActivityIndicator,
  Share,
  Modal,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import FontSizePickerModal from "@/components/FontSizePickerModal";
import { useLocalSearchParams, router } from "expo-router";
import {
  isPrayerInFavorite,
  addPrayerToFavorite,
  removePrayerFromFavorite,
  getPrayer,
} from "@/utils/initializeDatabase";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";

interface TextPart {
  text: string;
  isSpecial: boolean;
}

interface PrayerSegment {
  arabic: string;
  transliteration: string;
  translations: { [key: string]: TextPart[] };
}

interface PrayerData {
  id: number;
  title: string;
  arabicTitle: string;
  introduction: string | null;
  segments: PrayerSegment[];
  notes: { [key: string]: string | null };
  source: string | null;
  languages_available: string[];
}

const RenderPrayer = () => {
  const { t } = useTranslation();
  const { prayerId, prayerTitle } = useLocalSearchParams<{
    prayerId: string;
    prayerTitle: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState({
    arabic: true,
    transliteration: true,
  });
  const [bookmarkedSegment, setBookmarkedSegment] = useState<number | null>(
    null
  );
  const [importantSegments, setImportantSegments] = useState<number[]>([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { triggerRefreshFavorites } = useRefreshFavorites();
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme() || "light";
  const { fontSize, lineHeight } = useFontSizeStore();
  const insets = useSafeAreaInsets();
  const { language, changeLanguage } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);
  
  // Create a Map to store refs for each segment
  const segmentRefs = useRef<Map<number, View>>(new Map());

  const theme = {
    primary: Colors.universal.primary,
    primaryDark: colorScheme === "dark" ? "#046347" : "#046347",
    primaryLight: Colors.universal.secondary,
    secondary: Colors.universal.third,
    textPrimary: colorScheme === "dark" ? Colors.dark.text : Colors.light.text,
    textSecondary: colorScheme === "dark" ? "#a0a090" : "#333333",
    background:
      colorScheme === "dark" ? Colors.dark.background : Colors.light.background,
    backgroundLight:
      colorScheme === "dark" ? "#2d374d" : Colors.universal.third,
    divider:
      colorScheme === "dark"
        ? "rgba(208, 208, 192, 0.2)"
        : "rgba(5, 121, 88, 0.15)",
    bookmarkBackground:
      colorScheme === "dark"
        ? "rgba(5, 121, 88, 0.2)"
        : "rgba(5, 121, 88, 0.1)",
    importantBackground:
      colorScheme === "dark"
        ? "rgba(5, 121, 88, 0.1)"
        : "rgba(5, 121, 88, 0.05)",
  };

  const BOOKMARK_STORAGE_KEY = `prayer_bookmark_${prayerId}`;
  const IMPORTANT_STORAGE_KEY = `prayer_important_${prayerId}`;

  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Function to scroll to bookmark when opening prayer
  const scrollToBookmark = () => {
    if (bookmarkedSegment !== null && scrollRef.current && prayerData) {
      // Get the ref for the bookmarked segment
      const segmentRef = segmentRefs.current.get(bookmarkedSegment);
      
      if (segmentRef) {
        // Add some delay to ensure the content is rendered
        setTimeout(() => {
          segmentRef.measureLayout(
            // @ts-ignore - Known issue with type definition but works correctly
            scrollRef.current.getInnerViewNode(),
            (_, y) => {
              // Adjust position to account for header and some offset
              const offsetY = Math.max(0, y - 80);
              scrollRef.current?.scrollTo({ y: offsetY, animated: true });
            },
            () => {
              console.error("Failed to measure bookmark segment position");
              // Fallback to approximate position
              const estimatedPosition = bookmarkedSegment * 150;
              scrollRef.current?.scrollTo({ y: estimatedPosition, animated: true });
            }
          );
        }, 300);
      } else {
        console.log("Bookmark segment ref not found, using estimated position");
        // Fallback to estimated position with a longer delay
        setTimeout(() => {
          const estimatedPosition = bookmarkedSegment * 120;
          scrollRef.current?.scrollTo({ y: estimatedPosition, animated: true });
        }, 800);
      }
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!prayerId) return;
      try {
        const bookmarkData = await AsyncStorage.getItem(BOOKMARK_STORAGE_KEY);
        if (bookmarkData) {
          console.log("Loaded bookmark data:", bookmarkData);
          setBookmarkedSegment(JSON.parse(bookmarkData));
        }
        const importantData = await AsyncStorage.getItem(IMPORTANT_STORAGE_KEY);
        if (importantData) {
          console.log("Loaded important segments:", importantData);
          setImportantSegments(JSON.parse(importantData));
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };
    loadUserPreferences();
  }, [prayerId]);

  // Jump to bookmark when prayer data is loaded and bookmark exists
  useEffect(() => {
    if (prayerData && bookmarkedSegment !== null) {
      // Clear out any old refs first
      segmentRefs.current = new Map();
      
      // Wait for refs to be populated after render
      setTimeout(scrollToBookmark, 300);
    }
  }, [prayerData, bookmarkedSegment]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (prayerId) {
        const id = parseInt(prayerId, 10);
        if (!isNaN(id)) {
          const status = await isPrayerInFavorite(id);
          console.log("Favorite status for prayer", id, ":", status);
          setIsFavorite(status);
        }
      }
    };
    checkFavoriteStatus();
  }, [prayerId]);

  useEffect(() => {
    const fetchPrayerData = async () => {
      if (!prayerId) return;
      setLoading(true);
      try {
        const id = parseInt(prayerId, 10);
        if (isNaN(id)) {
          throw new Error("Invalid prayer ID");
        }
        console.log(
          "Fetching prayer data for ID:",
          id,
          "with language:",
          language.toUpperCase()
        );
        let prayerFromDB = await getPrayer(id, language);

        if (!prayerFromDB && language !== "EN") {
          console.log(
            "No prayer found for language",
            language,
            "; trying fallback to English."
          );
          prayerFromDB = await getPrayer(id, "en");
          console.log("Fallback prayer data:", prayerFromDB);
        }
        if (!prayerFromDB) {
          console.log("No prayer data found for ID:", id);
          setPrayerData(null);
          setLoading(false);
          return;
        }
        let languagesAvailable: string[] = [];
        try {
          languagesAvailable = JSON.parse(prayerFromDB.languages_available);
        } catch (e) {
          console.log("Error parsing languages_available, using raw value.", e);
          languagesAvailable = prayerFromDB.languages_available;
        }
        
        // Split the prayer text into lines
        const rawSegments = prayerFromDB.prayer_text
          .split(/\r?\n/)
          .filter((line) => line.trim() !== "");
          
        // Process segments with better handling of @Text@ markers
        const segments = rawSegments.map((line) => {
          if (/@text@/i.test(line)) {
            // Process line with @Text@ markers
            const parts: TextPart[] = [];
            
            // Split the line by @Text@ markers and process each part
            const regex = /(@text@)(.*?)(@text@)/gi;
            let lastIndex = 0;
            let match;
            
            // Create a working copy of the line
            let workingLine = line;
            
            // First, extract all regular text before any @Text@ tags
            match = regex.exec(workingLine);
            if (match) {
              // Add text before the first @Text@ if it exists
              const beforeFirstTag = workingLine.substring(0, match.index).trim();
              if (beforeFirstTag) {
                parts.push({ text: beforeFirstTag, isSpecial: false });
              }
              
              // Reset regex to search from beginning
              regex.lastIndex = 0;
            }
            
            // Process all @Text@ sections
            while ((match = regex.exec(workingLine)) !== null) {
              // The matched text without the markers
              const specialText = match[2].trim();
              if (specialText) {
                parts.push({ text: specialText, isSpecial: true });
              }
              
              // Check if there's regular text after this match and before next match
              const end = match.index + match[0].length;
              const nextMatch = regex.exec(workingLine);
              regex.lastIndex = end; // Reset to continue after current match
              
              if (nextMatch) {
                const regularText = workingLine.substring(end, nextMatch.index).trim();
                if (regularText) {
                  parts.push({ text: regularText, isSpecial: false });
                }
                regex.lastIndex = end; // Reset again after checking next match
              } else {
                // Get text after the last @Text@ tag
                const afterLastTag = workingLine.substring(end).trim();
                if (afterLastTag) {
                  parts.push({ text: afterLastTag, isSpecial: false });
                }
              }
            }
            
            // If no matches were found or parts is empty, treat whole line as regular text
            if (parts.length === 0) {
              parts.push({ text: line.replace(/@text@/ig, "").trim(), isSpecial: false });
            }
            
            return {
              arabic: "",
              transliteration: "",
              translations: { [language]: parts }
            };
          } else {
            // Regular line without @Text@ markers
            return {
              arabic: "",
              transliteration: "",
              translations: { 
                [language]: [{ text: line.trim(), isSpecial: false }] 
              }
            };
          }
        });
        
        // Parse notes with language-specific content
        let notesObj = {};
        if (prayerFromDB.notes) {
          try {
            // Try to parse notes as JSON if they are stored that way
            notesObj = JSON.parse(prayerFromDB.notes);
          } catch (e) {
            // If notes are not JSON, assume they are for the current language
            notesObj = { [language]: prayerFromDB.notes };
          }
        }

        const formattedPrayerData: PrayerData = {
          id: prayerFromDB.id,
          title: prayerFromDB.name,
          arabicTitle: prayerFromDB.arabic_title,
          introduction: prayerFromDB.introduction,
          segments,
          notes: notesObj,
          source: prayerFromDB.source,
          languages_available: languagesAvailable,
        };
        setPrayerData(formattedPrayerData);
      } catch (error) {
        console.error("Error fetching prayer data:", error);
        setPrayerData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPrayerData();
  }, [prayerId, language]);

  const toggleFavorite = async () => {
    if (!prayerId) return;
    const id = parseInt(prayerId, 10);
    if (isFavorite) {
      await removePrayerFromFavorite(id);
      setIsFavorite(false);
    } else {
      await addPrayerToFavorite(id);
      setIsFavorite(true);
    }
  };

  const setBookmark = async (index: number) => {
    if (bookmarkedSegment !== null && bookmarkedSegment !== index) {
      Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("replace"),
          onPress: async () => {
            setBookmarkedSegment(index);
            await AsyncStorage.setItem(
              BOOKMARK_STORAGE_KEY,
              JSON.stringify(index)
            );
          },
        },
      ]);
    } else if (bookmarkedSegment === index) {
      setBookmarkedSegment(null);
      await AsyncStorage.removeItem(BOOKMARK_STORAGE_KEY);
    } else {
      setBookmarkedSegment(index);
      await AsyncStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(index));
    }
  };

  const toggleImportantSegment = async (index: number) => {
    let newImportantSegments = [...importantSegments];
    if (newImportantSegments.includes(index)) {
      newImportantSegments = newImportantSegments.filter((i) => i !== index);
    } else {
      newImportantSegments.push(index);
    }
    setImportantSegments(newImportantSegments);
    await AsyncStorage.setItem(
      IMPORTANT_STORAGE_KEY,
      JSON.stringify(newImportantSegments)
    );
  };

  const handleShare = async () => {
    if (!prayerData) return;
    let shareText = `${prayerData.title}\n${prayerData.arabicTitle}\n\n`;
    if (prayerData.introduction) shareText += `${prayerData.introduction}\n\n`;
    prayerData.segments.forEach((segment) => {
      if (selectedLanguages.arabic) shareText += `${segment.arabic}\n`;
      if (selectedLanguages.transliteration)
        shareText += `${segment.transliteration}\n`;
      
      // Properly handle text parts for sharing
      const translationParts = segment.translations[language] || segment.translations.en;
      if (translationParts) {
        const translationText = translationParts.map(part => {
          return part.isSpecial ? `*${part.text}*` : part.text;
        }).join(' ');
        shareText += `${translationText}\n\n`;
      }
    });
    await Share.share({ message: shareText, title: prayerData.title });
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerAnimation } } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        // Show scroll to top button when user has scrolled down a bit
        setShowScrollToTop(offsetY > 300);
      }
    }
  );

  const handleBack = () => {
    router.back();
  };

  const toggleDisplaySetting = (key: "arabic" | "transliteration") => {
    setSelectedLanguages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingsModal = () => (
    <Modal
      animationType="slide"
      transparent
      visible={isSettingsModalVisible}
      onRequestClose={() => setIsSettingsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.backgroundLight },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.primary }]}>
              {t("settings")}
            </Text>
            <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[
                styles.settingsItem,
                { borderBottomColor: theme.divider },
              ]}
              onPress={() => setFontSizeModalVisible(true)}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name="text"
                  size={22}
                  color={theme.primary}
                  style={styles.settingsItemIcon}
                />
                <Text
                  style={[
                    styles.settingsItemText,
                    { color: theme.textPrimary },
                  ]}
                >
                  {t("adjustFontSize")}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: theme.primary }]}
            onPress={() => setIsSettingsModalVisible(false)}
          >
            <Text style={styles.modalButtonText}>{t("close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator
          size="large"
          color={Colors[colorScheme].prayerLoadingIndicator}
        />
        <Text
          style={{ marginTop: 12, color: theme.textSecondary, fontSize: 16 }}
        >
          {t("loadingPrayer")}
        </Text>
      </View>
    );
  }

  if (!prayerData) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colorScheme === "dark" ? "#f87171" : "#ef4444"}
        />
        <Text
          style={{
            marginTop: 12,
            color: theme.textSecondary,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          {t("unableToLoadPrayer")}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View
          style={[
            styles.prayerHeader,
            {
              backgroundColor: Colors[colorScheme].prayerHeaderBackground,
              borderRadius: 16,
            },
          ]}
        >
          <View style={styles.prayerTitleContainer}>
            <Text
              style={[
                styles.prayerTitle,
                { color: Colors[colorScheme].prayerHeaderText },
              ]}
            >
              {prayerData.title}
            </Text>
            <Text
              style={[
                styles.prayerArabicTitle,
                { color: Colors[colorScheme].prayerHeaderSubtitle },
              ]}
            >
              {prayerData.arabicTitle}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              ]}
              onPress={toggleFavorite}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={Colors.universal.prayerHeaderIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              ]}
              onPress={handleShare}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={Colors.universal.prayerHeaderIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconButton,
                { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              ]}
              onPress={() => setIsSettingsModalVisible(true)}
            >
              <Ionicons
                name="settings-outline"
                size={22}
                color={Colors.universal.prayerHeaderIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        {prayerData.introduction && (
          <View
            style={[
              styles.introductionCard,
              { backgroundColor: theme.backgroundLight },
            ]}
          >
            <Text
              style={[
                styles.introductionText,
                {
                  fontSize: fontSize - 1,
                  lineHeight: lineHeight - 2,
                  color: theme.textSecondary,
                },
              ]}
            >
              {prayerData.introduction}
            </Text>
          </View>
        )}
        <View style={styles.languageSelectorContainer}>
          <View style={styles.languageRow}>
            <View style={styles.languageButtons}>
              {prayerData.languages_available.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.languageButton,
                    lang === language && styles.languageButtonActive,
                    {
                      backgroundColor:
                        lang === language
                          ? Colors[colorScheme].prayerButtonBackgroundActive
                          : Colors[colorScheme].prayerButtonBackground,
                    },
                  ]}
                  onPress={() => {
                    if (lang !== language) changeLanguage(lang);
                  }}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      lang === language && styles.languageButtonTextActive,
                      {
                        color:
                          lang === language
                            ? Colors[colorScheme].prayerButtonTextActive
                            : Colors[colorScheme].prayerButtonText,
                      },
                    ]}
                  >
                    {lang.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.displayOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.displayOptionToggle,
                {
                  backgroundColor: selectedLanguages.arabic
                    ? Colors[colorScheme].prayerButtonBackground
                    : "rgba(5, 121, 88, 0.1)",
                },
              ]}
              onPress={() => toggleDisplaySetting("arabic")}
            >
              <Text
                style={[
                  styles.displayOptionText,
                  { color: Colors[colorScheme].prayerButtonText },
                ]}
              >
                {t("arabic")}
              </Text>
              <Ionicons
                name={selectedLanguages.arabic ? "checkbox" : "square-outline"}
                size={18}
                color={Colors[colorScheme].prayerActionIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.displayOptionToggle,
                {
                  backgroundColor: selectedLanguages.transliteration
                    ? Colors[colorScheme].prayerButtonBackground
                    : "rgba(5, 121, 88, 0.1)",
                },
              ]}
              onPress={() => toggleDisplaySetting("transliteration")}
            >
              <Text
                style={[
                  styles.displayOptionText,
                  { color: Colors[colorScheme].prayerButtonText },
                ]}
              >
                {t("transliteration")}
              </Text>
              <Ionicons
                name={
                  selectedLanguages.transliteration
                    ? "checkbox"
                    : "square-outline"
                }
                size={18}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={[
            styles.prayerFlowContainer,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(36, 44, 64, 0.6)"
                  : "rgba(255, 255, 255, 0.9)",
              borderWidth: 1,
              borderColor: theme.divider,
            },
          ]}
        >
          {prayerData.segments.map((segment, index) => (
            <View
              ref={(ref) => {
                if (ref) {
                  segmentRefs.current.set(index, ref);
                }
              }}
              key={index}
              style={[
                styles.prayerSegment,
                index === 0 && styles.firstSegment,
                index === prayerData.segments.length - 1 && styles.lastSegment,
                bookmarkedSegment === index && {
                  backgroundColor: Colors[colorScheme].prayerBookmarkBackground,
                  borderLeftWidth: 4,
                  borderLeftColor: Colors[colorScheme].prayerBookmarkBorder,
                },
                bookmarkedSegment !== index &&
                  importantSegments.includes(index) && {
                    backgroundColor:
                      Colors[colorScheme].prayerImportantBackground,
                  },
              ]}
            >
              <View style={styles.segmentActions}>
                <TouchableOpacity
                  style={styles.segmentActionButton}
                  onPress={() => setBookmark(index)}
                >
                  <Ionicons
                    name={
                      bookmarkedSegment === index
                        ? "bookmark"
                        : "bookmark-outline"
                    }
                    size={20}
                    color={
                      bookmarkedSegment === index
                        ? Colors[colorScheme].prayerActionIcon
                        : Colors[colorScheme].prayerActionIconInactive
                    }
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.segmentActionButton}
                  onPress={() => toggleImportantSegment(index)}
                >
                  <Ionicons
                    name={
                      importantSegments.includes(index)
                        ? "star"
                        : "star-outline"
                    }
                    size={20}
                    color={
                      importantSegments.includes(index)
                        ? Colors[colorScheme].prayerActionIcon
                        : Colors[colorScheme].prayerActionIconInactive
                    }
                  />
                </TouchableOpacity>
              </View>
              {selectedLanguages.arabic && (
                <Text
                  style={[
                    styles.arabicText,
                    {
                      fontSize: fontSize + 6,
                      lineHeight: lineHeight + 10,
                      color: Colors[colorScheme].prayerArabicText,
                    },
                  ]}
                >
                  {segment.arabic}
                </Text>
              )}
              {selectedLanguages.transliteration && (
                <Text
                  style={[
                    styles.transliterationText,
                    {
                      fontSize: fontSize - 2,
                      lineHeight: lineHeight - 2,
                      color: Colors[colorScheme].prayerTransliterationText,
                    },
                  ]}
                >
                  {segment.transliteration}
                </Text>
              )}
              <View
                style={[
                  styles.translationContainer,
                  {
                    marginTop:
                      selectedLanguages.arabic ||
                      selectedLanguages.transliteration
                        ? 8
                        : 0,
                  },
                ]}
              >
                {(segment.translations[language] || segment.translations.en)?.map((part, partIndex) => (
                  <Text
                    key={partIndex}
                    style={[
                      styles.translationText,
                      {
                        fontSize: fontSize,
                        lineHeight: lineHeight,
                        color: Colors[colorScheme].prayerTranslationText,
                        fontWeight: bookmarkedSegment === index ? 
                          (part.isSpecial ? "700" : "600") : 
                          (part.isSpecial ? "700" : "normal"),
                      },
                      part.isSpecial && styles.specialText,
                      partIndex > 0 && styles.textSeparator
                    ]}
                  >
                    {part.text} {part.isSpecial && partIndex < (segment.translations[language] || segment.translations.en).length - 1 ? " | " : ""}
                  </Text>
                ))}
              </View>
              {index < prayerData.segments.length - 1 && (
                <View
                  style={[
                    styles.segmentDivider,
                    { backgroundColor: theme.divider },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
        {/* Only show notes if they exist for the current language */}
        {prayerData.notes && prayerData.notes[language] && (
          <View
            style={[
              styles.notesContainer,
              { backgroundColor: theme.backgroundLight },
            ]}
          >
            <Text style={[styles.notesTitle, { color: theme.primary }]}>
              {t("notes")}
            </Text>
            <Text
              style={[
                styles.notesText,
                {
                  fontSize: fontSize - 1,
                  lineHeight: lineHeight - 2,
                  color: theme.textSecondary,
                },
              ]}
            >
              {prayerData.notes[language]}
            </Text>
          </View>
        )}
        {prayerData.source && (
          <View style={styles.sourceContainer}>
            <Text
              style={[
                styles.sourceText,
                { color: colorScheme === "dark" ? "#A5D6A7" : "#757575" },
              ]}
            >
              {t("source")}: {prayerData.source}
            </Text>
          </View>
        )}
        <View style={{ height: 20 + insets.bottom }} />
      </ScrollView>
      
      {/* Scroll to top button */}
      {showScrollToTop && (
        <TouchableOpacity
          style={[
            styles.scrollToTopButton,
            { backgroundColor: theme.primary },
            { bottom: insets.bottom + 16 }
          ]}
          onPress={scrollToTop}
        >
          <Ionicons name="arrow-up" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      <SettingsModal />
      <FontSizePickerModal
        visible={fontSizeModalVisible}
        onClose={() => {
          setFontSizeModalVisible(false);
          setIsSettingsModalVisible(true);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.universal.prayerPrimaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  prayerTitleContainer: { flex: 1 },
  prayerTitle: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  prayerArabicTitle: {
    fontSize: 18,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  introductionCard: {
    borderRadius: 14,
    marginBottom: 20,
    padding: 16,
    elevation: 1,
    shadowColor: "#43A047",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  introductionText: { lineHeight: 22 },
  languageSelectorContainer: { marginBottom: 20 },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  languageButtons: { flexDirection: "row" },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  languageButtonActive: { backgroundColor: "#43A047" },
  languageButtonText: { fontSize: 13, fontWeight: "600" },
  languageButtonTextActive: { color: "#ffffff" },
  displayOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  displayOptionToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  displayOptionText: { fontSize: 13, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.prayerSettingsModalOverlay,
  },
  modalContainer: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  modalContent: { marginBottom: 20 },
  modalButton: { padding: 12, borderRadius: 8, alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  prayerFlowContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 1,
    shadowColor: "#43A047",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  prayerSegment: {
    padding: 16,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "transparent",
    position: "relative",
  },
  segmentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  segmentActionButton: { padding: 4, marginLeft: 12 },
  firstSegment: { paddingTop: 16 },
  lastSegment: { paddingBottom: 16 },
  arabicText: {
    textAlign: "right",
    writingDirection: "rtl",
    fontWeight: "600",
    marginBottom: 4,
  },
  transliterationText: {
    textAlign: "left",
    fontStyle: "italic",
    marginBottom: 4,
  },
  translationContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  translationText: { 
    textAlign: "left" 
  },
  specialText: { 
    fontWeight: "700",
  },
  textSeparator: {
    marginLeft: 4,
  },
  segmentDivider: { height: 1, marginTop: 10, marginBottom: 2 },
  notesContainer: {
    borderRadius: 14,
    marginBottom: 16,
    padding: 16,
    elevation: 1,
    shadowColor: "#43A047",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notesTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  notesText: { fontStyle: "italic" },
  sourceContainer: { marginTop: 8, paddingVertical: 8 },
  sourceText: { fontSize: 13, fontStyle: "italic", textAlign: "center" },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsItemLeft: { flexDirection: "row", alignItems: "center" },
  settingsItemIcon: { marginRight: 12 },
  settingsItemText: { fontSize: 16 },
  scrollToTopButton: {
    position: "absolute",
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default RenderPrayer;