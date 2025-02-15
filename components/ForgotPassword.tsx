import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
  Pressable,
  Platform,
  Keyboard,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors } from "@/constants/Colors";
import { coustomTheme } from "@/utils/coustomTheme";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useAuthStore } from "@/stores/authStore";
import { TouchableWithoutFeedback } from "react-native";
import { NoInternet } from "./NoInternet";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

// Define validation schema with Zod
const schema = z.object({
  email: z
    .string({
      required_error: "E-Mail Adresse wird benötigt",
    })
    .email("Ungültige E-Mail Adresse"),
});

type ForgotPasswordFormValues = {
  email: string;
};

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const themeStyles = coustomTheme();
  const clearSession = useAuthStore.getState().clearSession;
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const hasInternet = useConnectionStatus();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const handleResetPassword = async (data: ForgotPasswordFormValues) => {
    try {
      setLoading(true);
      // Check if user is logged in and log them out first
      if (isLoggedIn) {
        console.log("User is logged in, logging out first...");
        await clearSession();

        // Wait briefly to allow logout process to complete
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      const { error } = await supabase.auth.resetPasswordForEmail(data.email);

      if (error) throw error;

      Alert.alert("Code gesendet", "Prüfe deine E-Mails für den Reset-Code.");

      router.replace({
        pathname: "/resetPassword",
        params: { email: data.email },
      });
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "Ein unerwarteter Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.container, themeStyles.defaultBackgorundColor]}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        enabled
      >
        <NoInternet showUI={true} showToast={false} />
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, themeStyles.contrast, themeStyles.text]}
              placeholder="Deine E-Mail-Adresse"
              onChangeText={onChange}
              value={value}
              autoCapitalize="none"
              keyboardType="email-address"
              onSubmitEditing={Keyboard.dismiss}
              returnKeyType="done"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.error}>{errors.email.message}</Text>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
            (loading || !hasInternet) && styles.disabledButton,
          ]}

          onPress={handleSubmit(handleResetPassword)}
          disabled={loading || !hasInternet}
        >
          <ThemedText style={styles.resetButtonText}>
            Reset-Code anfordern
          </ThemedText>
        </Pressable>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 7,
  },
  resetButton: {
    marginTop: 5,
    alignSelf: "center",
    padding: 10,
    borderRadius: 7,
    backgroundColor: Colors.universal.primary,
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  resetButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  error: {
    color: Colors.universal.error,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.7,
  },
});
