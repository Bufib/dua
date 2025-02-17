import React, { useEffect } from "react";
import { Pressable, StyleSheet, Alert } from "react-native";
import Modal from "react-native-modal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState } from "react";
import { Storage } from "expo-sqlite/kv-store";
import { useInitializeDatabase } from "@/hooks/useInitializeDatabase.ts";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import Toast from "react-native-toast-message";
type DonationAlertProps = {
  isVisible: boolean;
  onClose: () => void;
};

const DonationAlert: React.FC<DonationAlertProps> = ({
  isVisible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const dbInitialized = useInitializeDatabase();
  const [payPalLink, setPayPalLink] = useState<string | null>(null);

  // paypal
  useEffect(() => {
    if (!dbInitialized) return;

    // Get the paypalLink
    try {
      const paypal = Storage.getItemSync("paypal");
      setPayPalLink(paypal);
    } catch (error: any) {
      Alert.alert("Fehler", error.message);
    }
  }, [dbInitialized]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose} // Close when tapping outside
      onSwipeComplete={onClose} // Swipe down to close
      swipeDirection="down"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      style={styles.modal}
    >
      <ThemedView
        style={[
          styles.container,
          colorScheme === "dark" ? styles.darkMode : styles.lightMode,
        ]}
      >
        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <AntDesign
            name="closecircle"
            size={22}
            color={colorScheme === "dark" ? "#fff" : "#333"}
          />
        </Pressable>

        {/* Header */}
        <ThemedText style={styles.headerText}>
          Unterstütze uns {"\u2764\uFE0F"}
        </ThemedText>

        {/* Message */}
        <ThemedText style={styles.messageText}>
          Mit deiner Unterstützung können wir fortfahren und weiterhin für dich
          da sein. {"\n"}
          Vielen Dank!
        </ThemedText>

        {/* PayPal Donate Button */}
        <Pressable
          style={styles.donateButton}
          onPress={() => payPalLink && handleOpenExternalUrl(payPalLink)}
        >
          <ThemedText style={styles.donateButtonText}>
            Jetzt mit PayPal spenden
          </ThemedText>
        </Pressable>
      </ThemedView>
      <Toast />
    </Modal>
  );
};

export default DonationAlert;

const styles = StyleSheet.create({
  modal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0, // Fullscreen overlay
  },
  container: {
    width: "85%",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  darkMode: {
    backgroundColor: "#2c3e50",
  },
  lightMode: {
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: "#0070BA", // PayPal Blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
