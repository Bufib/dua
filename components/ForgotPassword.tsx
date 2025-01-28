import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Button,
  Text,
  Pressable,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Colors } from "@/constants/Colors";

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
    <View style={styles.container}>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="E-Mail Adresse eingeben"
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Pressable onPress={handleSubmit(handleResetPassword)} disabled={loading}>
        <Text>Reset-Code anfordern"</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  input: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,

    borderRadius: 6,
  },
  error: {
    color: Colors.universal.error,
    marginBottom: 12,
  },
});
