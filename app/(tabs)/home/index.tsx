import * as React from "react";
import QuestionLinks from "@/components/QuestionLinks";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
export default function index() {
  const colorScheme = useColorScheme() || "light";
  
  console.log(Colors[colorScheme].background);
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <ThemedText type="title" style={styles.greeting}>
        As-salamu alaykum
      </ThemedText>
      <QuestionLinks />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    color: Colors.universal.primary,
    padding: 20,
  },
});
