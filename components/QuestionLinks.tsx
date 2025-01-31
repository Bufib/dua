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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function QuestionLinks() {
  const themeStyles = coustomTheme();
  const { width } = useWindowDimensions();

  // Dynamically calculate the size of each element based on screen width
  const elementSize = width > 400 ? 120 : 100; // Element
  const fontSize = width > 400 ? 12 : 10; // Font of element text
  const iconSize = width > 400 ? 60 : 40; // Icon in element
  const imageSize = width > 400 ? 300 : 200; // Header image
  const gap = width > 400 ? 30 : 10; // Header image

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

      <View style={[styles.searchContainer, themeStyles.contrast]}>
        <TextInput
          placeholder="Suche nach Fragen..."
          editable={false} // Prevents keyboard from opening
          style={styles.searchInput}
          placeholderTextColor={"gray"}
          onPress={() => router.push("/(search)")}
        />
      </View>

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
          <MaterialCommunityIcons
            name="gesture-swipe-right"
            size={30}
            color="#057958"
            style={{ marginRight: 20 }}
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
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/home/category",
                  params: { category: category.name },
                })
              }
              style={[
                styles.element,
                {
                  width: elementSize,
                  height: elementSize,
                },
                index === 6 && {
                  width: elementSize * 2.1,
                  height: elementSize / 2,
                },
                themeStyles.contrast,
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
          <MaterialCommunityIcons
            name="gesture-swipe-down"
            size={30}
            color="#057958"
            style={{ marginRight: 20 }}
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
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
  borderWidth: 0.3
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
    paddingVertical: 10

  },
  flatListStyles: {},

  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // X: 0, Y: 2
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5, // Adjust for stronger or softer shadow
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
