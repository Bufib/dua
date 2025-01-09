import { PropsWithChildren, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Image } from "expo-image";
import { coustomTheme } from "../utils/coustomTheme";
import { useFontSizeStore } from "@/stores/fontSizeStore";

export function Collapsible({
  children,
  title,
  marja,
}: PropsWithChildren & { title: string; marja?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? "light";
  const themeStyles = coustomTheme();
  const { fontSize } = useFontSizeStore();
  const colorScheme = useColorScheme();

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}
        />
        {marja && (
          <Image
            source={
              marja === "khamenei"
                ? require("@/assets/images/khamenei.png")
                : require("@/assets/images/sistani.png")
            }
            contentFit="contain"
            style={styles.image}
          />
        )}

        <ThemedText type="defaultSemiBold" style={{ fontSize }}>
          {title}
        </ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <ThemedView style={[styles.content, themeStyles.contrast]}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  content: {
    marginTop: 5,
    marginHorizontal: 5,
    padding: 12,
    borderTopWidth: 2,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
  },
});
