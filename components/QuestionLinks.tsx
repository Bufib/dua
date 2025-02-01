import React, { useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  FlatList,
  Button,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { Link, router } from "expo-router";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { coustomTheme } from "../utils/coustomTheme";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "./ThemedText";
import { QuestionType } from "@/utils/types";
import { getLatestQuestions } from "@/utils/initializeDatabase";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import LatestQuestions from "./LatestQuestions";
import RenderSearch from "./RenderSearch";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function QuestionLinks() {
  const themeStyles = coustomTheme();
  const { width } = useWindowDimensions();

  // Dynamically calculate the size of each element based on screen width
  const elementSize = width > 400 ? 120 : 100; // Element
  const fontSize = width > 400 ? 12 : 10; // Font of element text
  const iconSize = width > 400 ? 60 : 40; // Icon in element
  const imageSize = width > 400 ? 300 : 200; // Header image
  const gap = width > 400 ? 30 : 10; // Header image
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const colorScheme = useColorScheme();

  const categories = [
    {
      name: "Rechtsfragen",
      image: require("@/assets/images/rechtsfragen.png"),
    },
    {
      name: "Quran",
      image: require("@/assets/images/quran.png"),
    },
    {
      name: "Geschichte",
      image: require("@/assets/images/geschichte.png"),
    },
    {
      name: "Glaubensfragen",
      image: require("@/assets/images/glaubensfragen.png"),
    },
    {
      name: "Ethik",
      image: require("@/assets/images/ethik.png"),
    },
    {
      name: "Ratschläge",
      image: require("@/assets/images/ratschlaege.png"),
    },
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        themeStyles.defaultBackgorundColor,
        { gap: gap },
      ]}
    >
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={[styles.imageHeader, { width: imageSize }]}
          contentFit="contain"
        />
      </View>

      <Pressable
        style={[styles.searchContainer, themeStyles.contrast]}
        onPress={() => router.push("/(search)")}
        android_ripple={{ color: "rgba(0, 0, 0, 0.1)" }} // Add ripple effect for better feedback
      >
        <View style={styles.searchInputContainer}>
          <TextInput
            placeholder="Suche nach Fragen..."
            editable={false}
            style={[styles.searchInput, { flex: 1 }]} // Add flex: 1 to take full width
            placeholderTextColor={"gray"}
            pointerEvents="none" // This ensures the parent Pressable handles the touch
          />
          <Ionicons
            name="search"
            size={20}
            color="gray"
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>

      <View style={styles.bodyContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ThemedText
            style={[
              styles.bodyContainerText,
              {
                fontSize: fontSize * 2,
                fontWeight: "500",
                lineHeight: 32,
              },
            ]}
          >
            Kategorien
          </ThemedText>
          <Ionicons
            name="chevron-forward"
            size={25}
            style={{ paddingRight: 15 }}
            color={colorScheme === "dark" ? "#d0d0c0" : "#000"}
          />
        </View>

        <FlatList
          contentContainerStyle={styles.flatListContent}
          style={styles.flatListStyles}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(_, index) => index.toString()}
          decelerationRate="fast"
          renderItem={({ item: category, index }) => (
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/(tabs)/home/category",
                  params: { category: category.name },
                });
              }}
              onPressIn={() => setPressedIndex(index)}
              onPressOut={() => setPressedIndex(null)}
              style={[
                styles.element,
                {
                  width: elementSize,
                  height: elementSize,
                },
                pressedIndex === index
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 }, // X: 0, Y: 2
                      shadowOpacity: 0.2,
                      shadowRadius: 3,

                      // Android Shadow
                      elevation: 5, // Adjust for stronger or softer shadow
                      backgroundColor:
                        colorScheme === "dark" ? "#242c40" : "#E8E8E8",
                      top: 2,
                    }
                  : {
                      // iOS Shadow
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 }, // X: 0, Y: 2
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      // Android Shadow
                      elevation: 5, // Adjust for stronger or softer shadow
                      backgroundColor:
                        colorScheme === "dark" ? "#34495e" : "#fff",
                    },
                // themeStyles.contrast,
              ]}
            >
              <View style={styles.buttonContentContainerNormal}>
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Image
                    style={[styles.elementIcon, { width: iconSize }]}
                    source={category.image}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.elementTextContainer}>
                  <ThemedText
                    style={[styles.elementText, { fontSize: fontSize }]}
                  >
                    {category.name}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>

      <View style={styles.footerContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ThemedText
            style={[
              styles.footerContainerHeaderText,
              { fontSize: fontSize * 2, fontWeight: "500", lineHeight: 32 },
            ]}
          >
            Aktuelle Fragen
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={25}
            style={{ paddingRight: 15 }}
            color={colorScheme === "dark" ? "#d0d0c0" : "#000"}
          />
        </View>
        <LatestQuestions />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    borderRadius: 10,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 0.2,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    fontSize: 16,
    height: "100%", // This ensures the TextInput takes full height
  },
  bodyContainer: {
    flexDirection: "column",
  },
  bodyContainerText: {
    fontWeight: "500",
    marginHorizontal: 20,
    marginBottom: 10,
  },

  imageHeader: {
    height: "auto",
    aspectRatio: 2,
  },
  flatListContent: {
    gap: 20,
    paddingRight: 20,
    paddingLeft: 20,
    paddingVertical: 10,
  },
  flatListStyles: {},

  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
  },

  buttonContentContainerNormal: {
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContentContainerAskQuestion: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#057958",
  },
  elementTextContainer: {},

  elementIcon: {
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },
  elementText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  footerContainer: {
    flex: 1,
  },
  footerContainerHeaderText: {
    fontWeight: "500",
    marginLeft: 20,
  },
});
