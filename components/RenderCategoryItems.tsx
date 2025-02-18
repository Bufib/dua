import { useEffect, useState } from "react";
import { View, Pressable, StyleSheet, FlatList } from "react-native";
import { CoustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Entypo from "@expo/vector-icons/Entypo";
import { useColorScheme } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { getSubcategoriesForCategory } from "../utils/initializeDatabase";

function RenderCategoryItems({ category }: { category: string }) {
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const themeStyle = CoustomTheme();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadSubcategories = async () => {
      setIsLoading(true);
      try {
        const subcategories = await getSubcategoriesForCategory(category);
        if (subcategories) {
          setSubcategories(subcategories);
          setError(null);
        } else {
          setSubcategories([]);
          setError("Kategorien konnten nicht geladen werden!");
          console.log("No subcategories found");
        }
      } catch (error) {
        console.error("Error loading subcategories:", error);
        setSubcategories([]);
        setError("Kategorien konnten nicht geladen werden!");
      } finally {
        setIsLoading(false);
      }
    };

    loadSubcategories();
  }, [category]);

  //  Display error state
  if (error && !isLoading && subcategories.length === 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.error} type="subtitle">
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  //  Display loading state
  if (isLoading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText>Kategorien werden geladen...</ThemedText>
      </ThemedView>
    );
  }

  // Main render
  return (
    <View style={[styles.container, themeStyle.defaultBackgorundColor]}>
      <FlatList
        data={subcategories}
        keyExtractor={(item) => item.toString()}
        showsVerticalScrollIndicator={false}
        style={themeStyle.defaultBackgorundColor}
        contentContainerStyle={styles.flatListStyle}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/home/subcategory",
                params: { category: category, subcategory: item },
              })
            }
          >
            <ThemedView style={[styles.item, themeStyle.contrast]}>
              <ThemedText style={styles.tableText}>{item}</ThemedText>
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
  error: {
    color: Colors.universal.error,
  },
  flatListStyle: {
    paddingTop: 10,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 15,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
  },
  tableText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: 500,
  },
});

export default RenderCategoryItems;
