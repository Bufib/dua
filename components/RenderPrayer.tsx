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
  Platform,
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
} from "@/utils/initializeDatabase";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
// Define types for prayer content
interface PrayerSegment {
  arabic: string;
  transliteration: string;
  translations: {
    [key: string]: string;
  };
}

interface PrayerData {
  id: number;
  title: string;
  arabicTitle: string;
  introduction: string | null;
  segments: PrayerSegment[];
  notes: string | null;
  source: string | null;
  languages_available: string[];
}

const RenderPrayer = () => {
  // Translations
  const { t } = useTranslation();

  // Get prayer ID from URL params
  const { prayerId, prayerTitle } = useLocalSearchParams<{
    prayerId: string; //! why string?
    prayerTitle: string;
  }>();

  // State
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
  const { triggerRefreshFavorites } = useRefreshFavorites();
  // Animations
  const headerAnimation = useRef(new Animated.Value(0)).current;

  // Hooks
  const colorScheme = useColorScheme() || "light";
  const { fontSize, lineHeight } = useFontSizeStore();
  const insets = useSafeAreaInsets();
  const { language, changeLanguage } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);

  // Theme colors from Colors constant
  const theme = {
    primary: Colors.universal.primary, // #057958 - Main green
    primaryDark: colorScheme === "dark" ? "#046347" : "#046347", // Darkened primary
    primaryLight: Colors.universal.secondary, // #2ea853 - Secondary green
    secondary: Colors.universal.third, // #e8f5e9 - Light green/background
    textPrimary: colorScheme === "dark" ? Colors.dark.text : Colors.light.text, // #d0d0c0 or #000000
    textSecondary: colorScheme === "dark" ? "#a0a090" : "#333333", // Muted text colors
    background:
      colorScheme === "dark" ? Colors.dark.background : Colors.light.background, // #242c40 or #fbf9f1
    backgroundLight:
      colorScheme === "dark" ? "#2d374d" : Colors.universal.third, // Slightly lighter background
    divider:
      colorScheme === "dark"
        ? "rgba(208, 208, 192, 0.2)"
        : "rgba(5, 121, 88, 0.15)", // Divider based on text/primary
    bookmarkBackground:
      colorScheme === "dark"
        ? "rgba(5, 121, 88, 0.2)"
        : "rgba(5, 121, 88, 0.1)", // Bookmark background
    importantBackground:
      colorScheme === "dark"
        ? "rgba(5, 121, 88, 0.1)"
        : "rgba(5, 121, 88, 0.05)", // Important background
  };

  // Storage keys
  const BOOKMARK_STORAGE_KEY = `prayer_bookmark_${prayerId}`;
  const IMPORTANT_STORAGE_KEY = `prayer_important_${prayerId}`;

  // Header opacity based on scroll
  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Load bookmark and important segments from storage
  useEffect(() => {
    const loadUserPreferences = async () => {
      if (!prayerId) return;

      try {
        // Load bookmark
        const bookmarkData = await AsyncStorage.getItem(BOOKMARK_STORAGE_KEY);
        if (bookmarkData) {
          setBookmarkedSegment(JSON.parse(bookmarkData));
        }

        // Load important segments
        const importantData = await AsyncStorage.getItem(IMPORTANT_STORAGE_KEY);
        if (importantData) {
          setImportantSegments(JSON.parse(importantData));
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
      }
    };

    loadUserPreferences();
  }, [prayerId]);

  // Check if prayer is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (prayerId) {
        const id = parseInt(prayerId, 10);
        if (!isNaN(id)) {
          const status = await isPrayerInFavorite(id);
          setIsFavorite(status);
        }
      }
    };

    checkFavoriteStatus();
  }, [prayerId]);

  // Fetch prayer data
  useEffect(() => {
    const fetchPrayerData = async () => {
      try {
        setLoading(true);

        // In a real app, this would fetch from your database
        // For this example, I'll use mock data based on the provided code

        // Simulating API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock prayer data (in a real app, fetch from API/database)
        const mockPrayer: PrayerData = {
          id: parseInt(prayerId || "1", 10),
          title: prayerTitle || "Ziyarat Ashura",
          arabicTitle: "زيارة عاشوراء",
          introduction:
            "This Ziarat is recited for Imam Hussain(as) on the day of Ashura & everyday. Highly Recommended for solutions to all major problems, if recited continiously for 40 days.",
          segments: [
            {
              arabic: "اَلسَّلاَمُ عَلَيْكَ يَا أَبَا عَبْدِ ٱللَّهِ",
              transliteration: "alssalamu `alayka ya aba `abdillahi",
              translations: {
                en: "Peace be upon you, O Abu-`Abdullah.",
                de: "Friede sei mit dir, o Abu-`Abdullah.",
                ar: "السلام عليك يا أبا عبد الله.",
              },
            },
            {
              arabic: "اَلسَّلاَمُ عَلَيْكَ يَا بْنَ رَسُولِ ٱللَّهِ",
              transliteration: "alssalamu `alayka yabna rasuli allahi",
              translations: {
                en: "Peace be upon you, O son of Allah's Messenger.",
                de: "Friede sei mit dir, o Sohn des Gesandten Allahs.",
                ar: "السلام عليك يا ابن رسول الله.",
              },
            },
            {
              arabic:
                "السَّلاَمُ عَلَيكَ يَا خِيَرَةِ ٱللَّهِ وَٱبْنَ خَيرَتِهِ",
              transliteration:
                "alssalamu `alayka ya khiyarata allahi wabna khiyaratihi",
              translations: {
                en: "Peace be upon you, O choicest of Allah and son of His choicest.",
                de: "Friede sei mit dir, o Auserwählter Allahs und Sohn Seines Auserwählten.",
                ar: "السلام عليك يا خيرة الله وابن خيرته.",
              },
            },
          ],
          notes:
            "You may then repeat the following Laan one hundred times: اَللَّهُمَّ ٱلْعَنْ أَوَّلَ ظَالِمٍ",
          source: "Mafatih al-Jinan",
          languages_available: ["en", "de"],
        };

        setPrayerData(mockPrayer);
      } catch (error) {
        console.error("Error fetching prayer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerData();
    // Remove language from dependency array - we don't need to refetch when language changes
  }, [prayerId, prayerTitle]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      if (!prayerId) return;

      const id = parseInt(prayerId, 10);
      if (isNaN(id)) return;

      if (isFavorite) {
        await removePrayerFromFavorite(id);
        triggerRefreshFavorites();
        setIsFavorite(false);
      } else {
        await addPrayerToFavorite(id);
        triggerRefreshFavorites();
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  // Set bookmark for a segment
  const setBookmark = async (index: number) => {
    try {
      // If there's already a bookmark and it's different from the current one
      if (bookmarkedSegment !== null && bookmarkedSegment !== index) {
        // Show confirmation alert
        Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
          {
            text: t("cancel"),
            style: "cancel",
          },
          {
            text: t("replace"),
            onPress: async () => {
              setBookmarkedSegment(index);
              await AsyncStorage.setItem(
                BOOKMARK_STORAGE_KEY,
                JSON.stringify(index)
              );
              // You can also update in Supabase
            },
          },
        ]);
      } else if (bookmarkedSegment === index) {
        // If clicking the same bookmark, remove it
        setBookmarkedSegment(null);
        await AsyncStorage.removeItem(BOOKMARK_STORAGE_KEY);
      } else {
        // If no bookmark exists, add this one
        setBookmarkedSegment(index);
        await AsyncStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(index));
      }
    } catch (error) {
      console.error("Error setting bookmark:", error);
    }
  };

  // Toggle important for a segment
  const toggleImportantSegment = async (index: number) => {
    try {
      let newImportantSegments = [...importantSegments];

      if (newImportantSegments.includes(index)) {
        // Remove from important
        newImportantSegments = newImportantSegments.filter((i) => i !== index);
      } else {
        // Add to important
        newImportantSegments.push(index);
      }

      setImportantSegments(newImportantSegments);
      await AsyncStorage.setItem(
        IMPORTANT_STORAGE_KEY,
        JSON.stringify(newImportantSegments)
      );

      // You can also store these in Supabase
      // e.g., supabaseClient.from('prayer_important').upsert(...)
    } catch (error) {
      console.error("Error toggling important:", error);
    }
  };

  // Share prayer
  const handleShare = async () => {
    if (!prayerData) return;

    try {
      let shareText = `${prayerData.title}\n${prayerData.arabicTitle}\n\n`;

      if (prayerData.introduction) {
        shareText += `${prayerData.introduction}\n\n`;
      }

      prayerData.segments.forEach((segment) => {
        if (selectedLanguages.arabic) {
          shareText += `${segment.arabic}\n`;
        }

        if (selectedLanguages.transliteration) {
          shareText += `${segment.transliteration}\n`;
        }

        shareText += `${
          segment.translations[language] || segment.translations.en
        }\n`;

        shareText += "\n";
      });

      await Share.share({
        message: shareText,
        title: prayerData.title,
      });
    } catch (error) {
      console.error("Error sharing prayer:", error);
    }
  };

  // Handle scroll events to animate header
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: headerAnimation } } }],
    { useNativeDriver: false }
  );

  // Back button handler
  const handleBack = () => {
    router.back();
  };

  // Toggle display settings
  const toggleDisplaySetting = (key: "arabic" | "transliteration") => {
    setSelectedLanguages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Settings Modal Component
  const SettingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
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
          style={{
            marginTop: 12,
            color: theme.textSecondary,
            fontSize: 16,
          }}
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
      {/* Main Scroll Content */}
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
        {/* Prayer Header Section */}
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

        {/* Introduction Card */}
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

        {/* Language Selection with Toggle Options */}
        <View style={styles.languageSelectorContainer}>
          <View style={styles.languageRow}>
            {/* Language buttons */}
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
                    /* Use the changeLanguage function from the hook */
                    if (lang !== language) {
                      changeLanguage(lang);
                    }
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

          {/* Display Toggles */}
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

        {/* Prayer Segments - Connected Flow */}
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
              key={index}
              style={[
                styles.prayerSegment,
                index === 0 && styles.firstSegment,
                index === prayerData.segments.length - 1 && styles.lastSegment,
                // Add special background for bookmarked segment
                bookmarkedSegment === index && {
                  backgroundColor: Colors[colorScheme].prayerBookmarkBackground,
                  borderLeftWidth: 4,
                  borderLeftColor: Colors[colorScheme].prayerBookmarkBorder,
                },
                // Add background for important segments (if not already bookmarked)
                bookmarkedSegment !== index &&
                  importantSegments.includes(index) && {
                    backgroundColor:
                      Colors[colorScheme].prayerImportantBackground,
                  },
              ]}
            >
              {/* Segment Actions */}
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

              {/* Arabic Text */}
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

              {/* Transliteration */}
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

              {/* Translation (always shown) */}
              <Text
                style={[
                  styles.translationText,
                  {
                    fontSize: fontSize,
                    lineHeight: lineHeight,
                    marginTop:
                      selectedLanguages.arabic ||
                      selectedLanguages.transliteration
                        ? 8
                        : 0,
                    color: Colors[colorScheme].prayerTranslationText,
                    fontWeight: bookmarkedSegment === index ? "600" : "normal",
                  },
                ]}
              >
                {segment.translations[language] || segment.translations.en}
              </Text>

              {/* Subtle divider between segments (except last) */}
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

        {/* Notes Section (if available) */}
        {prayerData.notes && (
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
              {prayerData.notes}
            </Text>
          </View>
        )}

        {/* Source Citation */}
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

        {/* Bottom padding for safe area */}
        <View style={{ height: 20 + insets.bottom }} />
      </ScrollView>

      {/* Settings Modal */}
      <SettingsModal />

      {/* Font Size Picker Modal */}
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  // Prayer header
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
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  prayerArabicTitle: {
    fontSize: 18,
    fontWeight: "600",
    writingDirection: "rtl",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Introduction card
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
  introductionText: {
    lineHeight: 22,
  },
  // Language selection styles
  languageSelectorContainer: {
    marginBottom: 20,
  },
  languageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  languageButtons: {
    flexDirection: "row",
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  languageButtonActive: {
    backgroundColor: "#43A047",
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  languageButtonTextActive: {
    color: "#ffffff",
  },
  // Display options
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
  displayOptionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Modal settings
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
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    marginBottom: 20,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Connected prayer flow styles
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
  segmentActionButton: {
    padding: 4,
    marginLeft: 12,
  },
  firstSegment: {
    paddingTop: 16,
  },
  lastSegment: {
    paddingBottom: 16,
  },
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
  translationText: {
    textAlign: "left",
  },
  segmentDivider: {
    height: 1,
    marginTop: 10,
    marginBottom: 2,
  },
  // Notes
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
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesText: {
    fontStyle: "italic",
  },
  // Source citation styles
  sourceContainer: {
    marginTop: 8,
    paddingVertical: 8,
  },
  sourceText: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  // Settings items
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsItemIcon: {
    marginRight: 12,
  },
  settingsItemText: {
    fontSize: 16,
  },
});

export default RenderPrayer;
