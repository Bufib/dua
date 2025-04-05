import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import RenderPrayer from "@/components/RenderPrayer";

const Prayer = () => {
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

export default Prayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
