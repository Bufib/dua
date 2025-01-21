import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import NetInfo from "@react-native-community/netinfo";
import ConfirmHcaptcha from "@hcaptcha/react-native-hcaptcha";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/utils/supabase";
import { useAuthStore } from "@/stores/authStore";
import { coustomTheme } from "@/utils/coustomTheme";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { askQuestionQuestionSendSuccess } from "@/constants/messages";

// ---- 1. Zod Schema: For robust form validation
const QuestionSchema = z.object({
  title: z.string().min(1, "Bitte gebe einen Titel ein!"),
  marja: z
    .object({
      sistani: z.boolean(),
      khamenei: z.boolean(),
      keineRechtsfrage: z.boolean(),
    })
    // at least one must be true
    .refine(
      (val) => val.sistani || val.khamenei || val.keineRechtsfrage,
      "Bitte wähle einen Marja aus!"
    ),
  question: z.string().min(1, "Bitte gebe deine Frage ein!"),
  user_age: z
    .number({ invalid_type_error: "Bitte gebe dein Alter ein!" })
    .min(1, "Bitte gebe dein Alter ein!"),
  user_gender: z.string().min(1, "Bitte gebe dein Geschlecht an!"),
  user_email: z
    .string()
    .email("Ungültige Emailadresse")
    .min(1, "Bitte gebe deinen Email an!"),
  user_username: z.string().optional(),
});

// The TypeScript definition derived from Zod:
type QuestionFormData = z.infer<typeof QuestionSchema>;

/** Typed hCaptcha event */
type CaptchaEvent = {
  nativeEvent: {
    data: string;
  };
};

/** Reusable checkbox */
const CustomCheckbox = ({
  label,
  value,
  onValueChange,
  error,
}: {
  label: string;
  value: boolean;
  onValueChange: (newVal: boolean) => void;
  error?: string;
}) => (
  <Pressable
    style={[styles.checkboxContainer]}
    onPress={() => onValueChange(!value)}
  >
    <View style={[styles.checkbox, value && styles.checkboxChecked]}>
      {value && <ThemedText style={styles.checkmark}>✓</ThemedText>}
    </View>
    <ThemedText style={styles.checkboxLabel}>{label}</ThemedText>
  </Pressable>
);

/** Reusable text input w/ label, error, etc. */
const CustomInput = ({
  label,
  error,
  multiline,
  numberOfLines,
  style,
  ...props
}: {
  label: string;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  style?: any;
  [key: string]: any; // allow additional props like onChangeText, value
}) => (
  <View style={styles.inputContainer}>
    <ThemedText style={styles.label}>{label}</ThemedText>
    <TextInput
      style={[
        styles.input,
        multiline && styles.textArea,
        error && styles.inputError,
        style,
      ]}
      placeholderTextColor="#666"
      numberOfLines={numberOfLines}
      multiline={multiline}
      {...props}
    />
    {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
  </View>
);

export default function AskQuestionScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Access user info
  const session = useAuthStore((state) => state.session);
  const user_username = useAuthStore((state) => state.user_username);

  // Theming
  const themeStyles = coustomTheme();

  // Captcha Ref
  const captchaRef = useRef<ConfirmHcaptcha | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: "",
      marja: {
        sistani: false,
        khamenei: false,
        keineRechtsfrage: false,
      },
      question: "",
      user_age: undefined,
      user_gender: "",
      user_email: "",
      user_username: "",
    },
  });

  // If user already has a username stored in the store,
  // you can auto-fill it so they don't have to retype:
  useEffect(() => {
    if (user_username) {
      setValue("user_username", user_username);
    }
  }, [user_username, setValue]);

  // Show captcha when state toggles
  useEffect(() => {
    if (showCaptcha && captchaRef.current) {
      captchaRef.current.show();
    }
  }, [showCaptcha]);

  /** The actual DB insert logic after captcha success */
  async function submitQuestion(data: QuestionFormData, captchaToken: string) {
    if (!session?.user.id) {
      setError("You must be logged in to submit a question.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Extract the selected Marja
      let selectedMarja = "Keine Rechtsfrage"; // default
      if (data.marja.sistani) {
        selectedMarja = "Sistani";
      } else if (data.marja.khamenei) {
        selectedMarja = "Khamenei";
      }

      // Insert into DB
      const { error: submissionError } = await supabase
        .from("user_question")
        .insert([
          {
            user_id: session.user.id,
            user_username: data.user_username ?? user_username,
            title: data.title,
            marja: selectedMarja,
            question: data.question,
            user_age: data.user_age,
            user_gender: data.user_gender,
            user_email: data.user_email,
            status: "Beantwortung steht noch aus",
          },
        ]);

      if (submissionError) throw submissionError;
      reset();

      askQuestionQuestionSendSuccess();
      router.replace("/(tabs)/home"); 
    } catch (err: any) {
      setError(err.message);
      console.log(err);
    } finally {
      setLoading(false);
      setShowCaptcha(false);
    }
  }

  /** Called once user taps "Frage stellen" */
  const handleAskQuestion = async (formData: QuestionFormData) => {
    // Check if online
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      Alert.alert("Keine Internetverbindung", "Bitte überprüfe dein Internet.");
      return;
    }

    // If connected, open captcha
    setShowCaptcha(true);
  };

  /** Handle captcha message & token */
  const onCaptchaMessage = async (event: CaptchaEvent) => {
    if (!showCaptcha) return;

    const token = event.nativeEvent.data;
    switch (token) {
      case "error":
      case "expired":
        setShowCaptcha(false);
        Alert.alert(
          "Fehler",
          "Captcha-Überprüfung fehlgeschlagen. Bitte versuche es erneut."
        );
        return;

      case "cancel":
        setShowCaptcha(false);
        Alert.alert(
          "Fehler",
          "Bitte nicht wegklicken, da die Überprüfung sonst abgebrochen wird!"
        );
        return;

      case "open":
        // Just opened, do nothing
        return;

      default:
        // Valid token from hCaptcha, run the insert logic
        handleSubmit((validData) => submitQuestion(validData, token))();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.title} type="title">
          Neue Frage
        </ThemedText>

        {error && (
          <ThemedView style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        <View style={[styles.formContainer, themeStyles.contrast]}>
          {/* TITLE */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Titel *"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
                placeholder="Titel deiner Frage"
                style={themeStyles.text}
                autoCapitalize="none"
              />
            )}
          />

          {/* MARJA */}
          <View style={styles.marjaContainer}>
            <ThemedText style={styles.label}>Marja *</ThemedText>
            <Controller
              control={control}
              name="marja"
              render={({ field: { onChange, value } }) => (
                <View>
                  <CustomCheckbox
                    label="Sayid as-Sistani"
                    value={value.sistani}
                    onValueChange={() =>
                      onChange({
                        sistani: true,
                        khamenei: false,
                        keineRechtsfrage: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label="Sayid al-Khamenei"
                    value={value.khamenei}
                    onValueChange={() =>
                      onChange({
                        sistani: false,
                        khamenei: true,
                        keineRechtsfrage: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label="Keine Rechtsfrage"
                    value={value.keineRechtsfrage}
                    onValueChange={() =>
                      onChange({
                        sistani: false,
                        khamenei: false,
                        keineRechtsfrage: true,
                      })
                    }
                  />
                  {errors.marja?.message && (
                    <ThemedText style={styles.errorText}>
                      {errors.marja.message}
                    </ThemedText>
                  )}
                </View>
              )}
            />
          </View>

          {/* QUESTION */}
          <Controller
            control={control}
            name="question"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Frage *"
                value={value}
                onChangeText={onChange}
                error={errors.question?.message}
                multiline
                numberOfLines={4}
                placeholder="Wie lautet deine Frage?"
                style={themeStyles.text}
                autoCapitalize="none"
              />
            )}
          />

          {/* AGE */}
          <Controller
            control={control}
            name="user_age"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Alter *"
                value={value?.toString()}
                onChangeText={(txt: string) => onChange(Number(txt) || 0)}
                keyboardType="numeric"
                error={errors.user_age?.message}
                placeholder="Dein Alter"
                style={themeStyles.text}
              />
            )}
          />

          {/* GENDER */}
          <Controller
            control={control}
            name="user_gender"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Geschlecht *"
                value={value}
                onChangeText={onChange}
                error={errors.user_gender?.message}
                placeholder="Dein Geschlecht"
                style={themeStyles.text}
                autoCapitalize="none"
              />
            )}
          />

          {/* EMAIL */}
          <Controller
            control={control}
            name="user_email"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Email *"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.user_email?.message}
                placeholder="Deine Emailadresse"
                style={themeStyles.text}
              />
            )}
          />
        </View>

        {/* SUBMIT BUTTON */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(handleAskQuestion)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="black" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Frage stellen
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>

      {/* HCAPTCHA INVISIBLE WIDGET */}
      {showCaptcha && (
        <ConfirmHcaptcha
          ref={captchaRef}
          siteKey="2bf09a6a-7b84-4dd0-853e-9ef0805401a8"
          onMessage={onCaptchaMessage}
          languageCode="de"
          size="invisible"
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    marginTop: 10,
    marginBottom: 10,
  },
  errorContainer: {
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.universal.error,
    fontSize: 14,
  },
  formContainer: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#888",
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.universal.error,
  },
  marjaContainer: {
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.universal.link,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.universal.link,
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: Colors.universal.link,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.universal.white,
  },
});
