import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Platform,
  ScrollView,
  useColorScheme,
  Alert,
} from "react-native";
import React, {
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  getPrayerWithTranslations,
  getRandomPrayerWithCategory,
} from "@/utils/initializeDatabase";
import { PrayerWithTranslations } from "@/utils/types";
import { useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import i18n from "@/utils/i18n";
import { Colors } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import Octicons from "@expo/vector-icons/Octicons";
import Markdown from "react-native-markdown-display";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import {
  addPrayerToFavorite,
  removePrayerFromFavorite,
  isPrayerInFavorite,
} from "@/utils/initializeDatabase";
// Import refresh favorites hook from Zustand
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
// Import font size functionality
import FontSizePickerModal from "./FontSizePickerModal";
import { useFontSizeStore } from "@/stores/fontSizeStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Storage } from "expo-sqlite/kv-store";
import { FlashList } from "@shopify/flash-list";

const RenderPrayer = () => {
  const { prayerId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [prayers, setPrayers] = useState<PrayerWithTranslations | null>(null);
  const { language } = useLanguage();
  // State to track which translations are selected.
  const [selectTranslations, setSelectTranslations] = useState<
    Record<string, boolean>
  >({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookmark, setBookmark] = useState<number | null>(null);
  const colorScheme = useColorScheme() || "light";
  const { t } = i18n;
  const flashListRef = useRef(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const handleOpenBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const snapPoints = useMemo(() => ["50%"], []);

  // Get the trigger function to refresh favorites via Zustand.
  const { triggerRefreshFavorites } = useRefreshFavorites();

  // Font size state and modal control
  const { fontSize, lineHeight } = useFontSizeStore();
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);

  useLayoutEffect(() => {
    const fetchPrayerData = async () => {
      try {
        setIsLoading(true);
        const prayer = await getPrayerWithTranslations(
          parseInt(prayerId[0], 10)
        );
        setPrayers(prayer);
        // Optionally check if this prayer is in favorites initially:
        const inFavorite = await isPrayerInFavorite(parseInt(prayerId[0], 10));
        setIsFavorite(inFavorite);
      } catch (error: any) {
        console.log("RenderPrayer fetchPrayerData " + error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrayerData();
  }, [prayerId]);

  // Initialize default selected translations using first two letters uppercased.
  useEffect(() => {
    if (prayers) {
      const initialSelection: Record<string, boolean> = {};
      prayers.translated_languages.forEach((lang) => {
        const normalizedLang = lang.slice(0, 2).toUpperCase();
        initialSelection[lang] = normalizedLang === language;
      });
      setSelectTranslations(initialSelection);
    }
  }, [prayers, language]);

  // Handle favorite toggle using heart icon.
  const handleFavoriteToggle = async () => {
    try {
      const pId = parseInt(prayerId[0], 10);
      if (isFavorite) {
        await removePrayerFromFavorite(pId);
        setIsFavorite(false);
      } else {
        await addPrayerToFavorite(pId);
        setIsFavorite(true);
      }
      // Trigger a refresh in the favorites store so that any favorites list updates.
      triggerRefreshFavorites();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Format the prayer data.
  // const formattedPrayer = useMemo(() => {
  //   if (!prayers) return null;
  //   const arabicLines = prayers.arabic_text
  //     ? prayers.arabic_text.split("\n").filter((line) => line.trim() !== "")
  //     : [];
  //   const transliterationLines = prayers.transliteration_text
  //     ? prayers.transliteration_text
  //         .split("\n")
  //         .filter((line) => line.trim() !== "")
  //     : [];
  //   const translations = prayers.translations.map((translation, index) => ({
  //     language:
  //       prayers.translated_languages[index] || translation.language_code,
  //     lines: translation.main_body
  //       ? translation.main_body.split("\n").filter((line) => line.trim() !== "")
  //       : [],
  //   }));
  //   return { arabicLines, transliterationLines, translations };
  // }, [prayers]);

  // Format the prayer data.
  const formattedPrayer = useMemo(() => {
    if (!prayers) return null;
    const processLines = (text: string | undefined) => {
      return (
        text
          ?.split("\n")
          .filter((line) => line.trim() !== "")
          .map((line) => {
            const hasAtSymbol = line.includes("@");
            return {
              text: line.replace(/@/g, "").trim(),
              hasAtSymbol,
            };
          }) || []
      );
    };

    const arabicLines = processLines(prayers.arabic_text);
    const transliterationLines = processLines(prayers.transliteration_text);
    const translations = prayers.translations.map((translation, index) => ({
      language:
        prayers.translated_languages[index] || translation.language_code,
      lines: processLines(translation.main_body || ""),
    }));
    return { arabicLines, transliterationLines, translations };
  }, [prayers]);

  // Compute maximum number of lines.
  const indices = useMemo(() => {
    if (!formattedPrayer) return [];
    const maxLines = Math.max(
      formattedPrayer.arabicLines.length,
      formattedPrayer.transliterationLines.length,
      ...formattedPrayer.translations.map((t) => t.lines.length)
    );
    return Array.from({ length: maxLines }, (_, i) => i);
  }, [formattedPrayer]);

  const handleBookmark = (index: number) => {
    if (bookmark === index) {
      removeBookmark();
    } else if (bookmark) {
      Alert.alert(t("confirmBookmarkChange"), t("bookmarkReplaceQuestion"), [
        {
          text: t("replace"),
          onPress: () => addBookmark(index),
        },
        {
          text: t("cancel"),
          style: "cancel",
        },
      ]);
    } else {
      addBookmark(index);
    }
  };

  const addBookmark = (index: number) => {
    try {
      Storage.setItemSync(`Bookmark-${prayerId}`, index.toString());
      setBookmark(index);
      console.log(bookmark);
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  const removeBookmark = () => {
    try {
      Storage.removeItemSync(`Bookmark-${prayerId}`);
      setBookmark(null);
    } catch (error: any) {
      Alert.alert(error);
    }
  };

  useEffect(() => {
    const getCurrentBookmark = () => {
      try {
        const storedBookmark = Storage.getItemSync(`Bookmark-${prayerId}`);
        setBookmark(storedBookmark ? parseInt(storedBookmark) : null);
      } catch (error) {
        console.error("Error loading bookmark:", error);
        setBookmark(null);
      }
    };
    getCurrentBookmark();
  }, [prayerId]);

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme].prayerHeaderBackground },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {prayers?.name}
            </Text>
            <Text style={styles.arabicTitle} numberOfLines={1}>
              {prayers?.arabic_title}
            </Text>
          </View>
          <View style={styles.headerControls}>
            {/* Information button */}

            {/* Information button */}
            <TouchableOpacity onPress={handleOpenBottomSheet}>
              <Ionicons
                name="information-circle-outline"
                size={32}
                color="white"
              />
            </TouchableOpacity>
          </View>

          {/* Font Size Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setFontSizeModalVisible(true)}
          >
            <Ionicons name="text" size={28} color="white" />
          </TouchableOpacity>

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleFavoriteToggle}
          >
            {isFavorite ? (
              <AntDesign name="heart" size={25} color="white" />
            ) : (
              <AntDesign name="hearto" size={25} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Colors[colorScheme].prayerLoadingIndicator}
          />
        </View>
      ) : (
        <FlashList
          data={indices}
          ListHeaderComponent={
            <>
              {prayers?.translations.find((t) => t.language_code === language)
                ?.introduction && (
                <View
                  style={[
                    styles.introContainer,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? Colors.dark.prayerIntroductionBackground
                          : Colors.light.prayerIntroductionBackground,
                    },
                  ]}
                >
                  <Markdown
                    style={{
                      body: {
                        ...styles.introText,
                        color: Colors[colorScheme].text,
                        fontSize: fontSize * 0.75,
                        lineHeight: lineHeight * 0.75,
                      },
                    }}
                  >
                    {
                      prayers.translations.find(
                        (t) => t.language_code === language
                      )?.introduction
                    }
                  </Markdown>
                </View>
              )}

              {/* Language Selection */}
              <View style={styles.languageSelectContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.languageButtons}
                >
                  {prayers?.translated_languages.map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      style={[
                        styles.languageButton,
                        selectTranslations[lang]
                          ? {
                              backgroundColor:
                                Colors[colorScheme]
                                  .prayerButtonBackgroundActive,
                            }
                          : {
                              backgroundColor:
                                colorScheme === "dark"
                                  ? "rgba(96, 96, 96, 0.2)"
                                  : "rgba(0, 0, 0, 0.05)",
                            },
                      ]}
                      onPress={() =>
                        setSelectTranslations((prev) => ({
                          ...prev,
                          [lang]: !prev[lang],
                        }))
                      }
                    >
                      <Text
                        style={[
                          styles.languageButtonText,
                          selectTranslations[lang]
                            ? {
                                color:
                                  Colors[colorScheme].prayerButtonTextActive,
                              }
                            : { color: Colors[colorScheme].text },
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </>
          }
          renderItem={({ item: index }) => {
            if (!formattedPrayer) return null;

            const arabicLine = formattedPrayer.arabicLines[index];
            const transliterationLine =
              formattedPrayer.transliterationLines[index];
            const currentTranslations = formattedPrayer.translations.filter(
              (translation) => selectTranslations[translation.language]
            );

            const hasAtSymbolInArabic = arabicLine?.hasAtSymbol;
            const hasAtSymbolInTranslation = currentTranslations.some(
              (t) => t.lines[index]?.hasAtSymbol
            );

            return (
              <View
                key={index}
                style={[
                  styles.prayerSegment,
                  { backgroundColor: Colors[colorScheme].contrast },
                  (hasAtSymbolInArabic || hasAtSymbolInTranslation) && {
                    backgroundColor: Colors[colorScheme].renderPrayerNotiz,
                  },
                  bookmark === index + 1 && {
                    backgroundColor: Colors.universal.primary,
                  },
                ]}
              >
                {/* Line Number Badge */}
                <View style={styles.lineNumberBadge}>
                  <Text style={styles.lineNumber}>{index + 1}</Text>
                </View>
                {/* Arabic Text */}
                {arabicLine && (
                  <View
                    style={{
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    {bookmark === index + 1 ? (
                      <Octicons
                        name="bookmark-slash"
                        style={{ alignSelf: "flex-start" }}
                        size={20}
                        color={Colors[colorScheme].iconDefault}
                        onPress={() => handleBookmark(index + 1)}
                      />
                    ) : (
                      <Octicons
                        name="bookmark"
                        style={{ alignSelf: "flex-start" }}
                        size={20}
                        color={Colors[colorScheme].iconDefault}
                        onPress={() => handleBookmark(index + 1)}
                      />
                    )}

                    <Markdown
                      style={{
                        body: {
                          ...styles.arabicText,
                          color: Colors[colorScheme].prayerArabicText,
                          fontSize: fontSize * 1.1, // Slightly larger
                          lineHeight: lineHeight * 1.1,
                          ...(arabicLine.hasAtSymbol && {
                            alignSelf: "center",
                          }),
                        },
                      }}
                    >
                      {arabicLine.text}
                    </Markdown>
                  </View>
                )}
                {/* Transliteration */}
                {transliterationLine && (
                  <Markdown
                    style={{
                      body: {
                        ...styles.transliterationText,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors[colorScheme].border,
                        color: Colors[colorScheme].prayerTransliterationText,
                        fontSize: fontSize * 0.8, // Slightly smaller
                        lineHeight: lineHeight * 0.8,
                      },
                    }}
                  >
                    {transliterationLine.text}
                  </Markdown>
                )}
                {/* Translations */}
                {currentTranslations.map((translation, idx) => (
                  <View key={idx} style={styles.translationBlock}>
                    <Markdown
                      style={{
                        body: {
                          ...styles.translationLabel,
                          color: Colors[colorScheme].prayerButtonText,
                        },
                      }}
                    >
                      {translation.language}
                    </Markdown>
                    <Markdown
                      style={{
                        body: {
                          ...styles.translationText,
                          color: Colors[colorScheme].text,
                          fontSize: fontSize,
                          lineHeight: lineHeight,
                          ...(translation.lines[index]?.hasAtSymbol && {
                            alignSelf: "center",
                          }),
                        },
                      }}
                    >
                      {translation.lines[index]?.text || ""}
                    </Markdown>
                  </View>
                ))}
              </View>
            );
          }}
          estimatedItemSize={200}
          extraData={[bookmark, selectTranslations]}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Initially closed
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backgroundStyle={{ backgroundColor: Colors.universal.secondary }}
        style={styles.bottomSheetContainer}
      >
        <BottomSheetView style={styles.bottomSheet}>
          <Text
            style={[styles.bottomSheetText, { fontSize: 35, color: "#FFFFFF" }]}
          >
            `
          </Text>
          <Text style={styles.bottomSheetText}>
            {t("bottomInformationRenderPrayer")}
          </Text>
          <Text style={[styles.bottomSheetText, { color: "#FFFFFF" }]}>ع</Text>
          <Text style={[styles.bottomSheetText, { color: "#FFFFFF" }]}>
            (ayn)
          </Text>
        </BottomSheetView>
      </BottomSheet>

      {/* Font Size Picker Modal */}
      <FontSizePickerModal
        visible={fontSizeModalVisible}
        onClose={() => setFontSizeModalVisible(false)}
      />
    </GestureHandlerRootView>
  );
};
export default RenderPrayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  arabicTitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  introContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
  },
  languageSelectContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  languageButtons: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
    paddingBottom: 80,
  },
  prayerSegment: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  lineNumberBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  lineNumber: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  arabicText: {
    fontSize: 22,
    lineHeight: 36,
    textAlign: "right",
    fontWeight: "500",
    marginBottom: 16,
  },
  transliterationText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  translationBlock: {
    marginBottom: 12,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSheetContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    borderTopWidth: 3,
    borderRadius: 21,
  },
  bottomSheet: {
    flex: 1,
    flexDirection: "row",
    gap: 10
  },
  bottomSheetText: {
    fontSize: 20,
    fontWeight: 500,
    textAlign: "center",
  },
});
