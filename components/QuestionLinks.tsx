import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { ThemedView } from "./ThemedView";
import { Link, router } from "expo-router";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { coustomTheme } from "../utils/coustomTheme";
import { Text } from "react-native";
import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/stores/authStore";

export default function QuestionLinks() {
  const colorScheme = useColorScheme();
  const themeStyles = coustomTheme();
  const [pressedIndex, setPressedIndex] = useState<number | null>(null);
  const { width } = useWindowDimensions();
  const { isLoggedIn } = useAuthStore();

  // Dynamically calculate the size of each element based on screen width
  const elementSize = width > 400 ? 200 : 160;
  const fontSize = width > 400 ? 20 : 16;
  const headerSize = width > 400 ? 50 : 30;
  const imageSize = width > 400 ? 120 : 90;

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
      name: "Historie",
      image: require("@/assets/images/historie.png"),
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
    {
      name: "Stelle eine Frage",
      image: require("@/assets/images/frageStellen.png"),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[{ fontSize: headerSize }, themeStyles.text]}>
          Islam-Fragen
        </Text>
        <Image
          source={require("@/assets/images/logo.png")}
          style={[styles.imageHeader, { width: imageSize }]}
          contentFit="contain"
        />
      </View>
      <View style={styles.contentenContainer}>
        {categories.map((category, index) => (
          <Pressable
            key={index}
            onPressIn={() => setPressedIndex(index)}
            onPressOut={() => setPressedIndex(null)}
            onPress={() =>
              router.push(
                category.name === "Stelle eine Frage" && isLoggedIn
                  ? {
                      pathname: "/(user)",
                      params: { category: category.name },
                    }
                  : category.name === "Stelle eine Frage" && !isLoggedIn
                  ? {
                      pathname: "/(auth)/login",
                    }
                  : {
                      pathname: "/(tabs)/home/category",
                      params: { category: category.name },
                    }
              )
            }
            style={[
              styles.element,
              {
                width: elementSize,
                height: elementSize,
              },

              index === 6 && styles.askQuestionElement,
              index === 6 && {
                width: elementSize * 2.1,
                height: elementSize / 2,
              },
            ]}
          >
            {/* Image top and text bottom */}
            {category.name !== "Stelle eine Frage" && (
              <View style={styles.buttonContentContainerNormal}>
                <Image
                  style={styles.elementIcon}
                  source={category.image}
                  contentFit="contain"
                />

                <View style={styles.elementTextContainer}>
                  <Text style={[styles.elementText, { fontSize: fontSize }]}>
                    {category.name}
                  </Text>
                </View>
              </View>
            )}

            {/* Text left and Image right */}
            {category.name === "Stelle eine Frage" && (
              <View style={styles.buttonContentContainerAskQuestion}>
                <View style={styles.elementTextContainerAskQuestion}>
                  <Text style={[styles.elementText, { fontSize: fontSize }]}>
                    {category.name}
                  </Text>
                </View>

                <Image
                  style={[
                    styles.elementIcon,
                    { width: 100, alignItems: "center" },
                  ]}
                  source={category.image}
                  contentFit="contain"
                />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    flexWrap: "nowrap",
    gap: 20,
  },
  headerContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  imageHeader: {
    height: "auto",
    aspectRatio: 2,
  },
  contentenContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: "#4fa1b8",
  },

  askQuestionElement: {
    backgroundColor: "#0C556A",
  },

  buttonContentContainerNormal: {
    gap: 10,
  },
  buttonContentContainerAskQuestion: {
    flexDirection: "row",
    alignItems: "center",
  },

  elementTextContainer: {
    padding: 10,
    backgroundColor: Colors.universal.white,
    borderRadius: 20,
    borderWidth: 1,
  },
  elementTextContainerAskQuestion: {
    flex: 1,
    padding: 7,
    marginHorizontal: 10,
    backgroundColor: Colors.universal.white,
    borderRadius: 20,
    borderWidth: 1,
  },
  elementIcon: {
    width: 120,
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },
  elementText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

