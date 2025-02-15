import { StyleSheet } from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { noInternetBody, noInternetHeader } from "@/constants/messages";
import { Colors } from "@/constants/Colors";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { useEffect } from "react";
import Toast from "react-native-toast-message";
import { useRef } from "react";
interface NoInternetProps {
  showUI?: boolean;
  showToast?: boolean;
}

export const NoInternet = ({
  showUI = false,
  showToast = false,
}: NoInternetProps) => {
  const hasInternet = useConnectionStatus();
  const prevConnected = useRef(true);

  useEffect(() => {
    if (showToast && prevConnected.current !== hasInternet) {
      Toast.show({
        type: hasInternet ? "success" : "error",
        text1: hasInternet
          ? "Verbindung wiederhergestellt"
          : "Keine Internetverbindung!",
        text2: hasInternet ? "" : "Du erhälst keine updates in dieser Zeit",
      });
      prevConnected.current = hasInternet;
    }
  }, [hasInternet, showToast]);

  if (!showUI || hasInternet) return null;

  return (
    <ThemedView style={styles.noInternet}>
      <ThemedText style={styles.noInternetText}>
        {noInternetHeader}
        {"\n"}
        {noInternetBody}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  noInternet: {
    padding: 15,
  },
  noInternetText: {
    textAlign: "center",
    color: Colors.universal.error,
    fontSize: 16,
    fontWeight: "700",
  },
});
