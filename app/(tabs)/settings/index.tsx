import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Switch,
  Appearance,
  Pressable,
  Text,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import Storage from "expo-sqlite/kv-store";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/authStore";
import handleLogout from "@/utils/handleLogout";
import { getQuestionCount } from "@/utils/initializeDatabase";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import { Image } from "expo-image";
import DeleteUserModal from "@/components/DeleteUserModal";
import Toast from "react-native-toast-message";
import useNotificationStore from "@/stores/notificationStore";

const Settings = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const themeStyles = coustomTheme();
  const clearSession = useAuthStore.getState().clearSession;
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const [paypalLink, setPaypalLink] = useState<string>("");
  const [version, setVersion] = useState<string | null>("");
  const [questionCount, setQuestionCount] = useState<number | null>(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const { getNotifications, toggleGetNotifications } = useNotificationStore();

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

  // Get paypal link and version and count
  useLayoutEffect(() => {
    let isMounted = true; // ✅ Track if the component is still mounted

    const paypal = Storage.getItemSync("paypal");
    if (paypal) setPaypalLink(paypal);

    const version = Storage.getItemSync("version");
    setVersion(version);

    const countQuestions = async () => {
      const count = await getQuestionCount();
      if (isMounted) setQuestionCount(count);
    };
    countQuestions();

    return () => {
      isMounted = false; // ✅ Prevent state updates after unmount
    };
  }, []);

  // Function to handle colorswitch
  // const toggleDarkMode = async () => {
  //   Appearance.setColorScheme(isDarkMode ? "light" : "dark");
  //   setIsDarkMode((prev) => !prev);
  //   // isDarkMode changes after re-rendering (state) so I have to set it !isDarkMode
  //   Storage.setItemSync("isDarkMode", `${!isDarkMode}`);
  // };

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
        <ThemedText style={styles.headerTitle}>Einstellungen</ThemedText>
        <Pressable
          style={styles.loginButton}
          onPress={
            isLoggedIn ? handleLogout : () => router.push("/(auth)/login")
          }
        >
          <ThemedText style={styles.loginButtonText}>
            {isLoggedIn ? "Abmelden" : "Anmelden"}
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
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
                onValueChange={toggleGetNotifications}
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
          onPress={() => handleOpenExternalUrl(paypalLink)}
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
              Linking.openURL(
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  loginButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    opacity: 0.7,
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
