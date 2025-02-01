import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions, FlatList } from "react-native";
import { router } from "expo-router";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { coustomTheme } from "../utils/coustomTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import LatestQuestions from "./LatestQuestions";
import { TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { categories } from "@/utils/categories";
import { Colors } from "@/constants/Colors";

export default function QuestionLinks() {
  const themeStyles = coustomTheme();
  const { width } = useWindowDimensions();

  // Dynamically calculate the size of each element based on screen width
  const elementSize = width > 400 ? 120 : 100; // Size of each small square
  const fontSize = width > 400 ? 12 : 10; // Font of element text
  const iconSize = width > 400 ? 60 : 40; // Icon in element
  const imageSize = width > 400 ? 300 : 200; // Header image
  const gap = width > 400 ? 30 : 10; // Header image gap

  // For square to change color on pressed
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const colorScheme = useColorScheme();

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
            placeholder="Suche nach einer Frage"
            editable={false}
            style={styles.searchInput}
            placeholderTextColor={themeStyles.placeholder.color}
            pointerEvents="none" // This ensures the parent Pressable handles the touch
          />
          <Ionicons
            name="search"
            size={20}
            color={themeStyles.placeholder.color}
            style={{ marginLeft: 8 }}
          />
        </View>
      </Pressable>

      <View style={styles.bodyContainer}>
        <View style={styles.categoryContainer}>
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
                themeStyles.contrast,
                pressedIndex === index &&
                  styles.categoryPressed && {
                    backgroundColor:
                      colorScheme === "dark" ? "#242c40" : "#E8E8E8",
                  },
              ]}
            >
              <View style={styles.categoryButtonContainer}>
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
        <View style={styles.footerHeaderContainer}>
          <ThemedText
            style={[
              styles.footerHeaderContainerText,
              { fontSize: fontSize * 2, fontWeight: "500", lineHeight: 32 },
            ]}
          >
            Neue Fragen
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
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  bodyContainer: {
    flexDirection: "column",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
  },

  categoryPressed: {
    top: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Android Shadow
    elevation: 5,
  },
  categoryButtonContainer: {
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.primary,
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
  footerHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerHeaderContainerText: {
    fontWeight: "500",
    marginLeft: 20,
  },
});
