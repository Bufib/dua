import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Link, router, useFocusEffect } from "expo-router";
import { useFetchUserQuestions } from "@/hooks/useFetchUserQuestions";
import { useAuthStore } from "@/stores/authStore";
import { formatDate } from "@/utils/formatDate";
import { Colors } from "@/constants/Colors";
import getStatusColor from "@/utils/getStatusColor";
import { useColorScheme } from "react-native";
import { coustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { userQuestionErrorLoadingQuestions } from "@/constants/messages";
import { NoInternet } from "@/components/NoInternet";
import { QuestionFromUser } from "@/utils/types";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
export default function QuestionsList() {
  // 1. Check auth state from the store
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const session = useAuthStore.getState().session;
  const colorScheme = useColorScheme();
  const themeStyles = coustomTheme();

  // Track connection status
  const hasInternet = useConnectionStatus();

  // 2. If not logged in, redirect to login
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/(auth)/login");
    }
  }, [isLoggedIn, session]);

  // 3. Use our hook to fetch data
  const {
    data: questions,
    isLoading,
    isRefetching,
    refetch,
    isError,
    hasUpdate,
    handleRefresh,
  } = useFetchUserQuestions();

  /**
   * 5. Optionally refetch on screen focus
   *    This ensures we always have fresh data when user returns.
   */
  useFocusEffect(
    useCallback(() => {
      // Only refetch if connected and we have a session
      if (hasInternet && session) {
        refetch();
      }
    }, [hasInternet, session])
  );

  // 6. Render item (memoized for performance)
  const renderQuestion = useCallback(
    ({ item }: { item: QuestionFromUser }) => (
      <Pressable
        style={[styles.questionCard, themeStyles.contrast]}
        onPress={() =>
          router.push({
            pathname: "/(askQuestion)/[questionId]",
            params: { questionId: item.id },
          })
        }
      >
        <ThemedText style={styles.questionTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.questionText} numberOfLines={2}>
          {item.question}
        </ThemedText>
        <View style={styles.questionFooter}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.createdAtText}>{formatDate(item.created_at)}</Text>
      </Pressable>
    ),

    [themeStyles]
  );

  // 7. Return early if loading
  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator
          size="large"
          color={colorScheme === "dark" ? "#fff" : "#000"}
        />
        <ThemedText style={styles.loadingText}>
          Fragen werden geladen
        </ThemedText>
      </ThemedView>
    );
  }

  // 8. Show error if fetch fails
  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>
            {userQuestionErrorLoadingQuestions}
          </ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => refetch()}
          >
            <ThemedText style={styles.retryButtonText}>
              Versuch es nochmal
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  // 9. Main UI
  return (
    <ThemedView style={[styles.container, themeStyles.defaultBackgorundColor]}>
      {/* If offline, show your "No Internet" banner at top */}
      {!hasInternet && <NoInternet showUI={true} showToast={false} />}

      {/* Show update available button
      {hasUpdate && (
        <Pressable style={styles.updateButton} onPress={handleRefresh}>
          <Text style={styles.updateButtonText}>Aktualisieren</Text>
        </Pressable>
      )} */}

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContainer,
          questions?.length === 0 && !isLoading && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              // If user is offline, skip or show a message
              if (!hasInternet) {
                // e.g. Alert.alert("Offline", "Kein Internet. Bitte später erneut versuchen.");
                return;
              }
              refetch();
            }}
          />
        }
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Du hast noch keine Fragen!
              {"\n"}
              Klicke unten auf den Button um eine zu stellen.
            </ThemedText>
          </ThemedView>
        }
      />

      <Pressable
        style={[
          styles.askQuestionButton,
          !hasInternet && styles.disabled
        ]}
        onPress={() => router.push("/(askQuestion)/askQuestion")}
        disabled={!hasInternet}
      >
        <AntDesign name="plus" size={35} color="#fff" />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.universal.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    transform: [{ scale: 1 }],
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  updateButton: {
    backgroundColor: Colors.universal.link,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  questionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    color: Colors.universal.questionBoxQuestionText,
    marginBottom: 12,
  },
  questionFooter: {
    alignSelf: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  createdAtText: {
    color: Colors.universal.fadeColor,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  askQuestionButton: {
    position: "absolute",
    bottom: 80,
    right: 30,
    padding: 15,
    backgroundColor: "#057958",
    borderRadius: 99,
  },
  disabled: {
    opacity: 0.7
  },
  askQuestionButtonText: {
    fontWeight: "600",
    color: "#fff",
  },
});
