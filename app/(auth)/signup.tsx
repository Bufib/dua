import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import NetInfo from "@react-native-community/netinfo";
import Feather from "@expo/vector-icons/Feather";
import ConfirmHcaptcha from "@hcaptcha/react-native-hcaptcha";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { coustomTheme } from "@/utils/coustomTheme";
import { Colors } from "@/constants/Colors";

import {
  signUpErrorGeneral,
  signUpSuccess,
  signUpUserNameAlreadyInUsage,
  signUpUserEmailAlreadyInUsage,
  signUpUserNameMin,
  signUpUserPasswordFormat,
  signUpUserPasswordMin,
  noInternetHeader,
  noInternetBody,
  signUpEmailNotEmpty,
  signUpPasswordNotEmpty,
  signUpUsernameNotEmpty,
  signUpUserPasswordConformation,
} from "@/constants/messages";

// ---- START: TYPE + SCHEMA DEFINITIONS ----

type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type CaptchaEvent = {
  nativeEvent: {
    data: string;
  };
};

// Define validation schema with Zod
const schema = z
  .object({
    username: z
      .string({ required_error: signUpUsernameNotEmpty })
      .min(3, signUpUserNameMin),
    email: z
      .string({ required_error: signUpEmailNotEmpty })
      .email(signUpEmailNotEmpty),
    password: z
      .string({ required_error: signUpPasswordNotEmpty })
      .min(8, signUpUserPasswordMin)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^+=\-]).{8,}$/,
        signUpUserPasswordFormat
      ),
    confirmPassword: z
      .string({ required_error: signUpPasswordNotEmpty })
      .min(8, signUpUserPasswordMin),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: signUpUserPasswordConformation,
    path: ["confirmPassword"], // Show error on confirmPassword
  });

// ---- END: TYPE + SCHEMA DEFINITIONS ----

// Max verification attempts for entering the code
const MAX_VERIFICATION_ATTEMPTS = 3;

// Max resend attempts to get a new code
const MAX_RESEND_ATTEMPTS = 3;

export default function SignUpScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
  });

  // Theming
  const themeStyles = coustomTheme();
  const colorScheme = useColorScheme();

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // hCaptcha
  const [showCaptcha, setShowCaptcha] = useState(false);
  const captchaRef = useRef<ConfirmHcaptcha | null>(null);

  // Email verification
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");

  // Track verification attempts
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  // Track resend attempts
  const [resendAttempts, setResendAttempts] = useState(0);

  // Show the captcha when state changes
  useEffect(() => {
    if (showCaptcha && captchaRef.current) {
      captchaRef.current.show();
    }
  }, [showCaptcha]);

  /**
   * Reset attempts (verification & resend) whenever the modal closes.
   */
  useEffect(() => {
    if (!showVerificationModal) {
      setVerificationAttempts(0);
      setResendAttempts(0);
    }
  }, [showVerificationModal]);

  /**
   * Check if username OR email already exists in the "user" table
   * in a case-insensitive manner.
   */
  const checkUserExists = async (username: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from("user")
        .select("user_username, user_email")
        .or("user_username.eq." + username + ",user_email.eq." + email);

      if (error) {
        Alert.alert(signUpErrorGeneral, error.message);
        return { usernameExists: false, emailExists: false };
      }

      // Case-insensitive comparison
      const usernameExists = data.some(
        (user) =>
          user.user_username.toLowerCase() === username.toLowerCase()
      );
      const emailExists = data.some(
        (user) => user.user_email.toLowerCase() === email.toLowerCase()
      );

      return { usernameExists, emailExists };
    } catch (error: any) {
      Alert.alert(signUpErrorGeneral, error.message);
      return { usernameExists: false, emailExists: false };
    }
  };

  /**
   * Sign up with Supabase:
   * - check if username or email is used
   * - if not, do supabase.auth.signUp
   * - if signUp is successful, open the modal to confirm code
   */
  const signUpWithSupabase = async (
    username: string,
    email: string,
    password: string,
    captchaToken: string
  ) => {
    try {
      setIsLoading(true);

      // Check if username or email is taken
      const { usernameExists, emailExists } = await checkUserExists(
        username,
        email
      );

      if (usernameExists) {
        Alert.alert(signUpErrorGeneral, signUpUserNameAlreadyInUsage);
        return;
      }
      if (emailExists) {
        Alert.alert(signUpErrorGeneral, signUpUserEmailAlreadyInUsage);
        return;
      }

      // Proceed with signup
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            captchaToken,
          },
        });

      if (signUpError) {
        console.log(signUpError);
        Alert.alert(signUpErrorGeneral, signUpError.message);
        return;
      }

      // If user object is returned, show the modal for verification code entry
      if (signUpData.user) {
        setCurrentEmail(email);
        setCurrentUsername(username);
        setShowVerificationModal(true);

        Alert.alert(
          "Verification Required",
          "Please check your email for a verification code."
        );
      }
    } catch (error: any) {
      console.log(error);
      Alert.alert(signUpErrorGeneral, error.message);
    } finally {
      setIsLoading(false);
      setShowCaptcha(false); // hide captcha overlay
    }
  };

  /**
   * Handle final verification of the code the user enters
   * into the verification modal, with a timeout for user experience
   * and an attempts limit.
   */
  const handleVerification = async () => {
    // Check if max attempts reached
    if (verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      Alert.alert(
        "Too Many Attempts",
        "You've exceeded the maximum number of verification attempts. Please request a new code.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setShowVerificationModal(false),
          },
          {
            text: "Resend Code",
            onPress: resendVerificationCode,
          },
        ]
      );
      return;
    }

    // Increment attempts
    setVerificationAttempts((prev) => prev + 1);

    const TIMEOUT = 30000; // 30 seconds
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Verification timeout")), TIMEOUT)
    );

    try {
      setIsLoading(true);
      await Promise.race([
        timeoutPromise,
        (async () => {
          const { data, error } = await supabase.auth.verifyOtp({
            email: currentEmail,
            token: verificationCode,
            type: "signup",
          });
          if (error) throw new Error(error.message);

          // If verification is successful -> create user record in "user" table
          if (data.user) {
            const { error: userError } = await supabase
              .from("user")
              .insert([
                {
                  user_id: data.user.id,
                  user_username: currentUsername,
                  user_email: currentEmail,
                },
              ]);

            if (userError) {
              throw new Error(userError.message);
            }

            // user creation success
            setShowVerificationModal(false);
            signUpSuccess();
            router.push("/(tabs)/home");
          }
        })(),
      ]);
    } catch (error: any) {
      if (error.message === "Verification timeout") {
        Alert.alert("Error", "Verification timed out. Please try again.");
      } else {
        Alert.alert(signUpErrorGeneral, error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Function to resend the verification code if user didn't receive it.
   * With a max resend limit.
   */
  const resendVerificationCode = async () => {
    // Check if we have already hit the max
    if (resendAttempts >= MAX_RESEND_ATTEMPTS) {
      Alert.alert(
        "Error",
        "You have reached the maximum number of resend attempts. Please wait or contact support."
      );
      return;
    }
    // Increment resend attempts
    setResendAttempts((prev) => prev + 1);

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: currentEmail,
      });
      if (error) throw error;

      Alert.alert("Success", "A new verification code has been sent.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * The `onMessage` callback for hCaptcha:
   * Checks the returned token and if valid calls `signUpWithSupabase`.
   */
  const onCaptchaMessage = async (event: CaptchaEvent) => {
    const token = event.nativeEvent.data;
    if (!token) return;

    if (["error", "expired"].includes(token)) {
      // Avoid random "expired" events that can occur when Captcha isn't actually open
      if (!showCaptcha) {
        console.log("Captcha expired or error but it was not active.");
        return;
      }
      setShowCaptcha(false);
      Alert.alert(
        "Fehler",
        "Captcha-Überprüfung fehlgeschlagen. Bitte versuche es erneut."
      );
    } else if (token === "cancel") {
      setShowCaptcha(false);
      Alert.alert(
        "Fehler",
        "Bitte nicht wegklicken, da die Überprüfung sonst abgebrochen wird!"
      );
    } else if (token === "open") {
      // hCaptcha is opening; do nothing
      return;
    } else {
      // If we get a real token, re-run handleSubmit to get the current form data
      handleSubmit(async (formData) => {
        await signUpWithSupabase(
          formData.username,
          formData.email,
          formData.password,
          token
        );
      })();
    }
  };

  /**
   * Form onSubmit handler:
   * 1. Check net info
   * 2. Show captcha if connected
   */
  const onSubmit = async (formData: SignUpFormValues) => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert(noInternetHeader, noInternetBody);
      return;
    }
    // If connected, show captcha
    setShowCaptcha(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={[styles.contentContainer, themeStyles.contrast]}>
          <ThemedText style={styles.title} type="title">
            Registrieren
          </ThemedText>

          {/* Username Field */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, themeStyles.text]}
                placeholder="Benutzername"
                onChangeText={onChange}
                value={value}
                autoCapitalize="none"
              />
            )}
          />
          {errors.username && (
            <Text style={styles.error}>{errors.username.message}</Text>
          )}

          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, themeStyles.text]}
                placeholder="Email"
                onChangeText={onChange}
                value={value}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {errors.email && (
            <Text style={styles.error}>{errors.email.message}</Text>
          )}

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, themeStyles.text]}
                  placeholder="Password"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <Feather
                      name="eye"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  ) : (
                    <Feather
                      name="eye-off"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  )}
                </Pressable>
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.error}>{errors.password.message}</Text>
          )}

          {/* Confirm Password Field */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.passwordInput, themeStyles.text]}
                  placeholder="Passwort bestätigen"
                  onChangeText={onChange}
                  value={value}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeIcon}
                >
                  {showConfirmPassword ? (
                    <Feather
                      name="eye"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  ) : (
                    <Feather
                      name="eye-off"
                      size={24}
                      color={colorScheme === "dark" ? "white" : "black"}
                    />
                  )}
                </Pressable>
              </View>
            )}
          />
          {errors.confirmPassword && (
            <Text style={styles.error}>{errors.confirmPassword.message}</Text>
          )}

          {/* Sign-Up Button */}
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Button
              title="Registrieren"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            />
          )}

          {/* Link to Login */}
          <View style={styles.logInContainer}>
            <ThemedText style={styles.logInText}>
              Hast du bereits einen Account?
            </ThemedText>
            <Button title="Login" onPress={() => router.replace("/login")} />
          </View>
        </View>
      </ScrollView>

      {showCaptcha && (
        <ConfirmHcaptcha
          ref={captchaRef}
          siteKey="c2a47a96-0c8e-48b8-a6c6-e60a2e9e4228"
          baseUrl="https://hcaptcha.com"
          onMessage={onCaptchaMessage}
          languageCode="de"
          size="invisible"
        />
      )}

      <Modal
        visible={showVerificationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, themeStyles.contrast]}>
            <ThemedText style={styles.modalTitle}>
              Email Verification
            </ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              Please enter the verification code sent to {currentEmail}
            </ThemedText>
            <TextInput
              style={[styles.input, themeStyles.text]}
              placeholder="Enter verification code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              autoCapitalize="none"
            />
            {isLoading ? (
              <ActivityIndicator style={styles.modalButton} />
            ) : (
              <View style={styles.modalButtonsContainer}>
                <Button
                  title="Cancel"
                  onPress={() => setShowVerificationModal(false)}
                />
                <View style={styles.buttonSpacer} />
                <Button title="Verify" onPress={handleVerification} />
                <View style={styles.buttonSpacer} />
                <Button title="Resend Code" onPress={resendVerificationCode} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  contentContainer: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 50,
    borderRadius: 20,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
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
  logInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  logInText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    flexWrap: "wrap",
  },
  buttonSpacer: {
    width: 16,
  },
  modalButton: {
    marginTop: 16,
  },
});
