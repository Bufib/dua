import React, { useState } from "react";
import { StyleSheet, TextInput, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { coustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
const AddPushMessage: React.FC = () => {
  const themeStyles = coustomTheme();
  const [titel, setTitel] = useState("");
  const [nachricht, setNachricht] = useState("");

  const handleSubmit = () => {
    console.log("Titel:", titel, "Nachricht:", nachricht);
  };

  return (
    <ThemedView
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <ThemedText style={styles.label}>Titel</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: themeStyles.contrast.backgroundColor,
              color: themeStyles.text.color,
            },
          ]}
          placeholder="Geben Sie den Titel ein"
          placeholderTextColor={"#888"}
          value={titel}
          onChangeText={setTitel}
        />

        <ThemedText style={styles.label}>Nachricht</ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            {
              backgroundColor: themeStyles.contrast.backgroundColor,
              color: themeStyles.text.color,
            },
          ]}
          placeholder="Geben Sie die Nachricht ein"
          placeholderTextColor={"#888"}
          value={nachricht}
          onChangeText={setNachricht}
          multiline
        />

        <Pressable style={[styles.button]} onPress={handleSubmit}>
          <ThemedText style={styles.buttonText}>Senden</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
};

export default AddPushMessage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  multilineInput: {
    height: 300,
    textAlignVertical: "top",
  },
  button: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.universal.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
