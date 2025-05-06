import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ColorSchemeName,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import { CoustomTheme } from "../utils/coustomTheme";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { TodoToDelete, DailyPrayer, CategoryItem } from "@/utils/types"; // Adjust path
import { categories } from "@/utils/categories";
import { useWeeklyTodos } from "@/hooks/useWeeklyTodos";
import { useDailyPrayer } from "@/hooks/useDailyPrayer";
import { getFullDayName } from "@/utils/dayNames";

// Import the new components
import { DailyPrayerCard } from "@/components/DailyPrayerCard";
import { CategoriesRow } from "@/components/CategoriesRow";
import { WeeklyCalendarSection } from "@/components/WeeklyCalendarSection";
import { AddTodoModal } from "@/components/AddTodoModal";
import { DeleteTodoModal } from "@/components/DeleteTodoModal";

const QuestionLinks = () => {
  const themeStyles = CoustomTheme();
  const colorScheme: ColorSchemeName = useColorScheme() || "light";
  const { t } = useTranslation();
  const { language } = useLanguage();

  // --- Hooks ---
  const {
    weeklyTodos,
    isLoadingTodos,
    toggleTodo,
    addTodo,
    deleteTodo,
    undoAllTodosForDay,
  } = useWeeklyTodos(language);

  const { dailyPrayer, isLoadingPrayer } = useDailyPrayer(language);

  // --- State ---
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [todoToDelete, setTodoToDelete] = useState<TodoToDelete>({
    dayIndex: null,
    todoId: null,
  });

  // --- Effects ---
  const getCurrentDayIndex = useCallback((): number => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun (0-6)
  }, []);

  useEffect(() => {
    setSelectedDay(getCurrentDayIndex());
  }, [getCurrentDayIndex]);

  // --- Handlers ---
  const handleAddTodoConfirmed = useCallback(
    (text: string): void => {
      if (selectedDay !== null) {
        addTodo(selectedDay, text);
      }
      setAddModalVisible(false); // Close modal after adding
    },
    [addTodo, selectedDay]
  );

  const showDeleteConfirmation = useCallback(
    (dayIndex: number, todoId: number): void => {
      setTodoToDelete({ dayIndex, todoId });
      setDeleteModalVisible(true);
    },
    []
  );

  const handleConfirmDelete = useCallback((): void => {
    const { dayIndex, todoId } = todoToDelete;
    if (dayIndex !== null && todoId !== null) {
      deleteTodo(dayIndex, todoId);
    }
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, [deleteTodo, todoToDelete]);

  const cancelDelete = useCallback((): void => {
    setDeleteModalVisible(false);
    setTodoToDelete({ dayIndex: null, todoId: null });
  }, []);

  const handleUndoAll = useCallback(
    (dayIndex: number): void => {
      // The check for null selectedDay happens inside WeeklyCalendarSection now
      // or keep it here if needed: if (selectedDay !== null && dayIndex === selectedDay) { ... }
      undoAllTodosForDay(dayIndex);
    },
    [undoAllTodosForDay]
  );

  const handleSelectDay = useCallback((dayIndex: number): void => {
    setSelectedDay(dayIndex);
  }, []);

  const handleShowAddModal = useCallback(() => {
    // Optional: Could add checks here, e.g., if a day is selected
    if (selectedDay !== null) {
      setAddModalVisible(true);
    } else {
      // Maybe show an alert?
      console.warn("Please select a day first.");
    }
  }, [selectedDay]);

  const handleReadMorePress = useCallback((prayer: DailyPrayer) => {
    if (!prayer) return;
    router.push({
      pathname: "/[prayer]", // Adjust route if needed
      params: {
        prayer: prayer.id?.toString(), // Ensure ID is passed correctly
      },
    });
  }, []);

  const handleCategoryPress = useCallback((category: CategoryItem) => {
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
  }, []);

  // --- Style Calculations ---
  const isRTL = language === "AR";
  const flexDirection = isRTL
    ? { flexDirection: "row-reverse" as const }
    : { flexDirection: "row" as const };

  // --- Render ---
  return (
   
      <View style={[styles.container, themeStyles.defaultBackgorundColor]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Render Components */}
          <DailyPrayerCard
            prayer={dailyPrayer}
            isLoading={isLoadingPrayer}
            language={language}
            onPressReadMore={handleReadMorePress}
            t={t}
            themeStyles={themeStyles}
            colorScheme={colorScheme}
            isRTL={isRTL}
            flexDirection={flexDirection}
          />

          <CategoriesRow
            onPressCategory={handleCategoryPress}
            t={t}
            themeStyles={themeStyles}
          />

          <WeeklyCalendarSection
            weeklyTodos={weeklyTodos}
            isLoadingTodos={isLoadingTodos}
            selectedDay={selectedDay}
            currentDayIndex={getCurrentDayIndex()} // Pass current day index
            onSelectDay={handleSelectDay}
            onToggleTodo={toggleTodo} // Pass directly from hook
            onShowAddModal={handleShowAddModal}
            onShowDeleteModal={showDeleteConfirmation} // Pass handler
            onUndoAll={handleUndoAll} // Pass handler
            language={language}
            t={t}
            themeStyles={themeStyles}
            colorScheme={colorScheme}
            isRTL={isRTL}
            flexDirection={flexDirection}
          />
        </ScrollView>

        {/* Render Modals */}
        {selectedDay !== null && ( // Only render Add modal if a day is potentially selected
          <AddTodoModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onAdd={handleAddTodoConfirmed}
            selectedDayName={getFullDayName(selectedDay)}
            language={language}
            t={t}
            themeStyles={themeStyles}
            colorScheme={colorScheme}
            isRTL={isRTL}
            flexDirection={flexDirection}
          />
        )}

        <DeleteTodoModal
          visible={deleteModalVisible}
          onClose={cancelDelete}
          onConfirmDelete={handleConfirmDelete}
          t={t}
          themeStyles={themeStyles}
          colorScheme={colorScheme}
          flexDirection={flexDirection}
        />
      </View>
  
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
});

export default QuestionLinks;
