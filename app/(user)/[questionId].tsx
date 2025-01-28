import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { QuestionFromUser } from "@/hooks/useFetchUserQuestions";
import { useAuthStore } from "@/stores/authStore";
import getStatusColor from "@/utils/getStatusColor";
import { coustomTheme } from "@/utils/coustomTheme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import RenderLinkNewsItem from "@/components/RenderLinkNewsItem";
import { useFetchUserQuestions } from "@/hooks/useFetchUserQuestions";
import { useState } from "react";
import NetInfo from "@react-native-community/netinfo";

// Helper function to map statuses to colors

export default function QuestionDetailScreen() {
  // 1. Grab the questionId from the URL
  const { questionId } = useLocalSearchParams();
  // 2. Grab QueryClient to read from the cache
  const queryClient = useQueryClient();
  // 3. Auth
  const { isLoggedIn, session } = useAuthStore();
  const userId = session?.user?.id ?? null;
  const themeStyles = coustomTheme();
  const [isConnected, setIsConnected] = useState<boolean | null>(true);

  // 4. If user is not logged in, redirect to login
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/(tabs)/renderItems/login");
    }
  }, [isLoggedIn]);

  // 4. Subscribe to NetInfo once
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // 5. Grab **non-paginated** data from the cache
  //    NOTE: If your query key is ["questionsFromUser", userId],
  //    be sure to include userId in the key below.
  const cachedQuestions = queryClient.getQueryData<QuestionFromUser[]>([
    "questionsFromUser",
    userId,
  ]);

  const {
    data: questions,
    isLoading,
    isRefetching,
    refetch,
    isError,
    hasUpdate,
    handleRefresh,
  } = useFetchUserQuestions();

  // 6. Find the specific question in the cached array
  const question = cachedQuestions?.find(
    (q) => String(q.id) === String(questionId)
  );

  // 7. Fallback if the question is not in the cache
  if (!question) {
    return (
      <View style={styles.notFound}>
        <Text>Question not found</Text>
      </View>
    );
  }

  // 8. Render
  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerScrollView}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            // If user is offline, skip or show a message
            if (!isConnected) {
              // e.g. Alert.alert("Offline", "Kein Internet. Bitte später erneut versuchen.");
              return;
            }
            refetch();
          }}
        />
      }
    >
      <ThemedView style={[styles.header, themeStyles.borderColor]}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(question.status) },
          ]}
        >
          <Text style={styles.statusText}>{question.status}</Text>
        </View>
        <ThemedText style={styles.title} type="title">
          {question.title}
        </ThemedText>
      </ThemedView>

      <View style={styles.chatContainer}>
        <View style={styles.questionBubble}>
          <Text style={[styles.bubbleHeaderText, styles.informationText]}>
            Frage: {"\n"}
          </Text>
          <Text style={[styles.bubbleText, styles.informationText]}>
            Marja: {question.marja}
          </Text>
          <Text style={[styles.bubbleText, styles.informationText]}>
            Geschlecht: {question.gender}
          </Text>
          <Text style={[styles.bubbleText, styles.informationText]}>
            Alter: {question.age}
          </Text>
          {/* Spacer */}
          <View style={{ marginBottom: 10 }}></View>
          <Text style={styles.bubbleText}>{question.question}</Text>
        </View>

        {question.answer || question.internal_url ? (
          <View style={styles.answerBubble}>
            <Text style={[styles.bubbleHeaderText, styles.informationText]}>
              Antwort: {"\n"}
            </Text>
            <Text style={styles.bubbleText}>{question.answer}</Text>
            {question.internal_url && question.internal_url.length > 0 && (
              <ThemedView style={styles.linksContainer}>
                {question.internal_url.map((url, index) => (
                  <RenderLinkNewsItem
                    key={`internal-url-${index}-${url}`}
                    url={url}
                    index={index}
                    isExternal={false}
                  />
                ))}
              </ThemedView>
            )}
          </View>
        ) : (
          <View style={styles.waitingContainer}>
            <ThemedText style={styles.waitingText}>
              Beantwortung steht noch aus.
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerScrollView: {},
  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 20,
    padding: 16,
    borderBottomWidth: 1.5,
  },
  title: {},
  statusBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: Colors.universal.statusText,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  questionBubble: {
    backgroundColor: Colors.universal.chatBubbleQuestion,
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: "80%",
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  answerBubble: {
    backgroundColor: Colors.universal.chatBubbleAnswer,
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    maxWidth: "80%",
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  bubbleHeaderText: {
    fontSize: 20,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 24,
  },
  linksContainer: {
    backgroundColor: "transparent",
  },
  informationText: {
    fontWeight: "bold",
  },

  waitingContainer: {
    padding: 16,
    alignItems: "center",
  },
  waitingText: {
    fontStyle: "italic",
  },
});
