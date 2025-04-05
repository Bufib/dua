// hooks/useWeeklyTodos.ts
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeeklyTodos, TodoItem } from "@/utils/types"; // Make sure types path is correct
import { defaultWeeklyTodos } from "@/utils/defaultWeeklyTodos"; // Make sure path is correct

const WEEKLY_TODOS_STORAGE_KEY = "prayer_app_weekly_todos";

interface UseWeeklyTodosResult {
  weeklyTodos: WeeklyTodos;
  isLoading: boolean; // Optional: Add loading state if async operations take time
  toggleTodo: (dayIndex: number, todoId: number) => void;
  addTodo: (dayIndex: number, text: string) => void;
  deleteTodo: (dayIndex: number, todoId: number) => void;
  undoAllTodosForDay: (dayIndex: number) => void;
  loadTodos: () => Promise<void>; // Expose load function if manual reload is needed
}

export const useWeeklyTodos = (language: string): UseWeeklyTodosResult => {
  const [weeklyTodos, setWeeklyTodos] = useState<WeeklyTodos>({});
  const [isLoading, setIsLoading] = useState<boolean>(true); // Optional loading state

  // --- Load Todos ---
  const loadTodos = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const storedTodos = await AsyncStorage.getItem(WEEKLY_TODOS_STORAGE_KEY);
      if (storedTodos !== null) {
        setWeeklyTodos(JSON.parse(storedTodos));
      } else {
        // Set default todos based on language if no saved todos
        const defaultTodos =
          defaultWeeklyTodos[language as keyof typeof defaultWeeklyTodos] ||
          defaultWeeklyTodos.en;
        setWeeklyTodos(defaultTodos);
        // Save default todos to storage immediately
        await AsyncStorage.setItem(
          WEEKLY_TODOS_STORAGE_KEY,
          JSON.stringify(defaultTodos)
        );
      }
    } catch (error) {
      console.error("Error loading todos:", error);
      // Fallback to default on error
      const defaultTodos =
        defaultWeeklyTodos[language as keyof typeof defaultWeeklyTodos] ||
        defaultWeeklyTodos.en;
      setWeeklyTodos(defaultTodos);
    } finally {
      setIsLoading(false);
    }
  }, [language]); // Reload if language changes

  useEffect(() => {
    loadTodos();
  }, [loadTodos]); // Dependency array includes the memoized loadTodos

  // --- Save Todos ---
  useEffect(() => {
    const saveTodos = async (): Promise<void> => {
      // Don't save during initial load or if weeklyTodos is empty after initialization
      if (!isLoading && Object.keys(weeklyTodos).length > 0) {
        try {
          await AsyncStorage.setItem(
            WEEKLY_TODOS_STORAGE_KEY,
            JSON.stringify(weeklyTodos)
          );
        } catch (error) {
          console.error("Error saving todos:", error);
        }
      }
    };

    saveTodos();
  }, [weeklyTodos, isLoading]); // Save whenever weeklyTodos changes (and not loading)

  // --- Modify Todos ---

  const toggleTodo = useCallback((dayIndex: number, todoId: number): void => {
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
  }, []); // No dependencies needed if only using setWeeklyTodos updater form

  const addTodo = useCallback((dayIndex: number, text: string): void => {
    if (text.trim()) {
      const newTodoItem: TodoItem = {
        id: Date.now(), // Use timestamp for unique ID
        text: text.trim(),
        completed: false,
      };

      setWeeklyTodos((prevTodos) => {
        const dayTodos = [...(prevTodos[dayIndex] || [])];
        const updatedDayTodos = [...dayTodos, newTodoItem];

        return {
          ...prevTodos,
          [dayIndex]: updatedDayTodos,
        };
      });
    }
  }, []); // No dependencies needed

  const deleteTodo = useCallback((dayIndex: number, todoId: number): void => {
    setWeeklyTodos((prevTodos) => {
      const dayTodos = [...(prevTodos[dayIndex] || [])];
      const updatedDayTodos = dayTodos.filter((todo) => todo.id !== todoId);

      // Create a new object to ensure state update triggers re-render
      const newTodos = { ...prevTodos };
      if (updatedDayTodos.length > 0) {
        newTodos[dayIndex] = updatedDayTodos;
      } else {
        // Optionally remove the day key if it becomes empty
        delete newTodos[dayIndex];
      }
      return newTodos;

      // Alternative: Keep the day key with an empty array
      // return {
      //   ...prevTodos,
      //   [dayIndex]: updatedDayTodos,
      // };
    });
  }, []); // No dependencies needed

  const undoAllTodosForDay = useCallback((dayIndex: number): void => {
    setWeeklyTodos((prevTodos) => {
      // Create a shallow copy of the previous todos
      const newTodos = { ...prevTodos };
      // If there are todos for the selected day, update them
      if (newTodos[dayIndex]) {
        newTodos[dayIndex] = newTodos[dayIndex].map((todo) => ({
          ...todo,
          completed: false,
        }));
      }
      return newTodos;
    });
  }, []); // No dependencies needed

  return {
    weeklyTodos,
    isLoading,
    toggleTodo,
    addTodo,
    deleteTodo,
    undoAllTodosForDay,
    loadTodos,
  };
};
