import React, { useState } from "react";
import { StyleSheet, TextInput, Pressable, View, Alert, Text } from "react-native";
import { coustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { supabase } from "@/utils/supabase";

const AddPushMessage: React.FC = () => {
  const themeStyles = coustomTheme();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Bitte gebe einen Titel und eine Nachricht ein!");
      return;
    }

    setIsSending(true);
    try {
      // Insert the notification into the notifications table
      const { error } = await supabase.from("push_notification").insert({
        title: title.trim(),
        body: message.trim(),
      });

      if (error) throw error;

      Alert.alert("Erfolg", "Deine Nachricht wurde erfolgreich verschickt!");
      // Clear the form
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      Alert.alert("Error", "Fehler beim senden. Bitte versuche es erneut!");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.formContainer}>
        <ThemedText style={styles.label}>Title</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: themeStyles.contrast.backgroundColor,
              color: themeStyles.text.color,
              borderWidth: 1.5,
            },
          ]}
          placeholder="Title deiner Nachricht"
          placeholderTextColor={"#888"}
          value={title}
          onChangeText={setTitle}
        />

        <ThemedText style={styles.label}>Message</ThemedText>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            {
              backgroundColor: themeStyles.contrast.backgroundColor,
              color: themeStyles.text.color,
            },
          ]}
          placeholder="Der Nachrichtentext"
          placeholderTextColor={"#888"}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <Pressable
          style={[styles.button, isSending && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSending}
        >
          <Text style={styles.buttonText}>
            {isSending ? "Wird gesendet..." : "Notification senden"}
          </Text>
        </Pressable>
      </View>
    </ThemedView>
  );
};

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
    borderWidth: 1.5,
  },
  button: {
    borderWidth: 1,
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
    backgroundColor: Colors.universal.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff"
  },
});

export default AddPushMessage;
