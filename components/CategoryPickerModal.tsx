import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Modal from "react-native-modal";
import WheelColorPicker from "react-native-wheel-color-picker";
import { useTranslation } from "react-i18next";
import {
  getCategories,
  createCategory,
  Category,
} from "../utils/favoriteCategories";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: Category) => void;
}

const CategoryPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState<string>("#3498db");
  const [creating, setCreating] = useState(false);

  // Fetch categories whenever the modal opens
  useEffect(() => {
    if (visible) {
      getCategories()
        .then(setCategories)
        .catch((err) => {
          console.error("Failed to load categories:", err);
          Alert.alert(t("toast.error"), t("FavoriteCategories.loadFailed"));
        });
    }
  }, [visible, t]);

  const handleCreate = async () => {
    const name = categoryName.trim();
    if (!name) {
      Alert.alert(t("toast.error"), t("FavoriteCategories.nameRequired"));
      return;
    }
  
    // check against existing category names (ignore case & surrounding whitespace)
    const exists = categories.some(
      (cat) => cat.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      Alert.alert(t("toast.error"), t("FavoriteCategories.nameExists"));
      return;
    }
  
    setCreating(true);
    try {
      const newCat = await createCategory(name, color);
      // immediately select it
      onSelect(newCat);
      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      Alert.alert(t("toast.error"), t("FavoriteCategories.createFailed"));
    } finally {
      setCreating(false);
    }
  };
  

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        onSelect(item);
        onClose();
      }}
    >
      <View style={[styles.dot, { backgroundColor: item.color }]} />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      avoidKeyboard
      style={styles.modal}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          {t("FavoriteCategories.selectCategory")}
        </Text>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategory}
          style={styles.list}
        />

        <View style={styles.divider} />

        <Text style={styles.subtitle}>
          {t("FavoriteCategories.newCategory")}
        </Text>
        <TextInput
          placeholder={t("FavoriteCategories.namePlaceholder")}
          value={categoryName}
          onChangeText={setCategoryName}
          style={styles.input}
        />

        <Text style={styles.subtitle}>{t("FavoriteCategories.pickColor")}</Text>
        <View style={styles.pickerContainer}>
          <WheelColorPicker
            color={color}
            onColorChangeComplete={setColor}
            thumbSize={30}
            sliderSize={20}
            noSnap
            row={false}
            swatches
            swatchesLast
            swatchesOnly={false}
          />
        </View>

        <TouchableOpacity
          onPress={handleCreate}
          disabled={creating}
          style={[styles.button, creating && styles.buttonDisabled]}
        >
          {creating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              {t("FavoriteCategories.createButton")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>{t("cancel")}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default CategoryPickerModal;

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    maxHeight: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  list: {
    maxHeight: 150,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  pickerContainer: {
    height: 300,
    marginBottom: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancel: {
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelText: {
    color: "#888",
    fontSize: 14,
  },
});
