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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { CoustomTheme } from "@/utils/coustomTheme";
import Storage from "expo-sqlite/kv-store";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/utils/useLogout";
import { getQuestionCount } from "@/utils/initializeDatabase";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import { Image } from "expo-image";
import DeleteUserModal from "@/components/DeleteUserModal";
import Toast from "react-native-toast-message";
import useNotificationStore from "@/stores/notificationStore";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase.ts";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { NoInternet } from "@/components/NoInternet";
const Settings = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const themeStyles = CoustomTheme();
  const clearSession = useAuthStore.getState().clearSession;
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [payPalLink, setPayPalLink] = useState<string | null>("");
  const [version, setVersion] = useState<string | null>("");
  const [questionCount, setQuestionCount] = useState<number | null>(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { getNotifications, toggleGetNotifications } = useNotificationStore();
  const dbInitialized = useInitializeDatabase();
  const hasInternet = useConnectionStatus();
  const logout = useLogout();

  const handleDeleteSuccess = () => {
    clearSession(); // SignOut and remove session
    router.replace("/(tabs)/home/");
    Toast.show({
      type: "success",
      text1: "Account erfolgreich gelöscht!",
      text1Style: { fontWeight: "500" },
      topOffset: 60,
    });
  };

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

      // Get the version count
      const countQuestions = async () => {
        const count = await getQuestionCount();
        setQuestionCount(count);
      };
      countQuestions();
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

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle} type="title">
          Einstellungen
        </ThemedText>

        <Pressable
          onPress={
            isLoggedIn ? logout : () => router.push("/(auth)/login")
          }
          style={({ pressed }) => [
            styles.buttonContainer,
            {
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <ThemedText style={[styles.loginButtonText]}>
            {isLoggedIn ? "Abmelden" : "Anmelden"}
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <NoInternet showToast={false} showUI={true} />
        <View style={styles.section}>
          {isLoggedIn ? (
            <ThemedText style={styles.sectionTitle}>
              Darstellung & Benachrichtigung
            </ThemedText>
          ) : (
            <ThemedText style={styles.sectionTitle}>Darstellung</ThemedText>
          )}

          <View style={styles.settingRow}>
            <View>
              <ThemedText style={styles.settingTitle}>Dunkelmodus</ThemedText>
              <ThemedText style={styles.settingSubtitle}>
                Dunkles Erscheinungsbild aktivieren
              </ThemedText>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{
                false: Colors.light.trackColor,
                true: Colors.dark.trackColor,
              }}
              thumbColor={
                isDarkMode ? Colors.light.thumbColor : Colors.dark.thumbColor
              }
            />
          </View>
          {isLoggedIn && (
            <View style={styles.settingRow}>
              <View>
                <ThemedText style={styles.settingTitle}>
                  Benachrichtigungen
                </ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Push-Benachrichtigungen erhalten
                </ThemedText>
              </View>
              <Switch
                value={getNotifications}
                onValueChange={hasInternet ? toggleGetNotifications : undefined}
                trackColor={{
                  false: Colors.light.trackColor,
                  true: Colors.dark.trackColor,
                }}
                thumbColor={
                  isDarkMode ? Colors.light.thumbColor : Colors.dark.thumbColor
                }
              />
            </View>
          )}
        </View>

        {isLoggedIn && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>

            <Pressable
              style={styles.settingButton}
              onPress={() => router.push("/(auth)/forgotPassword")}
            >
              <Text style={styles.settingButtonText}>Passwort ändern</Text>
            </Pressable>

            <Pressable
              style={[styles.settingButton, styles.deleteButton]}
              onPress={() => setOpenDeleteModal(true)}
            >
              <ThemedText
                style={[styles.settingButtonText, styles.deleteButtonText]}
              >
                Account löschen
              </ThemedText>
            </Pressable>
          </View>
        )}

        <Pressable
          style={styles.paypalButton}
          onPress={() => payPalLink && handleOpenExternalUrl(payPalLink)}
        >
          <Image
            source={require("@/assets/images/paypal.png")}
            style={styles.paypalImage}
          />
        </Pressable>

        <View style={styles.infoSection}>
          <ThemedText style={styles.questionCount}>
            Fragen in der Datenbank: {questionCount}
          </ThemedText>

          {isAdmin && isLoggedIn && (
            <ThemedText style={styles.versionText}>
              Version: {version}
            </ThemedText>
          )}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() =>
              handleOpenExternalUrl(
                "https://bufib.github.io/Islam-Fragen-App-rechtliches/datenschutz"
              )
            }
          >
            <ThemedText style={styles.footerLink}>Datenschutz</ThemedText>
          </Pressable>

          <Pressable onPress={() => router.push("/settings/about")}>
            <ThemedText style={styles.footerLink}>Über die App</ThemedText>
          </Pressable>

          <Pressable onPress={() => router.push("/settings/impressum")}>
            <ThemedText style={styles.footerLink}>Impressum</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <DeleteUserModal
        isVisible={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onDeleteSuccess={handleDeleteSuccess}
        serverUrl="https://tdjuwrsspauybgfywlfr.supabase.co/functions/v1/delete-account"
      />
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
    paddingLeft: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {},
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    paddingRight: 15,
    backgroundColor: "transparent",
  },
  loginButtonText: {
    color: Colors.universal.link,
    fontSize: 19,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    opacity: 0.8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingButton: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#ccc",
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "rgba(255,0,0,0.1)",
  },
  deleteButtonText: {
    color: "#ff4444",
  },
  paypalButton: {
    alignItems: "center",
    padding: 20,
  },
  paypalImage: {
    height: 70,
    aspectRatio: 2,
  },
  infoSection: {
    alignItems: "center",
    padding: 20,
  },
  questionCount: {
    fontSize: 16,
    opacity: 0.5,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  footerLink: {
    color: Colors.universal.link,
    fontSize: 16,
  },
});

export default Settings;
