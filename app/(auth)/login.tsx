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
import { NoInternet } from "@/components/NoInternet";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

// Login data schema
const loginSchema = z.object({
  email: z
    .string({ required_error: "Bitte E-Mail eingeben." })
    .nonempty("Bitte E-Mail eingeben.")
    .email("Bitte eine gültige E-Mail eingeben."),
  password: z
    .string({ required_error: "Bitte Password eingeben." })
    .nonempty("Bitte Passwort eingeben."),
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
  const hasInternet = useConnectionStatus();
  const clearSession = useAuthStore.getState().clearSession;
  const setSession = useAuthStore.getState().setSession;
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); // ✅ Triggers re-render only when isLoggedIn changes

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setIsLoading(true);
        setTimeout(async () => {
          try {
            await setSession(session, stayLoggedIn);
            reset();
            Toast.show({
              type: "success",
              text1: "Du wurdest erfolgreich angemeldet!",
              text1Style: { fontSize: 14, fontWeight: "600" },
              topOffset: 60,
            });
            router.replace("/(askQuestion)/");
          } catch (error) {
            console.error("Error in auth state change:", error);
            Alert.alert("Fehler", "Anmeldung fehlgeschlagen");
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else if (event === "SIGNED_OUT") {
        clearSession();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (formData: LoginFormValues) => {
    //Check for network connection
    if (!hasInternet) {
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
      if (isLoggedIn) {
        return;
      }

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
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        Alert.alert("Login fehlgeschlagen", error.message);
      } else {
        Alert.alert("Login fehlgeschlagen", "Es gab einen Fehler beim Login.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formWrapper}>
          <NoInternet showUI={true} showToast={false} />
          <View style={[styles.contentContainer, themeStyles.contrast]}>
            <ThemedText style={styles.title} type="title">
              Benutzeranmeldung
            </ThemedText>
            <View style={styles.inputWrapper}>
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
                    autoCorrect={false}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              <View style={styles.errorContainer}>
                {errors.email && (
                  <Text style={styles.error}>{errors.email.message}</Text>
                )}
              </View>
            </View>
            {/* PASSWORD FIELD */}
            <View style={styles.inputWrapper}>
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
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="off"
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
              <View style={styles.errorContainer}>
                {errors.password && (
                  <Text style={styles.error}>{errors.password.message}</Text>
                )}
              </View>
            </View>

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
                style={[
                  styles.buttonContainer,
                  (isLoading || !hasInternet) && styles.disabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading || !hasInternet}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {isLoading ? "Wird geladen..." : "Anmelden"}
                </Text>
              </Pressable>

              {/* SIGNUP */}
              <Pressable
                style={[
                  styles.buttonContainer,
                  { backgroundColor: "transparent", borderColor: "#057958" },
                ]}
                onPress={() => router.replace("/signup")}
              >
                <ThemedText
                  style={[
                    styles.buttonText,
                    { fontSize: 16, textDecorationLine: "underline" },
                  ]}
                >
                  Jetzt kostenlos registrieren!
                </ThemedText>
              </Pressable>
            </View>
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
    paddingVertical: 20,
  },
  formWrapper: {
    flex: 1,
    justifyContent: "center",
    minHeight: Platform.OS === "ios" ? 500 : 450, // Adjust these values based on your content
  },
  inputWrapper: {
    marginBottom: 8,
  },
  errorContainer: {},
  contentContainer: {
    borderWidth: 1,
    padding: 20,
    borderRadius: 12,
    minHeight: 400,
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
    marginBottom: 12,
  },
  stayLoggedInContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  forgotPasswordContainer: {
    marginBottom: 10,
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
  },
  disabled: {
    opacity: 0.5,
  },
});
