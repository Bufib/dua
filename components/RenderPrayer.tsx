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
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import FontSizePickerModal from "@/components/FontSizePickerModal";
import { useLocalSearchParams, router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  isPrayerInFavorite,
  addPrayerToFavorite,
  removePrayerFromFavorite,
} from "@/utils/initializeDatabase";
import { useLanguage } from "@/context/LanguageContext";

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
  // Get prayer ID from URL params
  const { prayerId, prayerTitle } = useLocalSearchParams<{
    prayerId: string;
    prayerTitle: string;
  }>();

  // State
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState({
    arabic: true,
    transliteration: true,
    translation: true,
  });
  const [selectedTranslationLanguage, setSelectedTranslationLanguage] =
    useState("de");
  const [showSettings, setShowSettings] = useState(false);
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);

  // Animations
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const settingsAnimation = useRef(new Animated.Value(0)).current;

  // Hooks
  const colorScheme = useColorScheme();
  const { fontSize, lineHeight } = useFontSizeStore();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const scrollRef = useRef<ScrollView>(null);

  // Header opacity based on scroll
  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Settings panel slide in/out
  const settingsPosition = settingsAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
    extrapolate: "clamp",
  });

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
          languages_available: ["en", "de", "ar"],
        };

        setPrayerData(mockPrayer);

        // Set default translation language
        if (mockPrayer.languages_available.includes(language)) {
          setSelectedTranslationLanguage(language);
        } else {
          setSelectedTranslationLanguage(
            mockPrayer.languages_available[0] || "en"
          );
        }
      } catch (error) {
        console.error("Error fetching prayer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayerData();
  }, [prayerId, prayerTitle, language]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      if (!prayerId) return;

      const id = parseInt(prayerId, 10);
      if (isNaN(id)) return;

      if (isFavorite) {
        await removePrayerFromFavorite(id);
        setIsFavorite(false);
      } else {
        await addPrayerToFavorite(id);
        setIsFavorite(true);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  // Toggle settings panel
  const toggleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSettings(!showSettings);

    Animated.spring(settingsAnimation, {
      toValue: showSettings ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  };

  // Share prayer
  const handleShare = async () => {
    if (!prayerData) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

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

        if (selectedLanguages.translation) {
          shareText += `${
            segment.translations[selectedTranslationLanguage] ||
            segment.translations.en
          }\n`;
        }

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

  // Render language selection buttons
  const renderLanguageButtons = () => {
    if (!prayerData) return null;

    return (
      <View style={styles.languageButtonsContainer}>
        {prayerData.languages_available.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageButton,
              selectedTranslationLanguage === lang &&
                styles.languageButtonActive,
            ]}
            onPress={() => {
              setSelectedTranslationLanguage(lang);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Text
              style={[
                styles.languageButtonText,
                selectedTranslationLanguage === lang &&
                  styles.languageButtonTextActive,
              ]}
            >
              {lang.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#10172b", "#1e2a4a"]
            : ["#edf4ff", "#ffffff"]
        }
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#4878e0" />
        <Text
          style={{
            marginTop: 12,
            color: colorScheme === "dark" ? "#b3c5ef" : "#4878e0",
            fontSize: 16,
          }}
        >
          Loading prayer...
        </Text>
      </LinearGradient>
    );
  }

  if (!prayerData) {
    return (
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#10172b", "#1e2a4a"]
            : ["#edf4ff", "#ffffff"]
        }
        style={styles.loadingContainer}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colorScheme === "dark" ? "#f87171" : "#ef4444"}
        />
        <Text
          style={{
            marginTop: 12,
            color: colorScheme === "dark" ? "#b3c5ef" : "#4878e0",
            fontSize: 16,
            textAlign: "center",
          }}
        >
          Unable to load prayer content. Please try again later.
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#10172b", "#1e2a4a"]
            : ["#edf4ff", "#ffffff"]
        }
        style={StyleSheet.absoluteFillObject}
      />

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
        <LinearGradient
         colors={
          colorScheme === "dark"
            ? ["#1e5c3f", "#0c2d1e"]  // Deep forest green
            : ["#3cb371", "#2e8b57"]  // Bright medium sea green
        }
          style={styles.prayerHeaderGradient}
        >
          <View style={styles.prayerHeader}>
            <View style={styles.prayerTitleContainer}>
              <Text style={styles.prayerTitle}>{prayerData.title}</Text>
              <Text style={styles.prayerArabicTitle}>
                {prayerData.arabicTitle}
              </Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleFavorite}
              >
                <Ionicons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={22}
                  color="#ffffff"
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={toggleSettings}
              >
                <Ionicons name="text" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Introduction Card */}
        {prayerData.introduction && (
          <View style={styles.introductionCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#1d2f53", "#253862"]
                  : ["#d6e2ff", "#e6eeff"]
              }
              style={styles.introductionGradient}
            >
              <Text
                style={[
                  styles.introductionText,
                  {
                    fontSize: fontSize - 1,
                    lineHeight: lineHeight - 2,
                  },
                ]}
              >
                {prayerData.introduction}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Language Selection */}
        <View style={styles.languageSelectorContainer}>
          {renderLanguageButtons()}

          <View style={styles.displayToggles}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedLanguages.arabic
                  ? styles.toggleActive
                  : styles.toggleInactive,
              ]}
              onPress={() => {
                setSelectedLanguages({
                  ...selectedLanguages,
                  arabic: !selectedLanguages.arabic,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedLanguages.arabic
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive,
                ]}
              >
                Arabic
              </Text>
              <Ionicons
                name={
                  selectedLanguages.arabic
                    ? "checkmark-circle"
                    : "circle-outline"
                }
                size={16}
                color={
                  selectedLanguages.arabic
                    ? "#38bdf8"
                    : colorScheme === "dark"
                    ? "#8098d0"
                    : "#5d8adb"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                selectedLanguages.transliteration
                  ? styles.toggleActive
                  : styles.toggleInactive,
              ]}
              onPress={() => {
                setSelectedLanguages({
                  ...selectedLanguages,
                  transliteration: !selectedLanguages.transliteration,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  selectedLanguages.transliteration
                    ? styles.toggleTextActive
                    : styles.toggleTextInactive,
                ]}
              >
                Transliteration
              </Text>
              <Ionicons
                name={
                  selectedLanguages.transliteration
                    ? "checkmark-circle"
                    : "circle-outline"
                }
                size={16}
                color={
                  selectedLanguages.transliteration
                    ? "#38bdf8"
                    : colorScheme === "dark"
                    ? "#8098d0"
                    : "#5d8adb"
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prayer Segments - Connected Flow */}
        <View style={styles.prayerFlowContainer}>
          {prayerData.segments.map((segment, index) => (
            <View
              key={index}
              style={[
                styles.prayerSegment,
                index === 0 && styles.firstSegment,
                index === prayerData.segments.length - 1 && styles.lastSegment,
              ]}
            >
              {/* Arabic Text */}
              {selectedLanguages.arabic && (
                <Text
                  style={[
                    styles.arabicText,
                    {
                      fontSize: fontSize + 6,
                      lineHeight: lineHeight + 10,
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
                    },
                  ]}
                >
                  {segment.transliteration}
                </Text>
              )}

              {/* Translation */}
              {selectedLanguages.translation && (
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
                    },
                  ]}
                >
                  {segment.translations[selectedTranslationLanguage] ||
                    segment.translations.en}
                </Text>
              )}

              {/* Subtle divider between segments (except last) */}
              {index < prayerData.segments.length - 1 && (
                <View style={styles.segmentDivider} />
              )}
            </View>
          ))}
        </View>

        {/* Notes Section (if available) */}
        {prayerData.notes && (
          <View style={styles.notesContainer}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#1d2f53", "#253862"]
                  : ["#d6e2ff", "#e6eeff"]
              }
              style={styles.notesGradient}
            >
              <Text style={styles.notesTitle}>Notes</Text>
              <Text
                style={[
                  styles.notesText,
                  {
                    fontSize: fontSize - 1,
                    lineHeight: lineHeight - 2,
                  },
                ]}
              >
                {prayerData.notes}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Source Citation */}
        {prayerData.source && (
          <View style={styles.sourceContainer}>
            <Text style={styles.sourceText}>Source: {prayerData.source}</Text>
          </View>
        )}

        {/* Bottom padding for safe area */}
        <View style={{ height: 20 + insets.bottom }} />
      </ScrollView>

      {/* Settings Panel */}
      <Animated.View
        style={[
          styles.settingsPanel,
          {
            paddingBottom: insets.bottom + 20,
            transform: [{ translateY: settingsPosition }],
          },
        ]}
      >
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#253862", "#1d2f53"]
              : ["#e6eeff", "#d6e2ff"]
          }
          style={styles.settingsPanelGradient}
        >
          <View style={styles.settingsPanelHeader}>
            <Text style={styles.settingsPanelTitle}>Display Settings</Text>
            <TouchableOpacity onPress={toggleSettings}>
              <Ionicons
                name="close-circle"
                size={24}
                color={colorScheme === "dark" ? "#b3c5ef" : "#4878e0"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsList}>
            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                setSelectedLanguages({
                  ...selectedLanguages,
                  arabic: !selectedLanguages.arabic,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name="language-outline"
                  size={22}
                  color={colorScheme === "dark" ? "#b3c5ef" : "#4878e0"}
                  style={styles.settingsItemIcon}
                />
                <Text style={styles.settingsItemText}>Show Arabic Text</Text>
              </View>
              <Ionicons
                name={selectedLanguages.arabic ? "checkbox" : "square-outline"}
                size={22}
                color={
                  selectedLanguages.arabic
                    ? "#38bdf8"
                    : colorScheme === "dark"
                    ? "#8098d0"
                    : "#5d8adb"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                setSelectedLanguages({
                  ...selectedLanguages,
                  transliteration: !selectedLanguages.transliteration,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name="text-outline"
                  size={22}
                  color={colorScheme === "dark" ? "#b3c5ef" : "#4878e0"}
                  style={styles.settingsItemIcon}
                />
                <Text style={styles.settingsItemText}>
                  Show Transliteration
                </Text>
              </View>
              <Ionicons
                name={
                  selectedLanguages.transliteration
                    ? "checkbox"
                    : "square-outline"
                }
                size={22}
                color={
                  selectedLanguages.transliteration
                    ? "#38bdf8"
                    : colorScheme === "dark"
                    ? "#8098d0"
                    : "#5d8adb"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                setSelectedLanguages({
                  ...selectedLanguages,
                  translation: !selectedLanguages.translation,
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name="globe-outline"
                  size={22}
                  color={colorScheme === "dark" ? "#b3c5ef" : "#4878e0"}
                  style={styles.settingsItemIcon}
                />
                <Text style={styles.settingsItemText}>Show Translation</Text>
              </View>
              <Ionicons
                name={
                  selectedLanguages.translation ? "checkbox" : "square-outline"
                }
                size={22}
                color={
                  selectedLanguages.translation
                    ? "#38bdf8"
                    : colorScheme === "dark"
                    ? "#8098d0"
                    : "#5d8adb"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.settingsItem}
              onPress={() => {
                setFontSizeModalVisible(true);
                toggleSettings();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.settingsItemLeft}>
                <Ionicons
                  name="text"
                  size={22}
                  color={colorScheme === "dark" ? "#b3c5ef" : "#4878e0"}
                  style={styles.settingsItemIcon}
                />
                <Text style={styles.settingsItemText}>Adjust Font Size</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={colorScheme === "dark" ? "#8098d0" : "#5d8adb"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeSettingsButton}
            onPress={toggleSettings}
          >
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#2a4080", "#162851"]
                  : ["#5b8af5", "#3b6ef8"]
              }
              style={styles.closeButtonGradient}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Font Size Picker Modal */}
      <FontSizePickerModal
        visible={fontSizeModalVisible}
        onClose={() => setFontSizeModalVisible(false)}
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
  // Floating header styles
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  floatingHeaderGradient: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(99, 146, 237, 0.3)",
    paddingBottom: 8,
  },
  floatingHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  floatingHeaderTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    color: "#4878e0",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
  },
  // Colorful Prayer header
  prayerHeaderGradient: {
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#4878e0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  prayerTitleContainer: {
    flex: 1,
  },
  prayerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    color: "#ffffff",
  },
  prayerArabicTitle: {
    fontSize: 18,
    fontWeight: "600",
    writingDirection: "rtl",
    color: "#d4e3ff",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  // Introduction card with gradient
  introductionCard: {
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#4878e0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  introductionGradient: {
    padding: 16,
  },
  introductionText: {
    lineHeight: 22,
    color: "#4878e0",
  },
  // Language selection styles
  languageSelectorContainer: {
    marginBottom: 20,
  },
  languageButtonsContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "rgba(99, 146, 237, 0.2)",
  },
  languageButtonActive: {
    backgroundColor: "#4878e0",
  },
  languageButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4878e0",
  },
  languageButtonTextActive: {
    color: "#ffffff",
  },
  displayToggles: {
    flexDirection: "row",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
  },
  toggleActive: {
    backgroundColor: "rgba(99, 146, 237, 0.2)",
  },
  toggleInactive: {
    backgroundColor: "rgba(99, 146, 237, 0.1)",
    opacity: 0.8,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#4878e0",
  },
  toggleTextInactive: {
    color: "#8098d0",
  },
  // Connected prayer flow styles
  prayerFlowContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#4878e0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  prayerSegment: {
    padding: 16,
    paddingBottom: 8,
    paddingTop: 8,
    backgroundColor: "transparent",
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
    color: "#2563eb",
  },
  transliterationText: {
    textAlign: "left",
    fontStyle: "italic",
    marginBottom: 4,
    color: "#6b7280",
  },
  translationText: {
    textAlign: "left",
    color: "#1f2937",
  },
  segmentDivider: {
    height: 1,
    backgroundColor: "rgba(99, 146, 237, 0.2)",
    marginTop: 10,
    marginBottom: 2,
  },
  // Notes with gradient
  notesContainer: {
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#4878e0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
  },
  notesGradient: {
    padding: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#4878e0",
  },
  notesText: {
    fontStyle: "italic",
    color: "#4878e0",
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
    color: "#6b7280",
  },
  // Settings panel with gradient
  settingsPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  settingsPanelGradient: {
    paddingTop: 16,
    paddingHorizontal: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  settingsPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingsPanelTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4878e0",
  },
  settingsList: {
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(99, 146, 237, 0.2)",
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
    color: "#4878e0",
  },
  closeSettingsButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#4878e0",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  closeButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default RenderPrayer;
