// src/components/WeeklyCalendarSection.tsx
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { EvilIcons } from "@expo/vector-icons";
import { DaySelector } from "./DaySelector";
import { TodoList } from "./ToDoList";
import { WeeklyTodos, TodoItem } from "@/utils/types";
import { getFullDayName } from "@/utils/dayNames";
import { CoustomTheme } from "@/utils/coustomTheme";
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next";
import { Colors } from "@/constants/Colors";

interface WeeklyCalendarSectionProps {
  weeklyTodos: WeeklyTodos;
  isLoadingTodos: boolean;
  selectedDay: number | null;
  currentDayIndex: number; // Need current day for DaySelector styling
  onSelectDay: (dayIndex: number) => void;
  onToggleTodo: (dayIndex: number, todoId: number) => void;
  onShowAddModal: () => void;
  onShowDeleteModal: (dayIndex: number, todoId: number) => void;
  onUndoAll: (dayIndex: number) => void;
  language: string;
  t: TFunction;
  themeStyles: ReturnType<typeof CoustomTheme>;
  colorScheme: ColorSchemeName;
  isRTL: boolean;
  flexDirection: object; // Pass calculated style object
}

export const WeeklyCalendarSection: React.FC<WeeklyCalendarSectionProps> = ({
  weeklyTodos,
  isLoadingTodos,
  selectedDay,
  currentDayIndex,
  onSelectDay,
  onToggleTodo,
  onShowAddModal,
  onShowDeleteModal,
  onUndoAll,
  language,
  t,
  themeStyles,
  colorScheme,
  isRTL,
  flexDirection,
}) => {
  const handleUndo = () => {
    if (selectedDay !== null) {
      onUndoAll(selectedDay);
    }
  };

  return (
    <View style={styles.calendarSection}>
      {/* Header */}
      <View style={[styles.calendarHeader, flexDirection]}>
        <ThemedText style={[styles.sectionTitle]}>{t("weeklyToDo")}</ThemedText>
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? Colors.universal.primary
                  : Colors.universal.secondary,
            },
            selectedDay === null && { opacity: 0.5 }, // Dim if no day selected
          ]}
          onPress={onShowAddModal}
          disabled={selectedDay === null}
        >
          <ThemedText style={styles.addButtonText}>{t("addWeekly")}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Day Selector */}
      <DaySelector
        selectedDay={selectedDay}
        currentDayIndex={currentDayIndex}
        onSelectDay={onSelectDay}
        language={language}
        t={t}
        colorScheme={colorScheme}
      />

      {/* Selected Day Heading */}
      {selectedDay !== null && (
        <ThemedView style={[styles.weekPlanerContainer, flexDirection]}>
          <ThemedText style={styles.selectedDayTitle}>
            {getFullDayName(selectedDay)}
          </ThemedText>
          <TouchableOpacity onPress={handleUndo}>
            <View style={{ flexDirection: "row", gap: 5 }}>
              <ThemedText style={{ fontSize: 12 }}>{t("undo")}</ThemedText>
              <EvilIcons
                name="undo"
                size={30}
                color={colorScheme === "dark" ? "#ffffff" : "#000000"}
              />
            </View>
          </TouchableOpacity>
        </ThemedView>
      )}

      {/* Todo List Area */}
      {isLoadingTodos ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#fff" : "#000"}
          />
        </View>
      ) : selectedDay !== null ? (
        <TodoList
          todos={weeklyTodos[selectedDay]}
          dayIndex={selectedDay}
          onToggleTodo={onToggleTodo}
          onShowDeleteModal={onShowDeleteModal}
          onShowAddModal={onShowAddModal} // Pass down for empty state button
          isRTL={isRTL}
          flexDirection={flexDirection}
          t={t}
          themeStyles={themeStyles}
          colorScheme={colorScheme}
        />
      ) : (
        // Optional: Placeholder when no day is selected yet
        <View style={styles.loadingContainer}>
          <ThemedText>
            {t("selectDayPrompt") || "Select a day above"}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

// Add relevant styles from HomeScreen
const styles = StyleSheet.create({
  loadingContainer: {
    minHeight: 200, // Match TodoList minHeight
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  // Copy relevant styles from HomeScreen.ts here
  calendarSection: {
    marginTop: 16,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
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
  weekPlanerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  selectedDayTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
