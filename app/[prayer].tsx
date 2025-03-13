import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import RenderPrayer from "@/components/RenderPrayer";

const Test = () => {
  // Define the required props for RenderPrayer
  const [selectedLanguages, setSelectedLanguages] = useState({
    arabic: true,
    german: true,
    transliteration: true,
  });

  return (
    <View style={styles.container}>
      <RenderPrayer />
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
