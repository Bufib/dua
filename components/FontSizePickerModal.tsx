import React, { useEffect } from "react";
import { Modal, StyleSheet, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { CoustomTheme } from "../utils/coustomTheme";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface FontSizePickerModalProps {
  visible: boolean;
  onClose: () => void;
}

const fontSizeOptions = [
  { label: "Klein", fontSize: 16, lineHeight: 28 },
  { label: "Mittel", fontSize: 18, lineHeight: 35 },
  { label: "Groß", fontSize: 22, lineHeight: 40 },
];

const FontSizePickerModal: React.FC<FontSizePickerModalProps> = ({
  visible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const themeStyles = CoustomTheme();

  const { fontSize, lineHeight, setFontSize, setLineHeight } =
    useFontSizeStore(); // Zustand store for font size

  const [pickerValue, setPickerValue] = React.useState(
    fontSizeOptions.find((option) => option.fontSize === fontSize)?.label ||
      "Mittel"
  );

  useEffect(() => {
    if (visible) {
      // Sync picker value with Zustand state
      const selectedOption = fontSizeOptions.find(
        (option) => option.fontSize === fontSize
      );
      setPickerValue(selectedOption?.label || "Mittel");
    }
  }, [visible, fontSize]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Modal Background */}
      <Pressable style={styles.modalContainer} onPress={onClose}>
        {/* Modal Content */}
        <Pressable
          style={[
            styles.pickerContainer,
            themeStyles.contrast,
            { borderColor: colorScheme === "dark" ? "#fff" : "#000" },
          ]}
          onPress={() => {}}
        >
          <Picker
            selectedValue={pickerValue}
            onValueChange={(itemValue) => {
              setPickerValue(itemValue);

              const selectedOption = fontSizeOptions.find(
                (option) => option.label === itemValue
              );

              if (selectedOption) {
                setFontSize(selectedOption.fontSize);
                setLineHeight(selectedOption.lineHeight);
              }

              // Dismiss the picker modal
              onClose();
            }}
          >
            {fontSizeOptions.map((option) => (
              <Picker.Item
                key={option.label}
                label={option.label}
                value={option.label}
                color={
                  colorScheme === "light"
                    ? Colors.light.modalQuestionText
                    : Colors.dark.modalQuestionText
                }
              />
            ))}
          </Picker>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.modalQuestionBlurredBackground,
  },
  pickerContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    borderWidth: 1,
  },
});

export default FontSizePickerModal;
