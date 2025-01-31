import { StyleSheet, Text, View } from "react-native";
import React from "react";
import RenderSearch from "@/components/RenderSearch";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const search = () => {
  return (
    <View style={styles.container}>
      <RenderSearch />
    </View>
  );
};

export default search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
