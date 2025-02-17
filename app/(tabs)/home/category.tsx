import { View, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import RenderCategoryItems from "@/components/RenderCategoryItems";
import { Stack } from "expo-router";

export default function Categories() {
  const { category } = useLocalSearchParams<{ category: string }>();
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: category,
        }}
      />
      <RenderCategoryItems category={category} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
