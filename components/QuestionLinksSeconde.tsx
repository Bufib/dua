import React from "react";
import { StyleSheet } from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { coustomTheme } from "./coustomTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";

export default function QuestionLinksFirst() {
  const colorScheme = useColorScheme();
  const themeStyles = coustomTheme();

  const categories = [
    {
      name: "Ethik",
      image: require("@/assets/images/ethik.png"),
      path: "getSuperCategories/[getSuperCategories]",
      backgroundColor: "red",
    },

    {
      name: "Ratschläge",
      image: require("@/assets/images/ratschlaege.png"),
      path: "getSuperCategories/[getSuperCategories]",
      backgroundColor: "green",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {categories.map((category, index) => (
        <Link
          key={index}
          href={
            {
              pathname: category.path,
              params: {
                category: category.name,
              },
            } as any
          }
          asChild
        >
          <Pressable style={[styles.element, {backgroundColor: category.backgroundColor}]}>
            {/*backgorund color and shadow color */}
            <Image
              style={styles.elementIcon}
              source={category.image}
              contentFit="contain"
            />
            <Text style={styles.elementText}>{category.name}</Text>
          </Pressable>
        </Link>
      ))}
      <Link
        href={
          {
            pathname: "",
          } as any
        }
        asChild
      >
        <Pressable style={styles.questionElement}>
          {/*backgorund color and shadow color */}
          <Image style={styles.elementIcon} contentFit="contain" />
          <Text style={styles.elementText}>Frage Stellen</Text>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignContent: "center",
    gap: 20,
  },

  element: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "45%",
    height: "30%",
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "green",
    shadowOffset: { width: -3.5, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  questionElement: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    height: "30%",
    borderRadius: 30,
    borderWidth: 2,
    backgroundColor: "green",
    shadowOffset: { width: -3.5, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },

  elementIcon: {
    width: "80%",
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },

  elementText: {
    fontSize: 15,
    fontWeight: "bold",
    padding: 5,
    textAlign: "center",
    paddingHorizontal: 5,
  },
});
