import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import RenderSubcategoryItems from "@/components/RenderSubcategoryItems";

type params = {
  subcategory: string,
  category: string
}
export default function categories({}) {
  const { subcategory, category } = useLocalSearchParams<params>();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: subcategory,
        }}
      />
      <RenderSubcategoryItems />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
