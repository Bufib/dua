import { useState } from "react";
import { Alert, Linking } from "react-native";
import { useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { decode } from "base64-arraybuffer";
import { router } from "expo-router";
import { newsAddedSuccessToast } from "@/constants/messages";

export type NewsFormValues = {
  title: string;
  body_text: string;
  external_url?: string;
  internal_url?: string;
  is_pinned: boolean;
};

export function useAddNews() {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsFormValues>({
    defaultValues: {
      title: "",
      body_text: "",
      external_url: "",
      internal_url: "",
      is_pinned: false,
    },
  });

  // State for images and uploading
  const [selectedImages, setSelectedImages] = useState<
    { uri: string; base64: string | null }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  /**
   * Handle removing a selected image by URI
   */
  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  /**
   * Pick images from the device’s library
   */
  const pickImages = async () => {
    try {
      // Check media library permission
      const { status: mediaStatus, canAskAgain: canAskMediaAgain } =
        await ImagePicker.getMediaLibraryPermissionsAsync();

      if (mediaStatus !== "granted" && canAskMediaAgain) {
        const { status: newMediaStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newMediaStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need access to your media library to select images."
          );
          return;
        }
      } else if (mediaStatus !== "granted" && !canAskMediaAgain) {
        Alert.alert(
          "Permission Denied",
          "You have permanently denied media library access. Please enable permissions in your device settings.",
          [
            {
              text: "Go to Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      // Optional: Handle camera permission if needed
      const { status: cameraStatus, canAskAgain: canAskCameraAgain } =
        await ImagePicker.getCameraPermissionsAsync();

      if (cameraStatus !== "granted" && canAskCameraAgain) {
        const { status: newCameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (newCameraStatus !== "granted") {
          Alert.alert(
            "Permission Denied",
            "We need access to your camera to take photos."
          );
          return;
        }
      } else if (cameraStatus !== "granted" && !canAskCameraAgain) {
        Alert.alert(
          "Permission Denied",
          "You have permanently denied camera access. Please enable permissions in your device settings.",
          [
            {
              text: "Go to Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
        selectionLimit: 10,
      });

      if (!result.canceled && result.assets) {
        const images = result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64 ?? null, // Ensure base64 is null if undefined
        }));
        setSelectedImages((prev) => [...prev, ...images]);
      }
    } catch (error) {
      console.error("Image picking error:", error);
      Alert.alert("Error", "Could not pick images. Please try again.");
    }
  };

  /**
   * Upload images to Supabase Storage
   */
  const uploadImages = async (
    images: { uri: string; base64: string | null }[]
  ) => {
    const uploadedUrls: string[] = [];

    for (const { uri, base64 } of images) {
      if (!base64) continue;

      try {
        const fileType = uri.split(".").pop()?.toLowerCase(); // e.g., "png", "jpg"
        if (fileType && !["jpg", "jpeg", "png", "gif"].includes(fileType)) {
          console.error("Unsupported file type:", fileType);
          Alert.alert(
            "Error",
            `Invalid or unsupported file type (${fileType || "unknown"}).`
          );
          continue;
        }
        const fileName = `${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.${fileType}`;
        const contentType = `image/${fileType}`;
        const arrayBuffer = decode(base64);

        const { data, error } = await supabase.storage
          .from("news_bucket")
          .upload(`images/${fileName}`, arrayBuffer, {
            contentType,
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error("Image upload failed:", error.message);
          continue;
        }

        // Get the public URL
        const { data: publicData } = supabase.storage
          .from("news_bucket")
          .getPublicUrl(`images/${fileName}`);

        if (!publicData?.publicUrl) {
          console.error("Failed to retrieve public URL for uploaded image");
          continue;
        }

        uploadedUrls.push(publicData.publicUrl);
      } catch (err) {
        console.error("Error uploading file:", err);
        continue;
      }
    }

    if (uploadedUrls.length === 0) {
      return null;
    }
    return uploadedUrls;
  };

  /**
   * Final submission logic for the News form
   */
  const onSubmit = async (formData: NewsFormValues) => {
    // Prevent multiple submissions while an upload is in progress
    if (uploading) {
      return;
    }

    // Prevent empty submission
    if (
      !formData.title.trim() &&
      !formData.body_text.trim() &&
      !formData.external_url?.trim() &&
      !formData.internal_url?.trim() &&
      selectedImages.length === 0
    ) {
      Alert.alert(
        "Fehler",
        "Die Nachricht kann nicht leer sein! Bitte gib mindestens einen Title ein oder lade ein Bild hoch."
      );
      return;
    }

    setUploading(true);
    try {
      // Upload images if present
      let uploadedImageUrls: string[] | null = null;
      if (selectedImages.length > 0) {
        uploadedImageUrls = await uploadImages(selectedImages);

        if (!uploadedImageUrls) {
          Alert.alert("Error", "Image upload failed. Please try again.");
          setUploading(false);
          return;
        }
      }

      // Convert comma-separated strings into arrays
      const internalUrlsArray = formData.internal_url
        ? formData.internal_url.split(",").map((url) => url.trim())
        : [];
      const externalUrlsArray = formData.external_url
        ? formData.external_url.split(",").map((url) => url.trim())
        : [];

      const { error } = await supabase.from("news").insert([
        {
          title: formData.title,
          body_text: formData.body_text,
          image_url: uploadedImageUrls,
          external_url: externalUrlsArray,
          internal_url: internalUrlsArray,
          is_pinned: formData.is_pinned,
          pinned_at: formData.is_pinned ? new Date().toISOString() : null,
        },
      ]);

      if (error) throw error;

      reset();
      setSelectedImages([]);
      newsAddedSuccessToast();
      router.push("/(tabs)/news");
    } catch (error: any) {
      console.error("Error submitting news:", error.message);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    selectedImages,
    uploading,
    pickImages,
    removeImage,
    onSubmit,
  };
}
