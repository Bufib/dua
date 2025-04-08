import { Colors } from "@/constants/Colors";
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "@/utils/i18n";
import { ThemedText } from "@/components/ThemedText";
// Make initial Dhikr Types immutable-like for safer resets
const initialDhikrTypes = Object.freeze([
  {
    id: 0,
    name: `${i18n.t("dhikrFree")}`,
    arabicText: "",
    defaultLimit: 100,
  },
  {
    id: 1,
    name: "Subhanallah",
    arabicText: `${i18n.t("dhikrSubhanallah")}`,
    defaultLimit: 100,
  },
  {
    id: 2,
    name: "Alhamdulillah",
    arabicText: `${i18n.t("dhikrAlhamdulillah")}`,
    defaultLimit: 100,
  },
  {
    id: 3,
    name: "Allahu Akbar",
    arabicText: `${i18n.t("dhikrAllahuAkbar")}`,
    defaultLimit: 100,
  },
  {
    id: 4,
    name: "La ilaha illallah",
    arabicText: `${i18n.t("dhikrLaIlahaIllallah")}`,
    defaultLimit: 100,
  },
  {
    id: 5,
    name: "Astaghfirullah",
    arabicText: `${i18n.t("dhikrAstaghfirullah")}`,
    defaultLimit: 100,
  },
]);

// Function to get initial state for counters
const getInitialCountersState = () =>
  initialDhikrTypes.map((dhikr) => ({ ...dhikr, count: 0 }));

// Define prayer presets (using the base dhikr definitions)
const prayerPresets = Object.freeze([
  {
    id: "free",
    name: i18n.t("freeMode"),
    description: i18n.t("freeModeDescription"),
    icon: "🔄",
    sequence: [],
  },
  {
    id: "1",
    name: i18n.t("TasbihFatima"), // if you want dynamic translation, consider using t() here too
    icon: "📿",
    sequence: [
      { dhikrId: 3, limit: 34 },
      { dhikrId: 2, limit: 33 },
      { dhikrId: 1, limit: 33 },
    ],
  },
]);

export default function App() {
  const [counters, setCounters] = useState(getInitialCountersState());
  const [activeDhikrId, setActiveDhikrId] = useState(initialDhikrTypes[0].id);
  const [totalDhikr, setTotalDhikr] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState("free");
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);
  // New state for free mode maximum reps
  const [freeModeMaxRep, setFreeModeMaxRep] = useState(
    initialDhikrTypes[0].defaultLimit
  );

  // --- Derived State and Helpers ---
  const currentPreset = prayerPresets.find(
    (preset) => preset.id === selectedPresetId
  );
  const isPresetMode =
    selectedPresetId !== "free" &&
    currentPreset &&
    currentPreset.sequence.length > 0;

  // Determine the ID of the counter that should be acted upon (increment/decrement)
  const targetCounterId =
    isPresetMode && !sequenceCompleted
      ? currentPreset.sequence[currentPresetIndex]?.dhikrId
      : activeDhikrId;

  // Find the full data for the counter being displayed/acted upon
  const activeCounter = counters.find(
    (counter) => counter.id === targetCounterId
  );

  // Determine the correct limit for the current context
  const getActiveLimit = useCallback(() => {
    if (
      isPresetMode &&
      !sequenceCompleted &&
      currentPreset.sequence[currentPresetIndex]
    ) {
      return currentPreset.sequence[currentPresetIndex].limit;
    }
    // In free mode, return the user-defined maximum rep
    return freeModeMaxRep;
  }, [
    isPresetMode,
    sequenceCompleted,
    currentPreset,
    currentPresetIndex,
    freeModeMaxRep,
  ]);

  const activeLimit = getActiveLimit();
  const isLimitReached = activeCounter && activeCounter.count >= activeLimit;

  // --- Event Handlers ---

  const handleIncrement = useCallback(() => {
    if (
      !activeCounter ||
      (isLimitReached && !isPresetMode) ||
      (isPresetMode && sequenceCompleted)
    )
      return;

    setCounters((prevCounters) =>
      prevCounters.map((counter) => {
        if (counter.id === targetCounterId) {
          if (counter.count < activeLimit) {
            setTotalDhikr((prev) => prev + 1);
            return { ...counter, count: counter.count + 1 };
          }
        }
        return counter;
      })
    );
  }, [
    activeCounter,
    targetCounterId,
    activeLimit,
    isLimitReached,
    isPresetMode,
    sequenceCompleted,
  ]);

  const handleDecrement = useCallback(() => {
    if (
      !activeCounter ||
      activeCounter.count <= 0 ||
      (isPresetMode && sequenceCompleted)
    )
      return;

    setCounters((prevCounters) =>
      prevCounters.map((counter) => {
        if (counter.id === targetCounterId && counter.count > 0) {
          setTotalDhikr((prev) => prev - 1);
          return { ...counter, count: counter.count - 1 };
        }
        return counter;
      })
    );
    if (
      isPresetMode &&
      sequenceCompleted &&
      activeCounter.count === activeLimit
    ) {
      setSequenceCompleted(false);
    }
  }, [
    activeCounter,
    targetCounterId,
    activeLimit,
    isPresetMode,
    sequenceCompleted,
  ]);

  // const handleResetCurrent = useCallback(() => {
  //   if (!activeCounter) return;

  //   setCounters((prevCounters) =>
  //     prevCounters.map((counter) => {
  //       if (counter.id === activeDhikrId) {
  //         setTotalDhikr((prev) => prev - (counter.count || 0));
  //         return { ...counter, count: 0 };
  //       }
  //       return counter;
  //     })
  //   );
  // }, [activeCounter, activeDhikrId]);

  const handleResetCurrent = useCallback(() => {
    if (!activeCounter) return;

    // If using a preset, adjust the sequence state to maintain progression
    if (isPresetMode) {
      // If the sequence is complete, or if you want to allow a mid-sequence reset,
      // reset the progression. Here we’re resetting the entire sequence back to stage 0.
      if (sequenceCompleted) {
        setSequenceCompleted(false);
        setCurrentPresetIndex(0);
      }
      // (Optional) If you want to reset subsequent stages’ counts as well,
      // you can loop over currentPreset.sequence and reset each corresponding counter.
    }

    // Reset the active counter regardless of mode
    setCounters((prevCounters) =>
      prevCounters.map((counter) => {
        if (counter.id === activeDhikrId) {
          setTotalDhikr((prev) => prev - (counter.count || 0));
          return { ...counter, count: 0 };
        }
        return counter;
      })
    );
  }, [activeCounter, activeDhikrId, isPresetMode, sequenceCompleted]);

  const handleResetAll = useCallback(() => {
    setCounters(getInitialCountersState());
    setTotalDhikr(0);
    setCurrentPresetIndex(0);
    setSequenceCompleted(false);
    const preset = prayerPresets.find((p) => p.id === selectedPresetId);
    if (selectedPresetId !== "free" && preset && preset.sequence.length > 0) {
      setActiveDhikrId(preset.sequence[0].dhikrId);
    } else {
      setActiveDhikrId(initialDhikrTypes[0].id);
      setSelectedPresetId("free");
    }
  }, [selectedPresetId]);

  const handlePresetChange = useCallback(
    (presetId: string) => {
      if (presetId !== selectedPresetId) {
        setSelectedPresetId(presetId);
        setCounters(getInitialCountersState());
        setTotalDhikr(0);
        setCurrentPresetIndex(0);
        setSequenceCompleted(false);

        const newPreset = prayerPresets.find((p) => p.id === presetId);
        if (
          presetId === "free" ||
          !newPreset ||
          newPreset.sequence.length === 0
        ) {
          setActiveDhikrId(initialDhikrTypes[0].id);
        } else {
          setActiveDhikrId(newPreset.sequence[0].dhikrId);
        }
      }
    },
    [selectedPresetId]
  );

  // --- Effect for Preset Sequence Progression ---
  useEffect(() => {
    if (!isPresetMode || sequenceCompleted) {
      return;
    }

    const currentSequenceItem = currentPreset.sequence[currentPresetIndex];
    if (!currentSequenceItem) return;

    setActiveDhikrId(currentSequenceItem.dhikrId);

    const currentCounter = counters.find(
      (c) => c.id === currentSequenceItem.dhikrId
    );

    if (currentCounter && currentCounter.count >= currentSequenceItem.limit) {
      if (currentPresetIndex < currentPreset.sequence.length - 1) {
        const timer = setTimeout(() => {
          setCurrentPresetIndex((prev) => prev + 1);
        }, 150);
        return () => clearTimeout(timer);
      } else {
        setSequenceCompleted(true);
      }
    }
  }, [
    counters,
    currentPresetIndex,
    isPresetMode,
    sequenceCompleted,
    currentPreset,
  ]);

  // --- UI Rendering ---

  const percentage =
    activeCounter && activeLimit > 0
      ? Math.min((activeCounter.count / activeLimit) * 100, 100)
      : 0;

  const showTabs = selectedPresetId === "free";

  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ flexGrow: 1, gap: 10, paddingBottom: 20 }}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <ThemedText style={styles.headerTitle} type="title">
            {t("tasbih")}
          </ThemedText>
        </View>

        {/* Prayer Preset Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
          decelerationRate="fast"
        >
          {prayerPresets.map((preset) => {
            const dhikrInfoMap = Object.fromEntries(
              initialDhikrTypes.map((d) => [d.id, d])
            );
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.prayerCard,
                  selectedPresetId === preset.id && styles.selectedPrayerCard,
                  {
                    backgroundColor: Colors[colorScheme].contrast,
                    shadowColor: Colors[colorScheme].shadowColor,
                    borderColor: Colors[colorScheme].border,
                  },
                ]}
                onPress={() => handlePresetChange(preset.id)}
              >
                <ThemedText style={styles.prayerCardIcon}>
                  {preset.icon}
                </ThemedText>
                <ThemedText style={styles.prayerCardTitle}>
                  {preset.name}
                </ThemedText>
                <ThemedText style={styles.prayerCardDescription}>
                  {preset.description}
                </ThemedText>

                {preset.id !== "free" && (
                  <View style={styles.prayerCardSequence}>
                    {preset.sequence.map((item, index) => (
                      <ThemedText
                        key={index}
                        style={styles.prayerCardSequenceItem}
                      >
                        {item.limit}x{" "}
                        {dhikrInfoMap[item.dhikrId]
                          ? dhikrInfoMap[item.dhikrId].name
                          : ""}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Preset Progress Indicator */}
        {isPresetMode && currentPreset.sequence.length > 0 && (
          <ScrollView
            style={styles.presetProgressContainer}
            contentContainerStyle={{
              flexGrow: 1,
              flexDirection: "row",
              justifyContent: "center",
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {currentPreset.sequence.map((item, index) => {
              const dhikrInfo = initialDhikrTypes.find(
                (d) => d.id === item.dhikrId
              );
              const stepCounter = counters.find((c) => c.id === item.dhikrId);
              const isStepActive =
                index === currentPresetIndex && !sequenceCompleted;
              const isStepCompleted =
                sequenceCompleted ||
                index < currentPresetIndex ||
                (stepCounter && stepCounter.count >= item.limit);

              return (
                <View
                  key={`${item.dhikrId}-${index}`}
                  style={[
                    styles.presetProgressItem,
                    isStepActive && styles.presetProgressItemActive,
                    isStepCompleted && styles.presetProgressItemCompleted,
                  ]}
                >
                  <Text style={styles.presetProgressText} numberOfLines={1}>
                    {isStepActive
                      ? `${stepCounter?.count ?? 0}/${item.limit} `
                      : `${item.limit}x `}
                    {dhikrInfo && dhikrInfo.name}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Dhikr Selection Tabs - Only show in free mode */}
        {showTabs && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {initialDhikrTypes.map((dhikr) => {
              const counterData = counters.find((c) => c.id === dhikr.id);
              return (
                <TouchableOpacity
                  key={dhikr.id}
                  style={[
                    styles.tab,
                    activeDhikrId === dhikr.id && styles.activeTab,
                  ]}
                  onPress={() => setActiveDhikrId(dhikr.id)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeDhikrId === dhikr.id && styles.activeTabText,
                    ]}
                  >
                    {dhikr.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Maximum Reps Input for Free Mode */}
        {selectedPresetId === "free" && (
          <View style={styles.maxRepContainer}>
            <ThemedText style={styles.maxRepLabel}>
              {t("setMaximumReps")}
            </ThemedText>
            <TextInput
              style={[
                styles.maxRepInput,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  color: Colors[colorScheme].text,
                },
              ]}
              value={freeModeMaxRep.toString()}
              onChangeText={(value) => setFreeModeMaxRep(Number(value) || 0)}
              keyboardType="numeric"
            />
          </View>
        )}

        {/* Main Counter Card */}
        {activeCounter && (
          <View
            style={[
              styles.counterCard,
              {
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${percentage}%` },
                  percentage >= 100 && !isPresetMode && styles.progressComplete,
                  isPresetMode &&
                    sequenceCompleted &&
                    styles.progressSequenceComplete,
                ]}
              />
            </View>
            <ThemedText style={styles.arabicText}>
              {activeCounter.arabicText}
            </ThemedText>
            <ThemedText style={styles.counterText}>
              {activeCounter.count}
            </ThemedText>
            <ThemedText style={styles.limitText}>
              {isPresetMode && sequenceCompleted
                ? "Sequence Complete"
                : `${activeCounter.count} / ${activeLimit}`}
            </ThemedText>
            {isPresetMode && sequenceCompleted && (
              <Text
                style={[styles.completionText, styles.sequenceCompletionText]}
              >
                {currentPreset.name} {t("completedText")}
              </Text>
            )}
            {isPresetMode &&
              !sequenceCompleted &&
              isLimitReached &&
              currentPresetIndex < currentPreset.sequence.length - 1 && (
                <Text style={styles.stepCompletionText}>
                  {t("stepCompleteNext")}
                </Text>
              )}
            {!isPresetMode && isLimitReached && (
              <Text style={styles.completionText}>
                {activeCounter.name} {t("completedText")}
              </Text>
            )}
          </View>
        )}

        {/* Counter Buttons */}
        <View style={styles.countButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.decrementButton,
              ((activeCounter && activeCounter?.count <= 0) ||
                (isPresetMode && sequenceCompleted)) &&
                styles.disabledButton,
            ]}
            onPress={handleDecrement}
            activeOpacity={0.7}
            disabled={
              (activeCounter && activeCounter?.count <= 0) ||
              (isPresetMode && sequenceCompleted)
            }
          >
            <Text style={styles.decrementButtonText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.counterButton,
              ((!isPresetMode && isLimitReached) ||
                (isPresetMode && !sequenceCompleted && isLimitReached) ||
                (isPresetMode && sequenceCompleted)) &&
                styles.disabledButton,
            ]}
            onPress={handleIncrement}
            activeOpacity={0.7}
            disabled={
              (!isPresetMode && isLimitReached) ||
              (isPresetMode && !sequenceCompleted && isLimitReached) ||
              (isPresetMode && sequenceCompleted)
            }
          >
            <View
              style={[
                styles.counterButtonInner,
                ((!isPresetMode && isLimitReached) ||
                  (isPresetMode && !sequenceCompleted && isLimitReached) ||
                  (isPresetMode && sequenceCompleted)) && {
                  backgroundColor: "#55798C",
                },
              ]}
            >
              <Text style={styles.counterButtonText}>{t("tap")}</Text>
            </View>
          </TouchableOpacity>
          <View style={{ width: 60, marginRight: 20 }} />
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              totalDhikr === 0 && styles.disabledButton,
            ]}
            onPress={handleResetCurrent}
            disabled={totalDhikr === 0}
          >
            <Text style={styles.resetButtonText}>{t("resetCurrent")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, styles.resetAllButton]}
            onPress={handleResetAll}
          >
            <Text style={styles.resetButtonText}>{t("resetAll")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 10,
  },
  headerContainer: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 10,
    marginTop: 10,
  },
  headerTitle: {},

  cardsContainer: {
    padding: 10,
  },
  cardsContent: {},
  prayerCard: {
    height: 200,
    width: 170,
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 8,
    borderWidth: 0.2,
  },
  selectedPrayerCard: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  prayerCardIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  prayerCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    lineHeight: 25,
  },
  prayerCardDescription: {
    fontSize: 12,
    marginBottom: 1,
    flexShrink: 1,
  },
  prayerCardSequence: {
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 6,
    borderRadius: 6,
    marginTop: "auto",
  },
  prayerCardSequenceItem: {
    fontSize: 11,
    marginVertical: 1,
  },
  presetProgressContainer: {},
  presetProgressItem: {
    flexShrink: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  presetProgressItemActive: {
    backgroundColor: Colors.universal.primary,
  },
  presetProgressItemCompleted: {
    backgroundColor: "rgba(102,204,138,1)",
    borderColor: "rgba(102,204,138,0.6)",
  },
  presetProgressText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    maxHeight: 50,
    marginVertical: 5,
  },
  tabsContent: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "rgba(102,204,138,1)",
  },
  activeTab: {
    backgroundColor: Colors.universal.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  maxRepContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  maxRepLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  maxRepInput: {
    height: 40,
    width: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 5,
    paddingHorizontal: 8,
    textAlign: "center",
  },
  counterCard: {
    flexGrow: 1,
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
  },
  progressContainer: {
    position: "absolute",
    top: -5,
    left: 0,
    right: 0,
    height: 5,
    marginHorizontal: 12,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.universal.primary,
    borderRadius: 99,
  },
  progressComplete: {
    backgroundColor: "#66CC8A",
  },
  progressSequenceComplete: {
    backgroundColor: "#FFC107",
  },
  arabicText: {
    fontSize: 32,
    lineHeight: 30,
    marginBottom: 10,
    fontWeight: "300",
    textAlign: "center",
  },
  counterText: {
    fontSize: 72,
    fontWeight: "bold",
    lineHeight: 80,
  },
  limitText: {
    fontSize: 16,
    color: "#888",
    marginTop: 8,
  },
  completionText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  sequenceCompletionText: {
    color: "#FFC107",
  },
  stepCompletionText: {
    color: Colors.universal.primary,
    fontSize: 14,
    fontWeight: "normal",
    marginTop: 10,
  },
  countButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 200,
    marginVertical: 15,
  },
  counterButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15,
  },
  counterButtonInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.primary,
  },
  counterButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  decrementButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 83, 80, 1)",
    borderWidth: 1,
    borderColor: "rgba(239, 83, 80, 0.5)",
    marginRight: 20,
  },
  decrementButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 32,
  },
  disabledButton: {
    opacity: 0.4,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingBottom: 10,
  },
  resetButton: {
    backgroundColor: Colors.universal.secondary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  resetAllButton: {
    backgroundColor: "rgba(239, 83, 80, 1)",
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },

  totalCount: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
