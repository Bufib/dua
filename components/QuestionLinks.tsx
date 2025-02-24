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

export default function TextGrid() {
  const themeStyles = CoustomTheme();
  const { width } = useWindowDimensions();
  const colorScheme: ColorSchemeName = useColorScheme() || "light";

  // Create data for 6 text squares
  const textItems = [
    { id: 1, title: "Dua", image: require("@/assets/images/dua.png") },
    { id: 2, title: "Ziyarat", image: require("@/assets/images/ziyarat.png") },
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
                  pathname: "/(tabs)/home/category",
                  params: { textId: item.id },
                });
              }}
              style={({ pressed }) => [
                styles.gridItem,
                {
                  width: itemWidth,
                  height: itemWidth,
                  opacity: pressed ? 0.9 : 1,
                  backgroundColor:
                    colorScheme === "dark" ? "#2C2C2C" : "#FFFFFF",
                },
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
    justifyContent: "center",
  },
  scrollStyle: {
    marginHorizontal: 10,
  },
  contentContainerStyle: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
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
