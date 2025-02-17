import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import handleOpenExternalUrl from "../utils/handleOpenExternalUrl";
import handleOpenInternallUrl from "../utils/handleOpenInternalUrl";

type RenderLinkNewsItemProps = {
  url: string;
  index: number;
  isExternal: boolean;
};

const RenderLinkNewsItem = ({
  url,
  index,
  isExternal,
}: RenderLinkNewsItemProps) => {
  const colorScheme = useColorScheme();
  
  return (
    <Pressable
      key={index}
      style={({ pressed }) => [
        styles.linkButton,
        pressed && styles.linkButtonPressed,
      ]}
      onPress={() =>
        isExternal ? handleOpenExternalUrl(url) : handleOpenInternallUrl(url)
      }
    >
      <Feather
        name={isExternal ? "external-link" : "link"}
        size={14}
        color={colorScheme === "dark" ? "#fff" : "#000"}
        style={{ paddingRight: 5 }}
      />
      <ThemedText style={styles.linkText} numberOfLines={1}>
        {url}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
  },
  linkButtonPressed: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 14,
    color: Colors.universal.link,
  },
});

export default RenderLinkNewsItem;
