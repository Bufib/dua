import { useState, useLayoutEffect } from "react";
import { View, Pressable, StyleSheet, FlatList } from "react-native";
import { CoustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Entypo from "@expo/vector-icons/Entypo";
import { useColorScheme } from "react-native";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { getFavoriteQuestions } from "../utils/initializeDatabase";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import { QuestionType } from "@/utils/types";

function RenderFavoriteQuestions() {
  const { category, subcategory } = useLocalSearchParams<{
    category: string;
    subcategory: string;
  }>();

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const themeStyle = CoustomTheme();
  const colorScheme = useColorScheme();
  const { triggerRefreshFavorites } = useRefreshFavorites();

  /* When adding to favorites, it won't show until refreshing -> store forces to refresh because of state change */
  const { refreshTriggerFavorites } = useRefreshFavorites();

  useLayoutEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const questions = await getFavoriteQuestions();

        if (questions) {
          setQuestions(questions);
          setError(null);
        } else {
          console.log("Can't load favorite questions");
          setQuestions([]);
          setError("Fehler beim laden deiner Favoriten!");
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setQuestions([]);
        setError("Fehler beim laden deiner Favoriten!");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [refreshTriggerFavorites]);

  // Show error state
  if (error && !isLoading && questions.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText>{error}</ThemedText>
      </View>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText>Favoriten werden geladen</ThemedText>
      </View>
    );
  }

  if ((questions.length === 0 || !questions) && !isLoading && !error) {
    return (
      <View style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>
          Du hast noch keine Favoriten! {"\n"} Klicke auf den Stern bei einer
          Frage um diese zu deinen Favoriten hinzuzufügen
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, themeStyle.defaultBackgorundColor]}>
      <FlatList
        data={questions}
        extraData={refreshTriggerFavorites}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        style={themeStyle.defaultBackgorundColor}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <Pressable
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
          >
            <ThemedView style={[styles.item, themeStyle.contrast]}>
              <View style={styles.questionContainer}>
                <ThemedText style={styles.titleText}>{item.title}</ThemedText>
                <ThemedText style={styles.questionText} numberOfLines={1}>
                  {item.question}
                </ThemedText>
              </View>
              <Entypo
                name="chevron-thin-right"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </ThemedView>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flatListStyle: {
    paddingTop: 20,
    gap: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10
  },
  questionContainer: {
    flex: 1,
    marginRight: 10,
    gap: 2,
  },
  titleText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 16,
    textAlign: "left",
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
  },
});

export default RenderFavoriteQuestions;
