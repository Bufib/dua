import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { useFontSizeStore } from "@/stores/fontSizeStore";

interface PrayerSegment {
  arabic: string;
  transliteration: string;
  translation: string;
}

const RenderPrayer = () => {
  const [loading, setLoading] = useState(true);
  const [prayerData, setPrayerData] = useState<{
    title: string;
    arabicTitle: string;
    introduction: string;
    segments: PrayerSegment[];
  }>({
    title: "",
    arabicTitle: "",
    introduction: "",
    segments: [],
  });

  const colorScheme = useColorScheme();
  const { fontSize, lineHeight } = useFontSizeStore();

  // Parse the Ziyarat Ashura text
  useEffect(() => {
    const parseZiyaratText = () => {
      try {
        setLoading(true);

        const ziyaratTitle = "Ziyarat Ashura";
        const ziyaratArabicTitle = "زيارة عاشوراء";
        const introduction =
          "This Ziarat is recited for Imam Hussain(as)(ajtfs) on the day of Ashura & everyday. Highly Recommended for solutions to all major problems, if recited continiously for 40 days";

        // Hardcoded prayer text - in real app, this would come from your database
        const prayerText = `اَلسَّلاَمُ عَلَيْكَ يَا أَبَا عَبْدِ ٱللَّهِ
alssalamu \`alayka ya aba \`abdillahi
Peace be upon you, O Abu-\`Abdullah.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ رَسُولِ ٱللَّهِ
alssalamu \`alayka yabna rasuli allahi
Peace be upon you, O son of Allah's Messenger.

السَّلاَمُ عَلَيكَ يَا خِيَرَةِ ٱللَّهِ وَٱبْنَ خَيرَتِهِ
alssalamu \`alayka ya khiyarata allahi wabna khiyaratihi
Peace be upon you, O choicest of Allah and son of His choicest.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ أَمِيرِ ٱلْمُؤْمِنِينَ
alssalamu \`alayka yabna amiri almu'minina
Peace be upon you, O son of the Commander of the Faithful

وَٱبْنَ سَيِّدِ ٱلْوَصِيِّينَ
wabna sayyidi alwasiyyina
and son of the chief of the Prophets' successors.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ فَاطِمَةَ
alssalamu \`alayka yabna fatimata
Peace be upon you, O son of Fatimah

سَيِّدَةِ نِسَاءِ ٱلْعَالَمِينَ
sayyidati nisa'i al\`alamina
the doyenne of the women of the worlds.

اَلسَّلاَمُ عَلَيْكَ يَا ثَارَ ٱللَّهِ وَٱبْنَ ثَارِهِ وَٱلْوِتْرَ ٱلْمَوْتُورَ
alssalamu \`alayka ya thara allahi wabna tharihi walwitra almawtura
Peace be upon you, O vengeance of Allah, son of His vengeance, and the unavenged so far.

You may then repeat the following Laan ** one hundred times:
اَللَّهُمَّ ٱلْعَنْ أَوَّلَ ظَالِمٍ
allahumma il\`an awwala zalimin
O Allah, pour curses upon the foremost persecutor

ظَلَمَ حَقَّ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
zalama haqqa muhammadin wa ali muhammadin
who usurped the right of Muhammad and Muhammad's Household

وَآخِرَ تَابِعٍ لَهُ عَلَىٰ ذٰلِكَ
wa akhira tabi\`in lahu \`ala dhalika
and the last follower who acceded to his deed.`;

        // Parse prayer text into segments
        const lines = prayerText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);
        const segments: PrayerSegment[] = [];
        const notes: string[] = [];

        // Add a note about the instruction
        let i = 0;
        while (i < lines.length) {
          // Check if line contains instructions
          if (lines[i].includes("**") || lines[i].includes("You may then")) {
            notes.push(lines[i]);
            i++;
            continue;
          }

          // Check if we have a complete 3-line segment
          if (
            i + 2 < lines.length &&
            !lines[i].includes("**") &&
            !lines[i + 1].includes("**") &&
            !lines[i + 2].includes("**")
          ) {
            segments.push({
              arabic: lines[i],
              transliteration: lines[i + 1],
              translation: lines[i + 2],
            });
            i += 3;
          } else {
            // Handle incomplete segments
            i++;
          }
        }

        // Insert notes as special segments
        notes.forEach((note) => {
          segments.push({
            arabic: "",
            transliteration: note,
            translation: "",
          });
        });

        setPrayerData({
          title: ziyaratTitle,
          arabicTitle: ziyaratArabicTitle,
          introduction: introduction,
          segments: segments,
        });
      } catch (error) {
        console.error("Error parsing prayer text:", error);
      } finally {
        setLoading(false);
      }
    };

    parseZiyaratText();
  }, []);

  // Function to render prayer segments
  const renderPrayerSegments = () => {
    return prayerData.segments.map((segment, index) => {
      // Check if this is a note/instruction
      const isNote =
        segment.transliteration.includes("You may then") ||
        segment.transliteration.includes("**");

      if (isNote) {
        return (
          <View key={index} style={styles.noteCard}>
            <Text
              style={[
                styles.noteText,
                {
                  fontSize: fontSize,
                  lineHeight: lineHeight,
                },
              ]}
            >
              {segment.transliteration.replace(/\*\*/g, "")}
            </Text>
          </View>
        );
      }

      return (
        <View
          key={index}
          style={[
            styles.prayerCard,
            { borderColor: Colors[colorScheme || "light"].border },
            index === prayerData.segments.length - 1
              ? { borderBottomWidth: 0, marginBottom: 0 }
              : {},
          ]}
        >
          {/* Arabic and Transliteration */}
          <View style={styles.arabicContainer}>
            <Text
              style={[
                styles.arabicText,
                {
                  fontSize: fontSize + 6,
                  lineHeight: lineHeight + 10,
                },
              ]}
            >
              {segment.arabic}
            </Text>
            <Text
              style={[
                styles.transliterationText,
                {
                  fontSize: fontSize - 2,
                  lineHeight: lineHeight - 2,
                },
              ]}
            >
              {segment.transliteration}
            </Text>
          </View>

          {/* Translation */}
          <View style={styles.translationContainer}>
            <Text
              style={[
                styles.translationText,
                {
                  fontSize: fontSize,
                  lineHeight: lineHeight,
                  color: Colors[colorScheme || "light"].text,
                },
              ]}
            >
              {segment.translation}
            </Text>
          </View>
        </View>
      );
    });
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: Colors[colorScheme || "light"].background },
        ]}
      >
        <Text style={{ color: Colors[colorScheme || "light"].text }}>
          Loading prayer...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme || "light"].background },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{prayerData.title}</Text>
            <Text style={styles.headerSubtitle}>{prayerData.arabicTitle}</Text>
          </View>
        </View>

        {/* Introduction */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>{prayerData.introduction}</Text>
        </View>

        {/* Main Prayer Content */}
        <View style={styles.contentContainer}>{renderPrayerSegments()}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flex: 1,
    overflow: "hidden",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  header: {
    backgroundColor: Colors.universal.primary,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#d1fae5",
  },
  introContainer: {
    padding: 24,
    backgroundColor: Colors.universal.third,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  introText: {
    lineHeight: 24,
  },
  contentContainer: {
    padding: 24,
  },
  prayerCard: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  noteCard: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  arabicContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  arabicText: {
    textAlign: "right",
    marginBottom: 8,
    writingDirection: "rtl",
    fontWeight: "600",
    color: "#2563eb", // Blue color for Arabic text
  },
  transliterationText: {
    fontStyle: "italic",
    textAlign: "right",
    color: "#6b7280",
  },
  translationContainer: {
    justifyContent: "center",
  },
  translationText: {
    fontWeight: "500",
  },
  noteText: {
    color: "#64748b",
  },
});

export default RenderPrayer;
