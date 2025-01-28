import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Pressable,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Types for form values
type SignUpFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Validation schema using Zod
const schema = z
  .object({
    username: z.string().nonempty({ message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Points the error at confirmPassword
  });

// Mock function to simulate user signup (replace with actual API call)
const signUpUser = async (
  username: string,
  email: string,
  password: string
): Promise<string | null> => {
  try {
    // Simulate API call
    console.log("Signing up user:", { username, email, password });
    return null; // Return null if no errors
  } catch (error) {
    return "Failed to sign up. Please try again."; // Return error message if any
  }
};

const SignUp: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { username, email, password } = data;
    const error = await signUpUser(username, email, password);

    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("Success", "Please check your email to verify your account.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text>Username</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your username"
            />
            {errors.username && (
              <Text style={styles.error}>{errors.username.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.error}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your password"
              secureTextEntry
            />
            {errors.password && (
              <Text style={styles.error}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputContainer}>
            <Text>Confirm Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              placeholder="Confirm your password"
              secureTextEntry
            />
            {errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword.message}</Text>
            )}
          </View>
        )}
      />
      <Pressable onPress={handleSubmit(onSubmit)}>
        <Text>Sign Up</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
  },
  error: {
    color: "red",
    marginTop: 4,
  },
});

export default SignUp;
