import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import RenderSubcategoryItems from "@/components/RenderSubcategoryItems";

export default function categories({
  category,
  subcategory,
}: {
  category: string;
  subcategory: string;
}) {
  console.log(category, subcategory);
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
