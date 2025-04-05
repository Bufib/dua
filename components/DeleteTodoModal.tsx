// src/components/DeleteTodoModal.tsx
import React from "react";
import { View, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText"; // Adjust path
import { Ionicons } from "@expo/vector-icons";
import { CoustomTheme } from "@/utils/coustomTheme"; // Adjust path
import type { ColorSchemeName } from "react-native";
import type { TFunction } from "i18next";

interface DeleteTodoModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  t: TFunction;
  themeStyles: ReturnType<typeof CoustomTheme>;
  colorScheme: ColorSchemeName;
  flexDirection: object;
}

export const DeleteTodoModal: React.FC<DeleteTodoModalProps> = ({
  visible,
  onClose,
  onConfirmDelete,
  t,
  themeStyles,
  colorScheme,
  flexDirection,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
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
              <Ionicons name="trash-outline" size={28} color="#fff" />
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
                  backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
                },
              ]}
              onPress={onClose} // Use onClose prop
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
              onPress={onConfirmDelete} // Use onConfirmDelete prop
            >
              <ThemedText style={[styles.confirmButtonText, { color: "#fff" }]}>
                {t("delete")}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Add relevant styles from HomeScreen
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  deletModal: {
    justifyContent: "center", 
  },
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
    flexDirection: "row", // Handled by prop
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
  cancelButton: {
    opacity: 0.8,
  },
  deleteModalButton: {},
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
