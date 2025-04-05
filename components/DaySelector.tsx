// src/components/DaySelector.tsx
import React from "react";
import { ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText"; // Adjust path
import { getDayNames } from "@/utils/dayNames"; // Adjust path
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next";

interface DaySelectorProps {
  selectedDay: number | null;
  currentDayIndex: number;
  onSelectDay: (dayIndex: number) => void;
  language: string; // Needed for getDayNames if it depends on it
  t: TFunction;
  colorScheme: ColorSchemeName;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDay,
  currentDayIndex,
  onSelectDay,
  language, // Pass language if getDayNames uses it
  t,
  colorScheme,
}) => {
  const dayNames = getDayNames(); // Assuming getDayNames takes t

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.daysContainer}
    >
      {dayNames.map((day, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayButton,
            selectedDay === index && styles.selectedDayButton,
            { backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0" },
            selectedDay === index && {
              backgroundColor: colorScheme === "dark" ? "#555" : "#e0e0e0",
            },
          ]}
          onPress={() => onSelectDay(index)}
        >
          <ThemedText
            style={[
              styles.dayButtonText,
              selectedDay === index && styles.selectedDayText,
              currentDayIndex === index && styles.currentDayText,
            ]}
          >
            {day}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Add relevant styles from HomeScreen
const styles = StyleSheet.create({
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
});
