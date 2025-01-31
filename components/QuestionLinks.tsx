import React, { useState } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  FlatList,
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

export default function QuestionLinks() {
  const themeStyles = coustomTheme();
  const { width } = useWindowDimensions();
  const { isLoggedIn } = useAuthStore();
  const [latestQuestions, setLatestQuestions] = useState<QuestionType[]>([]);

  // Dynamically calculate the size of each element based on screen width
  const elementSize = width > 400 ? 170 : 120; // Element
  const fontSize = width > 400 ? 16 : 14; // Font of element text
  const iconSize = width > 400 ? 80 : 50; // Icon in element
  const imageSize = width > 400 ? 350 : 250; // Header image

  // Get the latest five questions
  useEffect(() => {
    const loadLatestQuestions = async () => {
      try {
        const questions = await getLatestQuestions();
        setLatestQuestions(questions);
      } catch (error) {
        console.error("Error loading latest questions:", error);
      }
    };

    loadLatestQuestions();
  }, []);

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
      name: "Deine Fragen",
      image: require("@/assets/images/frageStellen.png"),
    },
  ];

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/newLogo.png")}
          style={[styles.imageHeader, { width: imageSize }]}
          contentFit="contain"
        />
      </View>

      <View style={styles.bodyContainer}>
        <ThemedText style={styles.bodyContainerText} type="title">
          Kategorien
        </ThemedText>
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
                router.push(
                  category.name === "Deine Fragen" && isLoggedIn
                    ? {
                        pathname: "/(user)",
                        params: { category: category.name },
                      }
                    : category.name === "Deine Fragen" && !isLoggedIn
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
              {category.name !== "Deine Fragen" ? (
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
                    <Text style={[styles.elementText, { fontSize: fontSize }]}>
                      {category.name}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.buttonContentContainerAskQuestion}>
                  <View style={styles.elementTextContainerAskQuestion}>
                    <Text style={[styles.elementText, { fontSize: fontSize }]}>
                      {category.name}
                    </Text>
                  </View>
                  <Image
                    style={[
                      styles.elementIcon,
                      { alignItems: "center" },
                      { width: iconSize - 10 },
                    ]}
                    source={category.image}
                    contentFit="contain"
                  />
                </View>
              )}
            </Pressable>
          )}
        />
      </View>

      <View style={styles.footerContainer}>
        <ThemedText style={styles.footerContainerHeaderText} type="title">
          Aktuelle Fragen
        </ThemedText>
        <LatestQuestions />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 30,
  },
  headerContainer: {
    justifyContent: "center",
    alignItems: "center",
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
  },
  flatListStyles: {
    paddingLeft: 20,
    paddingRight: 20,
  },

  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "#fff",
  },

  askQuestionElement: {
    backgroundColor: "#0C556A",
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
    backgroundColor: Colors.universal.QuestionLinksIconContainer,
  },
  elementTextContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
  },
  elementTextContainerAskQuestion: {
    padding: 7,
    marginHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
  },
  elementIcon: {
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },
  elementText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  footerContainer: {
    flex:1
  },
  footerContainerHeaderText: {
    fontWeight: "500",
    marginLeft: 20,
  },
});
