// src/screens/LanguageSelectionScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";

const LanguageSelectionScreen: React.FC = () => {
  const { t } = useTranslation();
  const { changeLanguage, completeFirstLaunch } = useLanguage();

  const handleLanguageSelect = async (language: string): Promise<void> => {
    await changeLanguage(language);
    await completeFirstLaunch();
  };

  // Type assertion for the image source

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("welcome")}</Text>
          <Text style={styles.subtitle}>{t("selectLanguage")}</Text>
        </View>

        <View style={styles.languageOptions}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect("de")}
          >
            <View style={styles.languageContent}>
              <Text style={styles.languageText}>{t("german")}</Text>
              <Text style={styles.nativeText}>Deutsch</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.languageButton}
            onPress={() => handleLanguageSelect("ar")}
          >
            <View style={styles.languageContent}>
              <Text style={styles.languageText}>{t("arabic")}</Text>
              <Text style={styles.nativeText}>العربية</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
  },
  languageOptions: {
    marginTop: 30,
  },
  languageButton: {
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  languageText: {
    fontSize: 18,
    fontWeight: "500",
  },
  nativeText: {
    fontSize: 18,
    color: "#666",
  },
});

export default LanguageSelectionScreen;
