import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Pressable,
  useColorScheme,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import NetInfo from "@react-native-community/netinfo";
import Feather from "@expo/vector-icons/Feather";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/stores/authStore";
import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import {
  loginEmailNotEmpty,
  loginPasswordNotEmpty,
} from "@/constants/messages";
import { Colors } from "@/constants/Colors";

// Login data schema
const loginSchema = z.object({
  email: z
    .string()
    .nonempty("Bitte eine E-Mail angeben.")
    .email("Bitte eine gültige E-Mail angeben."),
  password: z.string().nonempty("Bitte ein Passwort angeben."),
});

// Tpyes & Schema
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const themeStyles = coustomTheme();
  const colorScheme = useColorScheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setSession } = useAuthStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        // Store session in your auth store
        await setSession(session, stayLoggedIn);

        // Clear form
        reset();

        // Show success toast
        Toast.show({
          type: "success",
          text1: "Du wurdest erfolgreich angemeldet!",
          text1Style: { fontSize: 14, fontWeight: "600" },
          topOffset: 60,
        });

        // Navigate to home
        router.replace("/(tabs)/user");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [stayLoggedIn]);

  const onSubmit = async (formData: LoginFormValues) => {
    //Check for network connection
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert("Keine Internetverbindung", "Bitte überprüfe dein Internet.");
      return;
    }
    const { email, password } = getValues();
    await loginWithSupabase(email, password);
  };

  /**
   * The actual login function that calls Supabase,
   *
   */

  async function loginWithSupabase(email: string, password: string) {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // specific errors
        if (error.message.includes("Invalid login credentials")) {
          Alert.alert(
            "Login fehlgeschlagen",
            "E-Mail oder Passwort ist falsch."
          );
        } else if (error.message.includes("User not found")) {
          Alert.alert("Login fehlgeschlagen", "Benutzer existiert nicht.");
        } else if (error.message.includes("Email not confirmed")) {
          Alert.alert(
            "Login fehlgeschlagen",
            "E-Mail ist noch nicht bestätigt."
          );
        } else {
          Alert.alert("Login fehlgeschlagen", error.message);
        }
        return;
      }
      // Success handling moved to auth state listener
    } catch (error: any) {
      Alert.alert(error, error.message || "Es gab einen Fehler beim Login.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.contentContainer, themeStyles.contrast]}>
          <ThemedText style={styles.title} type="title">
          Benutzeranmeldung
          </ThemedText>

          {/* EMAIL FIELD */}
          <Controller
            control={control}
            rules={{ required: loginEmailNotEmpty }}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, themeStyles.text]}
                placeholder="E-Mail"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.email && (
            <Text style={styles.error}>{errors.email.message}</Text>
          )}

          {/* PASSWORD FIELD */}
          <Controller
            control={control}
            rules={{ required: loginPasswordNotEmpty }}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, themeStyles.text]}
                  placeholder="Passwort"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  value={value}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color={colorScheme === "dark" ? "#fff" : "#000"}
                  />
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          {/* STAY LOGGED IN SWITCH */}
          <View style={styles.stayAndPasswordContainer}>
            <View style={styles.forgotPasswordContainer}>
              <Pressable
                onPress={() => router.replace("/forgotPassword")}
                style={styles.forgotPasswordButton}
              >
                <ThemedText style={{ textDecorationLine: "underline" }}>
                  Passwort vergessen?
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.stayLoggedInContainer}>
              <Switch value={stayLoggedIn} onValueChange={setStayLoggedIn} />
              <ThemedText style={styles.stayLoggedInText}>
                Angemeldet bleiben
              </ThemedText>
            </View>
          </View>

          {/* LOGIN BUTTON */}
          <View style={{ flexDirection: "column", gap: 3, marginTop: 10 }}>
            <Pressable
              style={styles.buttonContainer}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Wird geladen..." : "Anmelden"}
              </Text>
            </Pressable>

            {/* SIGNUP */}
            <Pressable
              style={[styles.buttonContainer,{backgroundColor: "transparent", borderColor: "#057958"}]}
              onPress={() => router.replace("/signup")}
            >
              <ThemedText style={[styles.buttonText, { fontSize: 16, textDecorationLine: "underline"}]}>Jetzt kostenlos registrieren!</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    fontSize: 20,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  error: {
    color: Colors.universal.error,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    padding: 10,
  },
  stayAndPasswordContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  stayLoggedInContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordButton: {},
  stayLoggedInText: {
    marginLeft: 8,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    backgroundColor: "#057958",
    alignSelf: "center",
    justifyContent: "center",
    borderRadius: 7,
  },
  buttonText: {
    fontSize: 18,
    padding: 10,
    textAlign: "center",
    color: "#fff"
  },
});


