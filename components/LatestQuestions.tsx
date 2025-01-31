import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { router } from "expo-router";
import { getLatestQuestions } from "@/utils/initializeDatabase";
import { QuestionType } from "@/utils/types";

// Define props interface for QuestionItem
interface QuestionItemProps {
  item: QuestionType;
  onPress: () => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ item, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [styles.questionItem, pressed && styles.pressed]}
  >
    <View style={styles.questionContent}>
      <Text style={styles.questionTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.questionPreview} numberOfLines={2}>
        {item.question}
      </Text>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryText}>
          {item.category_name} • {item.subcategory_name}
        </Text>
      </View>
    </View>
  </Pressable>
);

const LatestQuestions: React.FC = () => {
  const [latestQuestions, setLatestQuestions] = useState<QuestionType[]>([]);

  useEffect(() => {
    const loadLatestQuestions = async () => {
      try {
        const questions = await getLatestQuestions();
        setLatestQuestions(questions);
      } catch (error) {
        console.error("Error loading latest questions:", error);
      }
    };

    loadLatestQuestions();
  }, []);

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
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  questionItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  pressed: {
    opacity: 0.7,
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
    color: "#666",
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
