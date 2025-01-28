import { View, StyleSheet, useColorScheme } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import RenderQuestion from "@/components/RenderQuestion";
import { Colors } from "@/constants/Colors";
import {
  isQuestionInFavorite,
  addQuestionToFavorite,
  removeQuestionFromFavorite,
} from "@/utils/initializeDatabase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { removeFavoriteToast, addFavoriteToast } from "@/constants/messages";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import FontSizePickerModal from "@/components/FontSizePickerModal";
import { router } from "expo-router";

export default function question() {
  const { category, subcategory, questionId, questionTitle } =
    useLocalSearchParams<{
      category: string;
      subcategory: string;
      questionId: string;
      questionTitle: string;
    }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const { triggerRefreshFavorites } = useRefreshFavorites();
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);

  // Check if question is favorite
  useEffect(() => {
    const checkIfFavorite = async () => {
      try {
        // Ensure `questionId` is a valid number before processing
        const id = parseInt(questionId, 10);
        if (!isNaN(id)) {
          const result = await isQuestionInFavorite(id);
          console.log(result);
          setIsFavorite(result);
        } else {
          console.error("Invalid questionId:", questionId);
        }
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkIfFavorite();
  }, [questionId]);

  const handleAddFavorite = async () => {
    try {
      const id = parseInt(questionId, 10);
      if (!isNaN(id)) {
        await addQuestionToFavorite(id);
        setIsFavorite(true);
        addFavoriteToast();
        triggerRefreshFavorites();
      }
    } catch (error) {
      console.error("Error adding question to favorites:", error);
    }
  };

  const handleRemoveFavorite = async () => {
    try {
      const id = parseInt(questionId, 10);
      if (!isNaN(id)) {
        await removeQuestionFromFavorite(id);
        setIsFavorite(false);
        removeFavoriteToast();
        triggerRefreshFavorites();
      }
    } catch (error) {
      console.error("Error removing question from favorites:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: questionTitle,
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <Ionicons
                name="text"
                size={25}
                color={colorScheme === "light" ? "black" : "white"}
                onPress={() => setModalVisible(true)} // Open modal
              />
              {isFavorite ? (
                <Ionicons
                  name="star"
                  size={28}
                  color={Colors.universal.favoriteIcon}
                  onPress={() => handleRemoveFavorite()}
                />
              ) : (
                <Ionicons
                  name="star-outline"
                  size={28}
                  color={Colors.universal.favoriteIcon}
                  onPress={() => handleAddFavorite()}
                />
              )}
            </View>
          ),
          headerLeft: () => {
            return (
              <Ionicons
                name="chevron-back-outline"
                size={30}
                color={Colors.universal.link}
                style={{ marginLeft: -16 }}
                onPress={() => router.back()}
              />
            );
          },
        }}
      />

      <RenderQuestion
        category={category}
        subcategory={subcategory}
        questionId={parseInt(questionId, 10)}
      />
      <FontSizePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRightContainer: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: 10,
  },
  noInternet: {
    padding: 15,
  },
  noInternetText: {
    textAlign: "center",
    color: Colors.universal.error,
    fontSize: 16,
    fontWeight: "700",
  },
});
