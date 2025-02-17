import { StyleSheet } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoustomTheme } from "@/utils/coustomTheme";

import RenderFavoriteQuestions from "@/components/RenderFavorites";

const favorites = () => {
  const themeStyles = CoustomTheme();

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <ThemedText style={styles.headerText} type="title">
        Favoriten
      </ThemedText>
      <RenderFavoriteQuestions />
    </SafeAreaView>
  );
};

export default favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerText: {
    margin: 15,
  },
});
