import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { getLatestQuestions } from "@/utils/initializeDatabase";
import { QuestionType } from "@/utils/types";
import { CoustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "./ThemedText";
import { useColorScheme } from "react-native";
import { ThemedView } from "./ThemedView";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase.ts";

const LatestQuestions: React.FC = () => {
  const [latestQuestions, setLatestQuestions] = useState<QuestionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
const dbInitialized = useInitializeDatabase();
  const themeStyles = CoustomTheme();
  const colorScheme = useColorScheme();

  const QuestionItem = ({
    item,
    onPress,
  }: {
    item: QuestionType;
    onPress: () => void;
  }) => {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.questionItem,
          themeStyles.contrast,

          pressed &&
            styles.pressed && {
              backgroundColor: colorScheme === "dark" ? "#242c40" : "#E8E8E8",
            },

          ,
        ]}
      >
        <View style={styles.questionContent}>
          <ThemedText style={styles.questionPreview} numberOfLines={2}>
            {item.question}
          </ThemedText>
          <View style={styles.categoryContainer}>
            <ThemedText style={styles.categoryText}>
              {item.category_name} {">"} {item.subcategory_name}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  useEffect(() => {
    const loadLatestQuestions = async () => {
      setIsLoading(true);
      try {
        const questions = await getLatestQuestions();
        setLatestQuestions(questions);
      } catch (error) {
        console.error("Error loading latest questions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLatestQuestions();
  }, [dbInitialized]);

  // While loading
  if (isLoading) {
    return (
      <ThemedView
        style={{ flex: 1, marginTop: 20, gap: 10, alignItems: "center" }}
      >
        <ThemedText>Fragen werden geladen</ThemedText>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  const renderItem = ({ item }: { item: QuestionType }) => (
    <QuestionItem
      item={item}
      onPress={() =>
        router.push({
          pathname: "/(question)",
          params: {
            category: item.category_name,
            subcategory: item.subcategory_name,
            questionId: item.id.toString(),
            questionTitle: item.title,
          },
        })
      }
    />
  );

  return (
    <FlatList
      data={latestQuestions}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={true}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: 15,
    gap: 12,
  },
  questionItem: {
    borderRadius: 7,
    padding: 16,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // X: 0, Y: 2
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5, // Adjust for stronger or softer shadow
  },

  pressed: {
    top: 2,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, // X: 0, Y: 2
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Android Shadow
    elevation: 5, // Adjust for stronger or softer shadow,
  },
  questionContent: {
    gap: 8,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  questionPreview: {
    fontSize: 14,
  },
  categoryContainer: {
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    color: "#888",
  },
});

export default LatestQuestions;
