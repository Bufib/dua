import React, { useState } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  Button,
  Text,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Feather from "@expo/vector-icons/Feather";
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";

/**
 * Enhanced Zod Schema:
 * - If your reset code is numeric or must be 6 digits, you can use .regex(/^\d{6}$/)
 * - or keep it as is if your code can be any string from Supabase.
 */
const schema = z
  .object({
    code: z
      .string()
      .nonempty("Code wird benötigt")
      //! .regex(/^\d{6}$/, "Code muss 6 Ziffern enthalten") // Example if code is always 6 digits
      .min(1, "Code wird benötigt"),
    newPassword: z
      .string()
      .nonempty("Password wird benötigt")
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=\-]).{8,}$/,
        "Passwort muss mind. einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten"
      ),
    confirmPassword: z
      .string()
      .nonempty("Password wird benötigt")
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof schema>;

export function ResetPassword() {
  const params = useLocalSearchParams();
  const email = Array.isArray(params.email) ? params.email[0] : params.email;
  const [loading, setLoading] = useState(false);

  // Show/hide password fields
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const themeStyles = coustomTheme();

  const colorScheme = useColorScheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  // const handleUpdatePassword = async (data: ResetPasswordFormValues) => {
  //   if (!email) {
  //     Alert.alert("Error", "E-mail wird benötigt!");
  //     return;
  //   }

  //   // Check for internet connectivity
  //   const netInfo = await NetInfo.fetch();
  //   if (!netInfo.isConnected) {
  //     Alert.alert(
  //       "Keine Internetverbindung",
  //       "Bitte überprüfe deine Verbindung."
  //     );
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     // Verify the recovery token
  //     const { data: verifyData, error: verifyError } =
  //       await supabase.auth.verifyOtp({
  //         email,
  //         token: data.code,
  //         type: "recovery",
  //       });

  //     if (verifyError) throw verifyError;

  //     if (!verifyData.session) {
  //       throw new Error("Session could not be created after OTP verification.");
  //     }

  //     console.log("OTP verified successfully");

  //     // Defer the password update operation

  //     try {
  //       const { error: updateError } = await supabase.auth.updateUser({
  //         password: data.newPassword,
  //       });
  //       if (updateError) throw updateError;

  //       // Success
  //       Alert.alert("Erfolg", "Dein Passwort wurde aktualisiert.");
  //       router.replace("/login");
  //     } catch (updateError) {
  //       if (updateError instanceof Error) {
  //         Alert.alert("Error", updateError.message);
  //       } else {
  //         Alert.alert("Error", "Ein unerwarteter Fehler ist aufgetreten.");
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   } catch (error) {
  //     if (error instanceof Error) {
  //       // More user-friendly errors:
  //       if (error.message.includes("Invalid or expired token")) {
  //         Alert.alert("Fehler", "Der Code ist ungültig oder abgelaufen.");
  //       } else {
  //         Alert.alert("Error", error.message);
  //       }
  //     } else {
  //       Alert.alert("Error", "Ein unerwarteter Fehler ist aufgetreten.");
  //     }
  //     setLoading(false); // Ensure loading is stopped in case of error
  //   }
  // };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "USER_UPDATED") {
        Alert.alert("Erfolg", "Dein Passwort wurde aktualisiert.", [
          {
            text: "OK",

            onPress: () => router.replace("/login"),
          },
        ]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Move the handler to the main component
  const handleUpdatePassword = async (data: ResetPasswordFormValues) => {
    if (!email) {
      Alert.alert("Error", "E-mail wird benötigt!");
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(
        "Keine Internetverbindung",
        "Bitte überprüfe deine Verbindung."
      );
      return;
    }

    try {
      setLoading(true);
      const { data: verifyData, error: verifyError } =
        await supabase.auth.verifyOtp({
          email,
          token: data.code,
          type: "recovery",
        });

      if (verifyError) throw verifyError;
      if (!verifyData.session) {
        throw new Error("Session could not be created after OTP verification.");
      }

      console.log("OTP verified successfully");

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateError) throw updateError;
      // Success handling is now in the event listener
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid or expired token")) {
          Alert.alert("Fehler", "Der Code ist ungültig oder abgelaufen.");
        } else {
          Alert.alert("Error", error.message);
        }
      } else {
        Alert.alert("Error", "Ein unerwarteter Fehler ist aufgetreten.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* CODE FIELD */}
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, themeStyles.contrast, themeStyles.text]}
            placeholder="Reset-Code eingeben"
            onChangeText={onChange}
            value={value}
            keyboardType="number-pad"
          />
        )}
      />
      {errors.code && <Text style={styles.error}>{errors.code.message}</Text>}

      {/* NEW PASSWORD FIELD */}
      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.passwordContainer, themeStyles.contrast]}>
            <TextInput
              style={[styles.passwordInput, themeStyles.text]}
              placeholder="Neues Passwort eingeben"
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              {showPassword ? (
                <Feather
                  name="eye"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              ) : (
                <Feather
                  name="eye-off"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              )}
            </Pressable>
          </View>
        )}
      />
      {errors.newPassword && (
        <Text style={styles.error}>{errors.newPassword.message}</Text>
      )}

      {/* CONFIRM PASSWORD FIELD */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <View style={[styles.passwordContainer, themeStyles.contrast]}>
            <TextInput
              style={[styles.passwordInput, themeStyles.text]}
              placeholder="Passwort bestätigen"
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showConfirmPassword}
            />
            <Pressable
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
            >
              {showConfirmPassword ? (
                <Feather
                  name="eye"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              ) : (
                <Feather
                  name="eye-off"
                  size={24}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                />
              )}
            </Pressable>
          </View>
        )}
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{errors.confirmPassword.message}</Text>
      )}

      {/* 3) Button with a basic loading indicator */}
      {loading ? (
        <ActivityIndicator
          style={styles.loadingIndicator}
          color={Colors.universal.primary}
        />
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit(handleUpdatePassword)}
        >
          <Text style={styles.resetButtonText}>Passwort aktualisieren</Text>
        </Pressable>
      )}
    </ThemedView>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    marginBottom: 16,
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
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  loadingIndicator: {
    marginVertical: 16,
  },
});
