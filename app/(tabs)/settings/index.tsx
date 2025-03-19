import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Switch,
  Appearance,
  Pressable,
  Text,
  ScrollView,
  Alert,
  Platform,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { CoustomTheme } from "@/utils/coustomTheme";
import Storage from "expo-sqlite/kv-store";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import { Image } from "expo-image";
import useNotificationStore from "@/stores/notificationStore";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase.ts";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { NoInternet } from "@/components/NoInternet";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "react-i18next";

const SettingCard = ({ children, style }: { children: any; style?: any }) => {
  const themeStyles = CoustomTheme();
  const colorScheme = useColorScheme();

  return (
    <View
      style={[
        styles.card,
        style,
        {
          backgroundColor:
            colorScheme === "dark"
              ? Colors.dark.contrast
              : Colors.light.contrast,
          shadowColor:
            colorScheme === "dark"
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.1)",
        },
      ]}
    >
      {children}
    </View>
  );
};

const Settings = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const themeStyles = CoustomTheme();
  const [payPalLink, setPayPalLink] = useState<string | null>("");
  const [version, setVersion] = useState<string | null>("");
  const [questionCount, setQuestionCount] = useState<number | null>(0);
  const { getNotifications, toggleGetNotifications } = useNotificationStore();
  const dbInitialized = useInitializeDatabase();
  const hasInternet = useConnectionStatus();
  const [fadeAnim] = useState(new Animated.Value(0));
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Available languages - matching those defined in i18n/index.ts
  const languages = [
    { code: "DE", name: t("german"), nativeName: "Deutsch" },
    { code: "AR", name: t("arabic"), nativeName: "العربية" },
    { code: "EN", name: "English", nativeName: "English" },
  ];

  // Get the current language name to display
  const getCurrentLanguageName = () => {
    const currentLang = languages.find((lang) => lang.code === language);
    return currentLang ? currentLang.nativeName : "";
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const savedColorSetting = Storage.getItemSync("isDarkMode");
    Appearance.setColorScheme(savedColorSetting === "true" ? "dark" : "light");
  }, []);

  // Get version and count and paypal
  useEffect(() => {
    if (!dbInitialized) return;

    try {
      // Get the version
      const version = Storage.getItemSync("version");
      setVersion(version);

      // Get the paypalLink
      const paypal = Storage.getItemSync("paypal");
      setPayPalLink(paypal);
    } catch (error: any) {
      Alert.alert("Fehler", error.message);
    }
  }, [dbInitialized]);

  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    Storage.setItemSync("isDarkMode", `${newDarkMode}`);
    setIsDarkMode(newDarkMode);
    Appearance.setColorScheme(newDarkMode ? "dark" : "light");
  };

  const handleLanguageChange = async (langCode: string) => {
    await changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} type="title">
          {t("settings")}
        </ThemedText>
      </View>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <NoInternet showToast={false} showUI={true} />

        <ThemedText style={styles.sectionTitle}>{t("theme")}</ThemedText>

        <SettingCard>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="moon"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <View>
                <ThemedText style={styles.settingTitle}>Dunkelmodus</ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Dunkles Erscheinungsbild aktivieren
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{
                false: "#E9E9EA",
                true: colorScheme === "dark" ? "#636366" : "#ACDBFE",
              }}
              thumbColor={isDarkMode ? "#FFFFFF" : "#FFFFFF"}
              ios_backgroundColor="#E9E9EA"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
        </SettingCard>

        <ThemedText style={[styles.sectionTitle, { marginTop: 30 }]}>
          {t("language")}
        </ThemedText>

        <SettingCard>
          <Pressable
            style={styles.linkItem}
            onPress={() => setLanguageModalVisible(true)}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="globe"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <View>
                <ThemedText style={styles.settingTitle}>
                  {t("language")}
                </ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  {getCurrentLanguageName()}
                </ThemedText>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colorScheme === "dark" ? "#8E8E93" : "#C7C7CC"}
            />
          </Pressable>
        </SettingCard>

        <SettingCard style={{ marginTop: 12 }}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="notifications"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <View>
                <ThemedText style={styles.settingTitle}>
                  Benachrichtigungen
                </ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Push-Benachrichtigungen erhalten
                </ThemedText>
              </View>
            </View>
            <Switch
              value={getNotifications}
              onValueChange={hasInternet ? toggleGetNotifications : undefined}
              trackColor={{
                false: "#E9E9EA",
                true: colorScheme === "dark" ? "#636366" : "#ACDBFE",
              }}
              thumbColor={getNotifications ? "#FFFFFF" : "#FFFFFF"}
              ios_backgroundColor="#E9E9EA"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
        </SettingCard>

        <ThemedText style={[styles.sectionTitle, { marginTop: 30 }]}>
          Unterstützen
        </ThemedText>

        <SettingCard>
          <Pressable
            style={styles.paypalButton}
            onPress={() => payPalLink && handleOpenExternalUrl(payPalLink)}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            <Image
              source={require("@/assets/images/paypal.png")}
              style={styles.paypalImage}
              contentFit="contain"
            />
          </Pressable>
        </SettingCard>

        <ThemedText style={[styles.sectionTitle, { marginTop: 30 }]}>
          Info & Rechtliches
        </ThemedText>

        <SettingCard>
          <Pressable
            onPress={() =>
              handleOpenExternalUrl(
                "https://bufib.github.io/Islam-Fragen-App-rechtliches/datenschutz"
              )
            }
            style={styles.linkItem}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <ThemedText style={styles.linkText}>Datenschutz</ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colorScheme === "dark" ? "#8E8E93" : "#C7C7CC"}
            />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => router.push("/settings/about")}
            style={styles.linkItem}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="information-circle"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <ThemedText style={styles.linkText}>{t("about")}</ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colorScheme === "dark" ? "#8E8E93" : "#C7C7CC"}
            />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            onPress={() => router.push("/settings/impressum")}
            style={styles.linkItem}
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons
                  name="document-text"
                  size={22}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                />
              </View>
              <ThemedText style={styles.linkText}>Impressum</ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colorScheme === "dark" ? "#8E8E93" : "#C7C7CC"}
            />
          </Pressable>
        </SettingCard>

        {version && (
          <View style={styles.versionContainer}>
            <ThemedText style={styles.versionText}>
              Version {version}
            </ThemedText>
          </View>
        )}
      </Animated.ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("selectLanguage")}
              </ThemedText>
              <Pressable
                onPress={() => setLanguageModalVisible(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colorScheme === "dark" ? "#FFFFFF" : "#000000"}
                />
              </Pressable>
            </View>

            <View style={styles.languageList}>
              {languages.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    language === lang.code && {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                    },
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  android_ripple={{ color: "rgba(0,0,0,0.1)" }}
                >
                  <View style={styles.languageInfo}>
                    <ThemedText style={styles.languageName}>
                      {lang.nativeName}
                    </ThemedText>
                    {lang.name !== lang.nativeName && (
                      <ThemedText style={styles.languageLocalName}>
                        {lang.name}
                      </ThemedText>
                    )}
                  </View>
                  {language === lang.code && (
                    <Ionicons
                      name="checkmark"
                      size={22}
                      color={colorScheme === "dark" ? "#FFFFFF" : "#007AFF"}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    marginLeft: 12,
  },
  card: {
    borderRadius: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginLeft: 60,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "500",
  },
  paypalButton: {
    alignItems: "center",
    padding: 16,
  },
  paypalImage: {
    height: 60,
    width: "80%",
  },
  versionContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  versionText: {
    fontSize: 13,
    opacity: 0.5,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 24, // Extra padding for iOS home indicator
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  languageList: {
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 4,
  },
  languageInfo: {
    flexDirection: "column",
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
  languageLocalName: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
});

export default Settings;
