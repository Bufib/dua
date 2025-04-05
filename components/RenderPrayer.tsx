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
  TextStyle,
} from "react-native";
import React, {
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { getPrayerWithTranslations } from "@/utils/initializeDatabase";
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
import Markdown, { RenderRules } from "react-native-markdown-display";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { mapLanguage } from "@/utils/mapLanguage";
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
import { Stack } from "expo-router";
// Custom markdown rule to render text with colored Arabic diacritics
const markdownRules = (
  customFontSize: number,
  textColor: string
): RenderRules => ({
  text: (
    node: any,
    children: any,
    parent: any,
    styles: any
  ): React.ReactNode => {
    if (!node || !node.content) return children || null;
    const text = node.content;
    // Regex to split Arabic diacritics globally and test them non-globally
    const diacriticRegexGlobal = /([\u064B-\u0652])/g;
    const diacriticRegex = /[\u064B-\u0652]/;
    const parts = text.split(diacriticRegexGlobal);
    return (
      <Text
        key={node.key}
        style={{ fontSize: customFontSize, ...styles.text, color: textColor }}
      >
        {parts.map((part: string, index: number) =>
          diacriticRegex.test(part) ? (
            <Text key={index} style={{ color: Colors.universal.primary }}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  },

  // Add or modify the code_inline rule to render inline code as normal text
  code_inline: (
    node: any,
    children: any,
    parent: any,
    styles: any
  ): React.ReactNode => (
    <Text
      key={node.key}
      style={{ fontSize: customFontSize, ...styles.text, color: textColor }}
    >
      `{node.content}`
    </Text>
  ),
});

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
  const [contentHeight, setContentHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const flashListRef = useRef<any>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const threshold = 50;

  // Show the scroll-up button only if scrolled down more than the threshold.
  const showScrollUp = scrollOffset > threshold;

  const scrollToTop = useCallback(() => {
    flashListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleScroll = useCallback((event) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  }, []);
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
  const formattedPrayer = useMemo(() => {
    if (!prayers) return null;

    const arabicLines = processLines(prayers?.arabic_text);
    const transliterationLines = processLines(prayers.transliteration_text);

    // Map the translations by matching the language code from the translated_languages list.
    const translations = prayers.translated_languages.map((lang) => {
      const code = lang.slice(0, 2).toUpperCase();
      const translation = prayers.translations.find(
        (t) => t.language_code.toUpperCase() === code
      );
      return {
        language: lang,
        lines: processLines(translation?.translated_text || ""),
      };
    });

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

  // Use useMemo to select the notes for the current language
  const notesForCurrentLanguage = useMemo(() => {
    if (!prayers) return "";
    if (language.toUpperCase() === "AR") {
      return prayers?.arabic_notes || "";
    } else {
      const currentTranslation = prayers.translations.find(
        (t) => t.language_code.toUpperCase() === language.toUpperCase()
      );
      return currentTranslation?.translated_notes || "";
    }
  }, [prayers, language]);

  return (
    <GestureHandlerRootView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <Stack.Screen options={{ headerTitle: prayers?.name }} />
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: Colors[colorScheme].prayerHeaderBackground },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text
              style={[styles.title, { fontSize: fontSize * 0.9 }]}
              numberOfLines={1}
            >
              {prayers?.name} ({indices.length} {t("lines")})
            </Text>
            <Text
              style={[styles.arabicTitle, { fontSize: fontSize * 0.9 }]}
              numberOfLines={1}
            >
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
              <AntDesign name="heart" size={25} color={Colors.universal.favoriteIcon} />
            ) : (
              <AntDesign name="hearto" size={25} color={Colors.universal.favoriteIcon} />
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
        <>
          <FlashList
            ref={flashListRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={indices}
            ListHeaderComponent={
              <>
                {prayers?.translations.find((t) => t.language_code === language)
                  ?.translated_introduction && (
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
                          fontSize: fontSize * 0.9,
                          lineHeight: lineHeight * 0.9,
                        },
                      }}
                    >
                      {
                        prayers.translations.find(
                          (t) => t.language_code === language
                        )?.translated_introduction
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
                      backgroundColor: Colors[colorScheme].prayerBookmark,
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
                        rules={markdownRules(
                          fontSize * 1.3,
                          Colors[colorScheme].text
                        )}
                        style={{
                          body: {
                            ...styles.arabicText,
                            color: Colors[colorScheme].prayerArabicText,
                            fontSize: fontSize * 1.2,
                            lineHeight: lineHeight * 1.2,
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
                      rules={markdownRules(
                        fontSize * 0.8,
                        Colors[colorScheme].prayerTransliterationText
                      )}
                      style={{
                        body: {
                          ...styles.transliterationText,
                          borderBottomColor: Colors[colorScheme].border,
                          color: Colors[colorScheme].prayerTransliterationText,
                          fontSize: fontSize * 0.8, // Slightly smaller
                          lineHeight: lineHeight * 0.8,
                        },
                        code_inline: {},
                      }}
                    >
                      {transliterationLine.text}
                    </Markdown>
                  )}
                  {/* Translations */}
                  {currentTranslations.map((translation, idx) => (
                    <View key={idx} style={styles.translationBlock}>
                      <Text
                        style={[
                          styles.translationLabel,
                          {
                            color: Colors[colorScheme].prayerButtonText,
                          },
                        ]}
                      >
                        {translation.language}
                      </Text>
                      <Markdown
                        rules={markdownRules(
                          fontSize,
                          Colors[colorScheme].text
                        )}
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
            ListFooterComponentStyle={{ paddingBottom: 20 }}
            ListFooterComponent={
              // Directly use the conditional rendering expression
              notesForCurrentLanguage && (
                <View
                  style={[
                    styles.notesContainer,
                    styles.prayerSegment,
                    { backgroundColor: Colors.universal.secondary },
                  ]}
                >
                  <ThemedText style={styles.notesTitle} type="subtitle">
                    {t("notes")}
                  </ThemedText>
                  <Markdown
                    rules={markdownRules(
                      fontSize * 0.9,
                      Colors[colorScheme].text
                    )}
                    style={{
                      body: {
                        ...styles.notesText, // Make sure styles.notesText is defined
                        color: Colors[colorScheme].text,
                        fontSize: fontSize * 0.9,
                        lineHeight: lineHeight * 0.9,
                      },
                    }}
                  >
                    {notesForCurrentLanguage}
                  </Markdown>
                </View>
              )
            }
          />
          {showScrollUp && (
            <TouchableOpacity style={styles.scrollButton} onPress={scrollToTop}>
              <AntDesign name="up" size={24} color="white" />
            </TouchableOpacity>
          )}
        </>
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
    padding: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
    gap: 10,
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
    marginHorizontal: 10,
    marginBottom: 16,
    borderRadius: 12,
    padding: 15,
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
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  translationBlock: {
    marginBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 20,
  },
  translationLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  translationText: {
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
    gap: 10,
  },
  bottomSheetText: {
    fontSize: 20,
    fontWeight: 500,
    textAlign: "center",
  },
  notesContainer: {},
  notesTitle: {},
  notesText: {},
  scrollButtonsContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    flexDirection: "row",
  },
  scrollButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 25,
  },
});
