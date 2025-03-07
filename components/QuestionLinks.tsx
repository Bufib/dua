import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ColorSchemeName,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { CoustomTheme } from "../utils/coustomTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { ScrollView } from "react-native";
import { Colors } from "@/constants/Colors";

export default function TextGrid() {
  const themeStyles = CoustomTheme();
  const { width } = useWindowDimensions();
  const colorScheme: ColorSchemeName = useColorScheme() || "light";

  // Create data for 6 text squares
  const textItems = [
    { id: 0, title: "Dua", image: require("@/assets/images/dua.png") },
    { id: 1, title: "Ziyarat", image: require("@/assets/images/ziyarat.png") },
    { id: 2, title: "Salat", image: require("@/assets/images/ziyarat.png") },
    { id: 3, title: "Munajat", image: require("@/assets/images/ziyarat.png") },
    { id: 4, title: "Tasibeh", image: require("@/assets/images/ziyarat.png") },
  ];

  // Calculate grid dimensions based on screen size
  const padding = 16;
  const gridGap = 12;
  const availableWidth = width - padding * 2;
  const columns = 2; // 2 columns for a grid of 6 items
  const itemWidth = (availableWidth - gridGap * (columns - 1)) / columns;
  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
   
      <ScrollView
        style={styles.scrollStyle}
        contentContainerStyle={styles.contentContainerStyle}
      >
        <View style={styles.gridContainer}>
          {textItems.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                router.push({
                  pathname: "/test",
                  params: { textId: item.id },
                });
              }}
              style={({ pressed }) => [
                styles.gridItem,
                {
                  width: itemWidth,
                  height: itemWidth,
                  opacity: pressed ? 0.9 : 1,
                },
                item.id === 4 && { width: itemWidth * 2.07 },

                themeStyles.contrast,
              ]}
            >
              <View style={styles.itemContent}>
                <Image
                  source={item.image}
                  style={styles.itemImage}
                  contentFit="contain"
                />
                <ThemedText style={styles.itemTitle} type="subtitle">
                  {item.title}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollStyle: {
    marginHorizontal: 10,
  },
  
  contentContainerStyle: {
    flexGrow: 1,
    paddingVertical: 20,
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    gap: 15,
  },
  gridItem: {
    borderRadius: 8,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Android Shadow
    elevation: 2,
  },
  itemContent: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemImage: {
    width: "80%",
    height: "70%",
    borderRadius: 6,
    marginBottom: 10,
  },
  itemTitle: {
    textAlign: "center",
    fontWeight: "500",
  },
});
