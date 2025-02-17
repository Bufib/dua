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
import { QuestionFromUser } from "@/utils/types";
import { useAuthStore } from "@/stores/authStore";
import getStatusColor from "@/utils/getStatusColor";
import { CoustomTheme } from "@/utils/coustomTheme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import RenderLinkNewsItem from "@/components/RenderLinkNewsItem";
import { useFetchUserQuestions } from "@/hooks/useFetchUserQuestions";
import Toast from "react-native-toast-message";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { NoInternet } from "@/components/NoInternet";
export default function QuestionDetailScreen() {
  const { questionId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const session = useAuthStore.getState().session;
  const userId = session?.user?.id ?? null;
  const themeStyles = CoustomTheme();
  const hasInternet = useConnectionStatus();
  // 4. If user is not logged in, redirect to login
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/login");
    }
  }, [isLoggedIn, session]);

  const cachedQuestions = queryClient.getQueryData<QuestionFromUser[]>([
    "questionsFromUser",
    userId,
  ]);

  const {
    data: questions,
    isRefetching,
    refetch,
  } = useFetchUserQuestions();

  // 6. Find the specific question in the cached array
  const question = cachedQuestions?.find(
    (q) => String(q.id) === String(questionId)
  );

  // 7. Fallback if the question is not in the cache
  if (!question) {
    return (
      <ThemedView style={styles.notFound}>
        <ThemedText style={styles.notFoundText} type="subtitle">
          Fragen wurden nicht gefunden!
        </ThemedText>
      </ThemedView>
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
            // If user is offline show a message
            if (!hasInternet) {
              Toast.show({
                type: "error",
                text1: "Es bestehte keine Internetverbindung!",
              });
              return;
            }
            refetch();
          }}
        />
      }
    >
      <NoInternet showUI={true} showToast={false} />
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

        {question.answer &&
        (question.status === "Beantwortet" ||
          question.status === "Abgelehnt") ? (
          <View style={styles.answerBubble}>
            <Text style={styles.bubbleText}>{question.answer}</Text>
            <ThemedView style={styles.linksContainer}>
              {question.internal_url &&
                question.internal_url.length > 0 &&
                question.internal_url.map((url, index) => (
                  <RenderLinkNewsItem
                    key={`internal-url-${index}-${url}`}
                    url={url}
                    index={index}
                    isExternal={false}
                  />
                ))}
              {question.external_url &&
                question.external_url.length > 0 &&
                question.external_url.map((url, index) => (
                  <RenderLinkNewsItem
                    key={`external-url-${index}-${url}`}
                    url={url}
                    index={index}
                    isExternal={true}
                  />
                ))}
            </ThemedView>
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
  notFoundText: {
    color: Colors.universal.error,
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
