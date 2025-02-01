import { ScrollView } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import React from "react";
import { StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";
import { Colors } from "@/constants/Colors";
import { coustomTheme } from "@/utils/coustomTheme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function impressum() {
  const impressum = `
 # **Impressum** 

 **Angaben gemäß § 5 TMG:**
 Bund für islamische Bildung e. V.
 Füssener Str. 15
 12309 Berlin
 
 # **Vertreten durch:**

 Samer Khalil (1. Vorsitzender)
 Anne-Maria Nowak (2. Vorsitzende)
 Mohammad Klait (Schriftführer)

 # **Kontakt:**
 E-Mail: info@bufib.de
 
 # **Registereintrag:**

 Eintragung im Vereinsregister.
 Registergericht: Amtsgericht Berlin-Charlottenburg
 Registernummer: VR 32921

 # **Steuernummer:** 

 27/657/53847

# **Verantwortlich für den Inhalt**
# **nach § 55 Abs. 2 RStV:**

 Bund für islamische Bildung e.V.  `;

  const quelle = `Quelle: `;
  const link = `[http://www.e-recht24.de](http://www.e-recht24.de)`;

  const themeStyles = coustomTheme();

  return (
    <ThemedView style={[styles.container, themeStyles.defaultBackgorundColor]}>
      <ScrollView style={styles.textContainer}>
        <Markdown
          style={{
            body: {
              ...themeStyles.text,
              textAlign: "justify",
              fontSize: 16,
              lineHeight: 40,
            },
            heading1: {
              fontSize: 27,
              lineHeight: 40,
            },
          }}
        >
          {impressum}
        </Markdown>
        <ThemedView style={{ flexDirection: "row", gap: 5 }}>
          <Markdown
            style={{
              body: {
                ...themeStyles.text,
                textAlign: "justify",
                fontSize: 16,
                lineHeight: 40,
              },
              heading1: {
                fontSize: 27,
                lineHeight: 40,
              },
            }}
          >
            {quelle}
          </Markdown>
          <Markdown
            style={{
              body: {
                ...themeStyles.text,
                textAlign: "justify",
                fontSize: 18,
                lineHeight: 40,
                color: "#93C024",
              },
              heading1: {
                fontSize: 27,
                lineHeight: 40,
              },
            }}
          >
            {link}
          </Markdown>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textContainer: {
    flex: 1,
    marginTop: 15,
    marginBottom: 25,
    backgroundColor: "transparent",
    paddingHorizontal: 10,
  },
  darkScrollView: {
    backgroundColor: Colors.dark.background,
  },
  lightScrollVire: {
    backgroundColor: Colors.light.background,
  },
  darkText: {
    color: Colors.dark.text,
  },
  lightText: {
    color: Colors.light.text,
  },
});
