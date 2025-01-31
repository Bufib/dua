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
  age: z
    .number({ invalid_type_error: "Bitte gebe dein Alter ein!" })
    .min(1, "Bitte gebe dein Alter ein!"),
  gender: z
    .object({
      männlich: z.boolean(),
      weiblich: z.boolean(),
    })
    // at least one must be true
    .refine(
      (val) => val.männlich || val.weiblich,
      "Bitte wähle dein Geschlecht aus!"
    ),
  username: z.string().optional(),
});

// The TypeScript definition derived from Zod:
type QuestionFormData = z.infer<typeof QuestionSchema>;

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
    style={[styles.marjaContainer]}
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

  // Access user info
  const session = useAuthStore((state) => state.session);
  const username = useAuthStore((state) => state.username);

  // Theming
  const themeStyles = coustomTheme();

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
      age: undefined,
      gender: {
        männlich: false,
        weiblich: false,
      },
    },
  });

  /** The actual DB insert logic  */
  async function submitQuestion(data: QuestionFormData) {
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
        selectedMarja = "Sayid as-Sistani";
      } else if (data.marja.khamenei) {
        selectedMarja = "Sayid al-Khamenei";
      }

      // Extract the selected gender
      let selectedGender = ""; // default
      if (data.gender.männlich) {
        selectedGender = "Männlich";
      } else if (data.gender.weiblich) {
        selectedGender = "Weiblich";
      }

      // Insert into DB
      const { error: submissionError } = await supabase
        .from("user_question")
        .insert([
          {
            user_id: session.user.id,
            username: data.username ?? username,
            title: data.title,
            marja: selectedMarja,
            question: data.question,
            age: data.age,
            gender: selectedGender,
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

    // If connected, upload
    handleSubmit((validData) => submitQuestion(validData))();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, themeStyles.defaultBackgorundColor]}
    >
      <ScrollView
        style={styles.scrollViewStyle}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={styles.checkBoxContainer}>
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
            name="age"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                label="Alter *"
                value={value?.toString()}
                onChangeText={(txt: string) => onChange(Number(txt) || 0)}
                keyboardType="numeric"
                error={errors.age?.message}
                placeholder="Dein Alter"
                style={themeStyles.text}
              />
            )}
          />

          {/* GENDER */}
          <View>
            <ThemedText style={styles.label}>Geschlecht *</ThemedText>
            <Controller
              control={control}
              name="gender"
              render={({
                field: {
                  onChange,
                  value = { männlich: false, weiblich: false },
                },
              }) => (
                <View>
                  <CustomCheckbox
                    label="Männlich"
                    value={value.männlich}
                    onValueChange={() =>
                      onChange({
                        männlich: true,
                        weiblich: false,
                      })
                    }
                  />
                  <CustomCheckbox
                    label="Weiblich"
                    value={value.weiblich}
                    onValueChange={() =>
                      onChange({
                        männlich: false,
                        weiblich: true,
                      })
                    }
                  />
                  {errors.gender?.message && (
                    <ThemedText style={styles.errorText}>
                      {errors.gender.message}
                    </ThemedText>
                  )}
                </View>
              )}
            />
          </View>
        </View>
        {/* SUBMIT BUTTON */}
        <Pressable
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit(handleAskQuestion)}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              Frage absenden
            </ThemedText>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollViewStyle: {
    flex: 1,
    paddingTop: 20    
  },
  scrollViewContent: {
   
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
  checkBoxContainer: {
    marginBottom: 16,
  },
  marjaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#057958",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#057958",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#057958",
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
    color: "#fff",
  },
});
