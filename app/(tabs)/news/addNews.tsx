import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Switch,
  Image,
  FlatList,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";

import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import { Colors } from "@/constants/Colors";
import { TitleSearchInput } from "@/components/TitleSearch";
import { useAddNews } from "@/hooks/useAddNews"; // Path may vary

export default function AddNews() {
  const {
    control,
    handleSubmit,
    errors,
    selectedImages,
    uploading,
    pickImages,
    removeImage,
    onSubmit,
  } = useAddNews();

  const themeStyles = coustomTheme();

  return (
    <SafeAreaView
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      edges={["top"]}
    >
      <ScrollView
        style={[styles.scrollViewStyle, themeStyles.defaultBackgorundColor]}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <ThemedText style={styles.header} type="title">
          Nachricht hinzufügen
        </ThemedText>

        <View style={[styles.card, themeStyles.contrast]}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, themeStyles.text]}
                onChangeText={onChange}
                value={value}
                placeholder="Gib einen Titel ein"
                placeholderTextColor="#888"
              />
            )}
          />
          
          <ThemedText style={styles.label}>Nachricht</ThemedText>
          <Controller
            control={control}
            name="body_text"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, styles.textArea, themeStyles.text]}
                onChangeText={onChange}
                value={value}
                placeholder="Gib eine Nachricht ein"
                multiline
                placeholderTextColor="#888"
              />
            )}
          />

          <ThemedText style={styles.label}>Externe URL</ThemedText>
          <Controller
            control={control}
            name="external_url"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, themeStyles.text]}
                onChangeText={onChange}
                value={value}
                placeholder="Gib eine vollständinge URL (mit http...) ein"
                placeholderTextColor="#888"
              />
            )}
          />

          <ThemedText style={styles.label}>Verlinke eine Frage</ThemedText>
          <Controller
            control={control}
            name="internal_url"
            render={({ field: { onChange, value } }) => (
              <TitleSearchInput
                value={value}
                onChangeText={onChange}
                themeStyles={themeStyles}
              />
            )}
          />

          <ThemedText style={styles.label}>Nachricht fixieren?</ThemedText>
          <Controller
            control={control}
            name="is_pinned"
            render={({ field: { onChange, value } }) => (
              <Switch onValueChange={onChange} value={value} />
            )}
          />
        </View>

        <Pressable style={styles.pickImageButton} onPress={pickImages}>
          <Text style={styles.imagePickerText}>
            {selectedImages.length
              ? "Mehr Bilder auswählen"
              : "Bilder hochladen"}
          </Text>
        </Pressable>

        {selectedImages.length > 0 && (
          <FlatList
            data={selectedImages}
            keyExtractor={(item) => item.uri}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.uri }} style={styles.imagePreview} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => removeImage(item.uri)}
                >
                  <Text style={styles.removeButtonText}>Entfernen</Text>
                </Pressable>
              </View>
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 10 }}
          />
        )}

        <Pressable
          style={[styles.submitButton, uploading && styles.disabledButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={uploading}
        >
          <Text style={styles.submitButtonText}>
            {uploading ? "Wird hochgeladen..." : "Hochladen"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollViewStyle: {
    flex: 1,
    padding: 20,
  },
  scrollViewContentContainer: {
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    gap: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 200,
  },
  pickImageButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.universal.pickImageButton,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  imageContainer: {
    marginRight: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  submitButton: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: Colors.universal.submitButton,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
