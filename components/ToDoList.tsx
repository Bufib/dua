// src/components/TodoList.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText"; // Adjust path
import { Ionicons } from "@expo/vector-icons";
import { TodoItem } from "@/utils/types"; // Adjust path
import { CoustomTheme } from "@/utils/coustomTheme"; // Adjust path
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next";

interface TodoListProps {
  todos: TodoItem[] | undefined; // Can be undefined if day has no entry
  dayIndex: number; // Needed for toggle/delete actions
  onToggleTodo: (dayIndex: number, todoId: number) => void;
  onShowDeleteModal: (dayIndex: number, todoId: number) => void;
  onShowAddModal: () => void; // For the empty state button
  isRTL: boolean;
  flexDirection: object; // Pass calculated style object
  t: TFunction;
  themeStyles: ReturnType<typeof CoustomTheme>;
  colorScheme: ColorSchemeName;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  dayIndex,
  onToggleTodo,
  onShowDeleteModal,
  onShowAddModal,
  isRTL,
  flexDirection,
  t,
  themeStyles,
  colorScheme,
}) => {
  if (!todos || todos.length === 0) {
    return (
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
            { backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0" },
          ]}
          onPress={onShowAddModal} // Use prop to trigger modal
        >
          <ThemedText style={styles.emptyDayAddText}>
            {t("addWeekly")}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.todosForDay}>
      {todos.map((todo) => (
        <View
          key={todo.id}
          style={[styles.todoItem, themeStyles.contrast, flexDirection]}
        >
          <TouchableOpacity
            style={[
              styles.checkboxContainer,
              isRTL ? { marginLeft: 12 } : { marginRight: 12 },
            ]}
            onPress={() => onToggleTodo(dayIndex, todo.id)}
          >
            <View
              style={[
                styles.checkbox,
                todo.completed && styles.checkboxCompleted,
                { borderColor: colorScheme === "dark" ? "#666" : "#999" },
                todo.completed && {
                  backgroundColor: colorScheme === "dark" ? "#666" : "#999",
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
            onPress={() => onShowDeleteModal(dayIndex, todo.id)}
          >
            <Ionicons
              name="close-circle-outline"
              size={22}
              color={colorScheme === "dark" ? "#999" : "#777"}
            />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// Add relevant styles from HomeScreen
const styles = StyleSheet.create({
  todosForDay: {
    gap: 10,
    minHeight: 200, // Keep minHeight or adjust as needed
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
    // marginRight is handled dynamically based on isRTL
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
    // backgroundColor and borderColor handled dynamically
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
  emptyDayContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    minHeight: 200, // Match minHeight of todosForDay
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
});
