import { View, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import RenderSubcategoryItems from "@/components/RenderSubcategoryItems";

type params = {
  subcategory: string;
};
export default function Categories() {
  const { subcategory } = useLocalSearchParams<params>();

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
