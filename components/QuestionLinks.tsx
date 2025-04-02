import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  ColorSchemeName,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { CoustomTheme } from "../utils/coustomTheme";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import {
  TodoItem,
  WeeklyTodos,
  TodoToDelete,
  CategoryItem,
  PrayerData,
  PrayersByLanguage,
  PrayerWithCategory,
  DailyPrayer,
} from "@/utils/types";
import { ThemedView } from "./ThemedView";
import {
  getDailyPrayerForToday,
  getRandomPrayerWithCategory,
  isMonthlyTrue,
} from "@/utils/initializeDatabase";

// Storage key for weekly calendar todos
const WEEKLY_TODOS_STORAGE_KEY = "prayer_app_weekly_todos";

const HomeScreen = () => {
  const themeStyles = CoustomTheme();
  const { width } = useWindowDimensions();
  const colorScheme: ColorSchemeName = useColorScheme() || "light";
  const [weeklyTodos, setWeeklyTodos] = useState<WeeklyTodos>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newTodo, setNewTodo] = useState<string>("");
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [dailyPrayer, setDailyPrayer] = useState<DailyPrayer | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<TodoToDelete>({
    dayIndex: null,
    todoId: null,
  });
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Prayer categories using translations
  const categories: CategoryItem[] = [
    {
      id: 0,
      title: t("dua"),
      image: require("@/assets/images/dua.png"),
      value: "Dua",
    },
    {
      id: 1,
      title: t("salat"),
      image: require("@/assets/images/salat.png"),
      value: "Salat",
    },
    {
      id: 2,
      title: t("ziyarat"),
      image: require("@/assets/images/ziyarat.png"),
      value: "Ziyarat",
    },

    {
      id: 3,
      title: t("munajat"),
      image: require("@/assets/images/munajat.png"),
      value: "Munajat",
    },
    {
      id: 4,
      title: t("special"),
      image: require("@/assets/images/special.png"),
      value: "Special",
    },
    {
      id: 5,
      title: t("tasbih"),
      image: require("@/assets/images/tasbih.png"),
      value: "Tasbih",
    },
    {
      id: 6,
      title: t("names"),
      image: require("@/assets/images/names.png"),
      value: "Names",
    },
  ];

  // Fetch daily prayer based on monthly vs. weekly mode
  useEffect(() => {
    const fetchDailyPrayer = async () => {
      try {
        const prayer = await getDailyPrayerForToday();
        setDailyPrayer(prayer);
      } catch (error) {
        console.error("Error fetching daily prayer:", error);
      }
    };
    fetchDailyPrayer();
  }, [language]);

  // Default prayers for each day in multiple languages
  const defaultWeeklyTodos: { [key: string]: WeeklyTodos } = {
    de: {
      0: [{ id: 1, text: "Morgengebet", completed: false }],
      1: [{ id: 2, text: "Mittagsgebet", completed: false }],
      2: [{ id: 3, text: "Abendgebet", completed: false }],
      3: [{ id: 4, text: "Dankbarkeit üben", completed: false }],
      4: [{ id: 5, text: "Freitagsgebet", completed: false }],
      5: [{ id: 6, text: "Quran lesen", completed: false }],
      6: [{ id: 7, text: "Zeit mit Familie verbringen", completed: false }],
    },
    ar: {
      0: [{ id: 1, text: "صلاة الصبح", completed: false }],
      1: [{ id: 2, text: "صلاة الظهر", completed: false }],
      2: [{ id: 3, text: "صلاة المساء", completed: false }],
      3: [{ id: 4, text: "ممارسة الامتنان", completed: false }],
      4: [{ id: 5, text: "صلاة الجمعة", completed: false }],
      5: [{ id: 6, text: "قراءة القرآن", completed: false }],
      6: [{ id: 7, text: "قضاء وقت مع العائلة", completed: false }],
    },
    en: {
      0: [{ id: 1, text: "Morning prayer", completed: false }],
      1: [{ id: 2, text: "Midday prayer", completed: false }],
      2: [{ id: 3, text: "Evening prayer", completed: false }],
      3: [{ id: 4, text: "Practice gratitude", completed: false }],
      4: [{ id: 5, text: "Friday prayer", completed: false }],
      5: [{ id: 6, text: "Read Quran", completed: false }],
      6: [{ id: 7, text: "Spend time with family", completed: false }],
    },
  };

  // Get current day of week (0-6, Monday-Sunday)
  const getCurrentDayIndex = (): number => {
    const day = new Date().getDay();
    // Convert from Sunday-Saturday (0-6) to Monday-Sunday (0-6)
    return day === 0 ? 6 : day - 1;
  };

  // Load todos from storage
  useEffect(() => {
    const loadTodos = async (): Promise<void> => {
      try {
        const storedTodos = await AsyncStorage.getItem(
          WEEKLY_TODOS_STORAGE_KEY
        );
        if (storedTodos !== null) {
          setWeeklyTodos(JSON.parse(storedTodos));
        } else {
          // Set default todos based on language if no saved todos
          const defaultTodos =
            defaultWeeklyTodos[language] || defaultWeeklyTodos.en;
          setWeeklyTodos(defaultTodos);
          // Save default todos to storage
          await AsyncStorage.setItem(
            WEEKLY_TODOS_STORAGE_KEY,
            JSON.stringify(defaultTodos)
          );
        }
      } catch (error) {
        console.error("Error loading todos:", error);
        setWeeklyTodos(defaultWeeklyTodos[language] || defaultWeeklyTodos.en);
      }
    };

    loadTodos();
    // Set the current day as selected by default
    setSelectedDay(getCurrentDayIndex());
  }, [language]);

  // Save todos to storage when they change
  useEffect(() => {
    const saveTodos = async (): Promise<void> => {
      try {
        await AsyncStorage.setItem(
          WEEKLY_TODOS_STORAGE_KEY,
          JSON.stringify(weeklyTodos)
        );
      } catch (error) {
        console.error("Error saving todos:", error);
      }
    };

    if (Object.keys(weeklyTodos).length > 0) {
      saveTodos();
    }
  }, [weeklyTodos]);

  // Toggle todo completion status
  const toggleTodo = (dayIndex: number, todoId: number): void => {
    setWeeklyTodos((prevTodos) => {
      const dayTodos = [...(prevTodos[dayIndex] || [])];
      const updatedDayTodos = dayTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      );
      return {
        ...prevTodos,
        [dayIndex]: updatedDayTodos,
      };
    });
  };

  // Add new todo to selected day
  const addTodo = (): void => {
    if (newTodo.trim() && selectedDay !== null) {
      setWeeklyTodos((prevTodos) => {
        const dayTodos = [...(prevTodos[selectedDay] || [])];
        const updatedDayTodos = [
          ...dayTodos,
          {
            id: Date.now(),
            text: newTodo.trim(),
            completed: false,
          },
        ];

        return {
          ...prevTodos,
          [selectedDay]: updatedDayTodos,
        };
      });

      setNewTodo("");
      setAddModalVisible(false);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (dayIndex: number, todoId: number): void => {
    setTodoToDelete({ dayIndex, todoId });
    setDeleteModalVisible(true);
  };

  // Confirm and delete todo
  const confirmDelete = (): void => {
    const { dayIndex, todoId } = todoToDelete;

    if (dayIndex !== null && todoId !== null) {
      setWeeklyTodos((prevTodos) => {
        const dayTodos = [...(prevTodos[dayIndex] || [])];
        const updatedDayTodos = dayTodos.filter((todo) => todo.id !== todoId);

        return {
          ...prevTodos,
          [dayIndex]: updatedDayTodos,
        };
      });
    }

    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  };

  // Cancel delete
  const cancelDelete = (): void => {
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  };

  const undoAllTodosForSelectedDay = (): void => {
    if (selectedDay !== null) {
      setWeeklyTodos((prevTodos) => {
        // Create a shallow copy of the previous todos
        const newTodos = { ...prevTodos };
        // If there are todos for the selected day, update them
        if (newTodos[selectedDay]) {
          newTodos[selectedDay] = newTodos[selectedDay].map((todo) => ({
            ...todo,
            completed: false,
          }));
        }
        return newTodos;
      });
    }
  };

  // Get short day names (for day selector buttons)
  const getDayNames = (): string[] => {
    return (
      (t("days.short", { returnObjects: true }) as string[]) || [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ]
    );
  };

  // Get full day name for selected day
  const getFullDayName = (dayIndex: number): string => {
    const names: string[] = (t("days.full", {
      returnObjects: true,
    }) as string[]) || [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return names[dayIndex];
  };

  // Right-to-left text direction for Arabic
  const isRTL = language === "AR";
  const textAlign = isRTL ? { textAlign: "right" as const } : {};
  const flexDirection = isRTL ? { flexDirection: "row-reverse" as const } : {};

  return (
    <View style={[styles.container, themeStyles.defaultBackgorundColor]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Random's Prayer Section */}
        <View style={[styles.randomPrayerCard, themeStyles.contrast]}>
          <View style={[styles.prayerHeader, flexDirection]}>
            <ThemedText style={styles.todayTitle}>
              {t("randomPrayer")}
            </ThemedText>
            <View style={styles.prayerCategory}>
              <ThemedText style={styles.categoryText}>
                {t(`${dailyPrayer?.category_title}`)}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.prayerTitle]}>
            {dailyPrayer?.title}
          </ThemedText>
          <ThemedText style={[styles.prayerText]} numberOfLines={1}>
            {language === "AR"
              ? dailyPrayer?.arabic_text
              : language === "EN"
              ? dailyPrayer?.english_text
              : dailyPrayer?.german_text}
          </ThemedText>

          <TouchableOpacity
            style={[
              styles.readMoreButton,
              { backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0" },
              isRTL ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
            ]} 
            onPress={() =>
              router.push({
                pathname: "/[prayer]",
                params: {
                  prayerId: randomPrayer.text,
                  prayerTitle: randomPrayer.title,
                },
              })
            }
          >
            <ThemedText style={styles.readMoreText}>{t("readMore")}</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Categories Row */}
        <ThemedText style={[styles.sectionTitle]}>{t("categories")}</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => {
                router.push(
                  category.value === "Tasbih"
                    ? {
                        pathname: "/(tabs)/home/tasbih",
                        params: { category: category.value },
                      }
                    : category.value === "Names"
                    ? {
                        pathname: "/(tabs)/home/names",
                        params: { category: category.value },
                      }
                    : {
                        pathname: "/(tabs)/home/(category)/[category]",
                        params: { category: category.value },
                      }
                );
              }}
              style={({ pressed }) => [
                styles.categoryButton,
                {
                  opacity: pressed ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
                themeStyles.contrast,
              ]}
            >
              <Image
                source={category.image}
                style={styles.categoryImage}
                contentFit="contain"
              />
              <ThemedText style={styles.categoryTitle}>
                {category.title}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Weekly Calendar */}
        <View style={styles.calendarSection}>
          <View style={[styles.calendarHeader, flexDirection]}>
            <ThemedText style={[styles.sectionTitle]}>
              {t("weeklyToDo")}
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.addButton,
                {
                  backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                },
              ]}
              onPress={() => setAddModalVisible(true)}
            >
              <ThemedText style={styles.addButtonText}>
                {t("addWeekly")}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Days of Week Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysContainer}
          >
            {getDayNames().map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  selectedDay === index && styles.selectedDayButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f0f0f0",
                  },
                  selectedDay === index && {
                    backgroundColor:
                      colorScheme === "dark" ? "#555" : "#e0e0e0",
                  },
                ]}
                onPress={() => {
                  setSelectedDay(index);
                }}
              >
                <ThemedText
                  style={[
                    styles.dayButtonText,
                    selectedDay === index && styles.selectedDayText,
                    getCurrentDayIndex() === index && styles.currentDayText,
                  ]}
                >
                  {day}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected Day Heading */}
          {selectedDay !== null && (
            <ThemedView style={styles.weekPlanerContainer}>
              <ThemedText style={styles.selectedDayTitle}>
                {getFullDayName(selectedDay)}
              </ThemedText>
              <TouchableOpacity onPress={() => undoAllTodosForSelectedDay()}>
                <EvilIcons
                  name="undo"
                  size={30}
                  color={colorScheme === "dark" ? "#ffffff" : "#000000"}
                />
              </TouchableOpacity>
            </ThemedView>
          )}

          {/* Todos for Selected Day */}
          <View style={styles.todosForDay}>
            {selectedDay !== null &&
              weeklyTodos[selectedDay] &&
              weeklyTodos[selectedDay].map((todo) => (
                <View
                  key={todo.id}
                  style={[styles.todoItem, themeStyles.contrast, flexDirection]}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkboxContainer,
                      isRTL ? { marginLeft: 12 } : { marginRight: 12 },
                    ]}
                    onPress={() => toggleTodo(selectedDay, todo.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        todo.completed && styles.checkboxCompleted,
                        {
                          borderColor: colorScheme === "dark" ? "#666" : "#999",
                        },
                        todo.completed && {
                          backgroundColor:
                            colorScheme === "dark" ? "#666" : "#999",
                          borderColor: colorScheme === "dark" ? "#666" : "#999",
                        },
                      ]}
                    >
                      {todo.completed && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>

                  <ThemedText
                    style={[
                      styles.todoText,
                      todo.completed && styles.todoTextCompleted,
                    ]}
                  >
                    {todo.text}
                  </ThemedText>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => showDeleteConfirmation(selectedDay, todo.id)}
                  >
                    <Ionicons
                      name="close-circle-outline"
                      size={22}
                      color={colorScheme === "dark" ? "#999" : "#777"}
                    />
                  </TouchableOpacity>
                </View>
              ))}

            {selectedDay !== null &&
              (!weeklyTodos[selectedDay] ||
                weeklyTodos[selectedDay].length === 0) && (
                <View style={styles.emptyDayContainer}>
                  <Ionicons
                    name="calendar-outline"
                    size={40}
                    color={colorScheme === "dark" ? "#666" : "#999"}
                    style={styles.emptyDayIcon}
                  />
                  <ThemedText style={styles.emptyDayText}>
                    {t("noPrayersForDay")}
                  </ThemedText>
                  <TouchableOpacity
                    style={[
                      styles.emptyDayAddButton,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#333" : "#f0f0f0",
                      },
                    ]}
                    onPress={() => setAddModalVisible(true)}
                  >
                    <ThemedText style={styles.emptyDayAddText}>
                      {t("addWeekly")}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        </View>
      </ScrollView>

      {/* Add Prayer Modal */}
      <Modal
        visible={addModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colorScheme === "dark" ? "#222" : "#fff" },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {t("addForDay")}{" "}
                {selectedDay !== null ? getFullDayName(selectedDay) : ""}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAddModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  backgroundColor: colorScheme === "dark" ? "#333" : "#f5f5f5",
                  textAlign: isRTL ? "right" : "left",
                },
              ]}
              value={newTodo}
              onChangeText={setNewTodo}
              placeholder={t("enterPrayer")}
              placeholderTextColor={colorScheme === "dark" ? "#999" : "#999"}
              multiline={true}
            />

            <View style={[styles.modalButtonsContainer, flexDirection]}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f0f0f0",
                  },
                ]}
                onPress={() => setAddModalVisible(false)}
              >
                <ThemedText style={styles.modalButtonText}>
                  {t("cancel")}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.addModalButton,
                  { backgroundColor: "#4CAF50" },
                ]}
                onPress={addTodo}
              >
                <ThemedText style={[styles.modalButtonText, { color: "#fff" }]}>
                  {t("add")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={[styles.modalOverlay, styles.deletModal]}>
          <View
            style={[
              styles.confirmModalContent,
              { backgroundColor: colorScheme === "dark" ? "#222" : "#fff" },
            ]}
          >
            <View style={styles.confirmIconContainer}>
              <View style={styles.confirmIconBg}>
                <Ionicons
                  name="trash-outline"
                  size={28}
                  color={colorScheme === "dark" ? "#fff" : "#fff"}
                />
              </View>
            </View>

            <ThemedText style={styles.confirmTitle}>
              {t("confirmDelete")}
            </ThemedText>

            <ThemedText style={[styles.confirmText]}>
              {t("deleteQuestion")}
            </ThemedText>

            <View style={[styles.confirmButtonsContainer, flexDirection]}>
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.cancelButton,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f0f0f0",
                  },
                ]}
                onPress={cancelDelete}
              >
                <ThemedText style={styles.confirmButtonText}>
                  {t("cancel")}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  styles.deleteModalButton,
                  { backgroundColor: "#FF5252" },
                ]}
                onPress={confirmDelete}
              >
                <ThemedText
                  style={[styles.confirmButtonText, { color: "#fff" }]}
                >
                  {t("delete")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  // Today's Prayer Section
  randomPrayerCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  prayerCategory: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  prayerText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  readMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Section Titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    marginTop: 8,
  },
  // Categories Section
  categoriesContainer: {
    paddingBottom: 8,
    gap: 12,
  },
  categoryButton: {
    borderRadius: 14,
    padding: 12,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 15,
  },
  // Calendar Section
  calendarSection: {
    marginTop: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  daysContainer: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  selectedDayButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  selectedDayText: {
    fontWeight: "700",
  },
  currentDayText: {
    color: "#4CAF50",
  },
  weekPlanerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  todosForDay: {
    gap: 10,
    minHeight: 200,
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    borderColor: "#4CAF50",
  },
  todoText: {
    flex: 1,
    fontSize: 15,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
  },
  // Empty day state
  emptyDayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  emptyDayIcon: {
    marginBottom: 16,
  },
  emptyDayText: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: "center",
  },
  emptyDayAddButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyDayAddText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  deletModal: {
    justifyContent: "center", // overwrite default flex-end
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  modalInput: {
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    maxHeight: 200,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    opacity: 0.8,
  },
  addModalButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Confirmation Modal Styles
  confirmModalContent: {
    borderRadius: 16,
    padding: 20,
    width: "85%",
    maxWidth: 340,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  confirmIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  confirmIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FF5252",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  confirmText: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 24,
    textAlign: "center",
  },
  confirmButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteModalButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
