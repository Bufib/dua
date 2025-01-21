import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Switch,
  Appearance,
  Pressable,
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
import Entypo from "@expo/vector-icons/Entypo";
import { useAuthStore } from "@/stores/authStore";
import handleLogout from "@/utils/handleLogout";
import { getQuestionCount } from "@/utils/initializeDatabase";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import { Image } from "expo-image";
import { Platform } from "react-native";
import { Alert } from "react-native";
const Settings = () => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const themeStyles = coustomTheme();
  const { isLoggedIn, restoreSession, clearSession, isAdmin } = useAuthStore();
  const [paypalLink, setPaypalLink] = useState<string>("");
  const [version, setVersion] = useState<string | null>("");
  const [questionCount, setQuestionCount] = useState<number | null>(0);

  const email = "frage@islamische-fragen.de";
  const subject = "Account Löschen";
  const body =
    "Salam, ich würde gerne mein Account löschen. Mein Benutzername lautet: Salam";

  useEffect(() => {
    const savedColorSetting = Storage.getItemSync("isDarkMode");
    Appearance.setColorScheme(savedColorSetting === "true" ? "dark" : "light");
  }, [isDarkMode]);

  // Get paypal link and version and count
  useLayoutEffect(() => {
    const paypal = Storage.getItemSync("paypal");
    if (paypal) {
      setPaypalLink(paypal);
    }

    const version = Storage.getItemSync("version");
    setVersion(version);
    const countQuestions = async () => {
      const count = await getQuestionCount();
      setQuestionCount(count);
    };
    countQuestions();
  }, []);

  // Function to handle colorswitch
  const toggleDarkMode = async () => {
    Appearance.setColorScheme(isDarkMode ? "light" : "dark");
    setIsDarkMode((prev) => !prev);
    // isDarkMode changes after re-rendering (state) so I have to set it !isDarkMode
    Storage.setItemSync("isDarkMode", `${!isDarkMode}`);
  };

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <ThemedView style={styles.headerContainer}>
        <ThemedText style={styles.headerText} type="title">
          Einstellungen
        </ThemedText>

        {isLoggedIn ? (
          <Entypo
            name="log-out"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
            onPress={handleLogout}
          />
        ) : (
          <Entypo
            name="login"
            size={24}
            color={colorScheme === "dark" ? "white" : "black"}
            onPress={() => router.push("/(auth)/login")}
          />
        )}
      </ThemedView>

      <ThemedView style={styles.contentContainer}>
        <View style={styles.togglebarContainer}>
          <View style={styles.toogleBar}>
            <ThemedText style={styles.label}>Dunkelmodus</ThemedText>
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
          <View style={styles.toogleBar}>
            <ThemedText style={styles.label}>Benachrichtigungen</ThemedText>
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
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: Colors.universal.borderBottomToggleSettings,
            }}
          ></View>
        </View>

        {isLoggedIn && (
          <>
            <ThemedText style={styles.linkText}>Account löschen</ThemedText>

            <ThemedText
              style={styles.linkText}
              onPress={() => router.push("/(tabs)/settings/changePassword")}
            >
              Passwort ändern
            </ThemedText>
          </>
        )}
        <Pressable
          onPress={() => {
            handleOpenExternalUrl(paypalLink);
          }}
        >
          <Image
            source={require("@/assets/images/paypal.png")}
            style={styles.paypalImage}
          />
        </Pressable>

        <ThemedText>
          Anzahl an Fragen in der Datenbank: {questionCount}
        </ThemedText>
      </ThemedView>

      {/* Push everything down */}
      <View style={{ flexGrow: 1 }} />

      {/* Legal Links */}
      <ThemedView style={styles.legalLinksContainer}>
        {isAdmin && isLoggedIn && (
          <ThemedText style={styles.versionText}>
            Version der Fragen in der App: {version}
          </ThemedText>
        )}
        <ThemedText
          style={styles.linkText}
          onPress={() =>
            Linking.openURL(
              "https://bufib.github.io/Islam-Fragen-App-rechtliches/datenschutz"
            )
          }
        >
          Datenschutz
        </ThemedText>
        <ThemedText
          style={styles.linkText}
          onPress={() => router.push("/settings/about")}
        >
          Über die App
        </ThemedText>
        <ThemedText
          style={styles.linkText}
          onPress={() => router.push("/settings/impressum")}
        >
          Impressum
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {},
  contentContainer: {
    flex: 1,
    marginTop: 20,
    gap: 10,
  },
  togglebarContainer: {
    flexDirection: "column",
  },

  toogleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  label: {
    fontSize: 18,
  },
  versionText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },
  legalLinksContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  linkText: {
    color: Colors.universal.link,
    fontSize: 18,
    marginBottom: 10,
  },
  paypalImage: {
    height: 70,
    aspectRatio: 2,
  },
});
