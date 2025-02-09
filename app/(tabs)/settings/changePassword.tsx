import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { z } from "zod";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import Feather from "@expo/vector-icons/Feather";
import Toast from "react-native-toast-message";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { coustomTheme } from "@/utils/coustomTheme";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, { message: "Das Passwort muss mindestens 8 Zeichen lang sein." })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=\-]).{8,}$/, {
    message:
      "Das Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.",
  });

// Form schema with password confirmation and old password
const passwordFormSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, { message: "Bitte gib dein altes Passwort ein." }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

// Types & Schema
type PasswordFormData = z.infer<typeof passwordFormSchema>;
type FormErrors = {
  [K in keyof PasswordFormData]?: string;
};

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const themeStyles = coustomTheme();

  // Eye toggle states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const colorScheme = useColorScheme();

  /** Supabase wont work without this */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "USER_UPDATED") {
        Toast.show({
          type: "success",
          text1: "Passwort erfolgreich aktualisiert!",
          topOffset: 60,
        });
        setOldPassword("");
        setPassword("");
        setConfirmPassword("");
        router.push("/(tabs)/settings/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const changeUserPassword = async () => {
    try {
      setLoading(true);
      setErrors({});

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.log(error);
        throw error;
      }
      // Success handling moved to event listener
    } catch (error: any) {
      console.log(error);
      Alert.alert("Fehler", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial handling: checks if the old password is correct,
   * then shows the captcha if everything is valid.
   */
  const handlePasswordChange = async () => {
    try {
      // Basic form validation (oldPassword, new password & confirm)
      const validationResult = passwordFormSchema.safeParse({
        oldPassword,
        password,
        confirmPassword,
      });

      if (!validationResult.success) {
        const formattedErrors: FormErrors = {};
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            formattedErrors[error.path[0] as keyof PasswordFormData] =
              error.message;
          }
        });
        setErrors(formattedErrors);
        return;
      }

      // 2) Check if new password is the same as the old password
      if (oldPassword === password) {
        Alert.alert(
          "Fehler",
          "Dein neues Passwort darf nicht dein altes sein."
        );
        setLoading(false);
        return;
      }

      setLoading(true);

      // Check the user's old password by re-signing in
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert("Fehler", "Benutzerdaten konnten nicht abgerufen werden.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password: oldPassword,
      });

      if (signInError) {
        setLoading(false);
        Alert.alert("Fehler", "Dein altes Passwort ist nicht korrekt!");
        return;
      }
      // Old password is correct, change password
      await changeUserPassword();
    } catch (error: any) {
      Alert.alert("Fehler", error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to render validation error messages
   */
  const renderError = (key: keyof FormErrors) => {
    return errors[key] ? (
      <Text style={styles.errorText}>{errors[key]}</Text>
    ) : null;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Passwort ändern</ThemedText>

      {/* Old Password Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Altes Passwort</ThemedText>
        <View style={[styles.passwordContainer, themeStyles.contrast]}>
          <TextInput
            style={[styles.passwordInput, themeStyles.text]}
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            placeholder="Altes Passwort eingeben"
            placeholderTextColor="#666"
          />
          <Pressable
            onPress={() => setShowOldPassword(!showOldPassword)}
            style={styles.eyeIcon}
          >
            {showOldPassword ? (
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
        {renderError("oldPassword")}
      </View>

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Neues Passwort</ThemedText>
        <View style={[styles.passwordContainer, themeStyles.contrast]}>
          <TextInput
            style={[styles.passwordInput, themeStyles.text]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="Neues Passwort eingeben"
            placeholderTextColor="#666"
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
        {renderError("password")}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Passwort bestätigen</ThemedText>
        <View style={[styles.passwordContainer, themeStyles.contrast]}>
          <TextInput
            style={[styles.passwordInput, themeStyles.text]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholder="Passwort bestätigen"
            placeholderTextColor="#666"
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
        {renderError("confirmPassword")}
      </View>

      {/* Submit Button */}
      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handlePasswordChange}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? "Wird aktualisiert..." : "Passwort aktualisieren"}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: Colors.universal.error,
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: Colors.universal.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: "#888",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
