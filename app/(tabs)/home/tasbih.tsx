import { Colors } from "@/constants/Colors";
import { useLanguage } from "@/context/LanguageContext";
import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useTranslation } from "react-i18next";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native"; // Removed Dimensions as it wasn't used directly
import { SafeAreaView } from "react-native-safe-area-context";

// Make initial Dhikr Types immutable-like for safer resets
const initialDhikrTypes = Object.freeze([
  {
    id: 1,
    name: "Subhanallah",
    arabicText: "سُبْحَانَ ٱللَّٰهِ",
    defaultLimit: 33,
  },
  {
    id: 2,
    name: "Alhamdulillah",
    arabicText: "ٱلْحَمْدُ لِلَّٰهِ",
    defaultLimit: 33,
  },
  {
    id: 3,
    name: "Allahu Akbar",
    arabicText: "ٱللَّٰهُ أَكْبَرُ",
    defaultLimit: 34,
  },
  {
    id: 4,
    name: "La ilaha illallah",
    arabicText: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    defaultLimit: 100,
  },
  {
    id: 5,
    name: "Astaghfirullah",
    arabicText: "أَسْتَغْفِرُ ٱللَّٰهَ",
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
    name: "Free Mode",
    description: "Choose any dhikr",
    icon: "🔄",
    sequence: [],
  },
  {
    id: "tasbih",
    name: "Tasbih Prayer",
    description: "33-33-34 Standard",
    icon: "📿",
    sequence: [
      // Order changed to reflect common practice: Subhanallah -> Alhamdulillah -> Allahu Akbar
      { dhikrId: 1, limit: 33 }, // Subhanallah
      { dhikrId: 2, limit: 33 }, // Alhamdulillah
      { dhikrId: 3, limit: 34 }, // Allahu Akbar
    ],
  },
  {
    id: "salat",
    name: "After Salat",
    description: "33-33-33-1 Pattern",
    icon: "🕌",
    sequence: [
      { dhikrId: 1, limit: 33 },
      { dhikrId: 2, limit: 33 },
      { dhikrId: 3, limit: 33 },
      { dhikrId: 4, limit: 1 }, // Using limit here for consistency
    ],
  },
  {
    id: "istighfar",
    name: "Istighfar",
    description: "100x Astaghfirullah",
    icon: "🤲",
    sequence: [{ dhikrId: 5, limit: 100 }],
  },
]);

export default function App() {
  const [counters, setCounters] = useState(getInitialCountersState());
  const [activeDhikrId, setActiveDhikrId] = useState(initialDhikrTypes[0].id); // Tracks the visually active/target dhikr
  const [totalDhikr, setTotalDhikr] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState("free");
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
  const [sequenceCompleted, setSequenceCompleted] = useState(false);

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
    // Find the counter based on activeDhikrId for free mode or completed sequence display
    const counterForLimit = counters.find((c) => c.id === activeDhikrId);
    return counterForLimit?.defaultLimit ?? 0; // Use defaultLimit from base definition
  }, [
    isPresetMode,
    sequenceCompleted,
    currentPreset,
    currentPresetIndex,
    activeDhikrId,
    counters,
  ]);

  const activeLimit = getActiveLimit();
  const isLimitReached = activeCounter && activeCounter.count >= activeLimit;

  // --- Event Handlers ---

  // Use useCallback for performance if handlers were passed down as props
  const handleIncrement = useCallback(() => {
    if (
      !activeCounter ||
      (isLimitReached && !isPresetMode) ||
      (isPresetMode && sequenceCompleted)
    )
      return; // Prevent increment if limit reached (free) or sequence done

    setCounters((prevCounters) =>
      prevCounters.map((counter) => {
        if (counter.id === targetCounterId) {
          // Check against the correct activeLimit before incrementing
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
    // If decrementing makes the sequence incomplete, reset flag
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

  const handleResetCurrent = useCallback(() => {
    // Prevent resetting individual counter during an active preset sequence
    if (isPresetMode && !sequenceCompleted) return;
    if (!activeCounter) return;

    setCounters((prevCounters) =>
      prevCounters.map((counter) => {
        if (counter.id === activeDhikrId) {
          // Reset the visually selected tab
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
    // Keep the selected preset, but reset its progress.
    // Reset activeDhikrId based on current mode
    const preset = prayerPresets.find((p) => p.id === selectedPresetId);
    if (selectedPresetId !== "free" && preset && preset.sequence.length > 0) {
      setActiveDhikrId(preset.sequence[0].dhikrId); // Reset to start of sequence
    } else {
      setActiveDhikrId(initialDhikrTypes[0].id); // Reset to first default Dhikr
      setSelectedPresetId("free"); // Also switch back to free mode on full reset
    }
  }, [selectedPresetId]); // Add selectedPresetId dependency

  const handlePresetChange = useCallback(
    (presetId) => {
      if (presetId !== selectedPresetId) {
        setSelectedPresetId(presetId);
        setCounters(getInitialCountersState()); // Reset counts
        setTotalDhikr(0);
        setCurrentPresetIndex(0);
        setSequenceCompleted(false);

        // Set the active Dhikr to the first one in the new preset (or default if free mode)
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
      return; // Only run for active, incomplete presets
    }

    const currentSequenceItem = currentPreset.sequence[currentPresetIndex];
    if (!currentSequenceItem) return; // Should not happen, but safety check

    const currentCounter = counters.find(
      (c) => c.id === currentSequenceItem.dhikrId
    );

    // Set the active tab visual to the current sequence item
    setActiveDhikrId(currentSequenceItem.dhikrId);

    // Check if current step in sequence is complete
    if (currentCounter && currentCounter.count >= currentSequenceItem.limit) {
      // Move to next dhikr in sequence
      if (currentPresetIndex < currentPreset.sequence.length - 1) {
        // Use timeout to allow state update and prevent rapid skipping if holding button
        const timer = setTimeout(() => {
          setCurrentPresetIndex((prev) => prev + 1);
        }, 150); // Adjust delay as needed
        return () => clearTimeout(timer); // Cleanup timeout on effect re-run
      } else {
        // Sequence completed
        setSequenceCompleted(true);
      }
    }
    // Rerun when counters change, or the preset index changes, or mode changes
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
      ? (activeCounter.count / activeLimit) * 100
      : 0;

  // Determine if tabs should be shown (only in free mode)
  const showTabs = selectedPresetId === "free";

  const { t } = useTranslation();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors.universal.primary }}
      edges={["top"]}
    >
      <ScrollView style= {styles.container} contentContainerStyle={{flex: 1}}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{t("tasbih")}</Text>
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
            ); // Cache for lookup
            return (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.prayerCard,
                  selectedPresetId === preset.id && styles.selectedPrayerCard,
                ]}
                onPress={() => handlePresetChange(preset.id)}
              >
                <Text style={styles.prayerCardIcon}>{preset.icon}</Text>
                <Text style={styles.prayerCardTitle}>{preset.name}</Text>
                <Text style={styles.prayerCardDescription}>
                  {preset.description}
                </Text>

                {preset.id !== "free" && (
                  <View style={styles.prayerCardSequence}>
                    {preset.sequence.map((item, index) => (
                      <Text key={index} style={styles.prayerCardSequenceItem}>
                        {item.limit}x {dhikrInfoMap[item.dhikrId]?.name ?? ""}
                      </Text>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Preset Progress Indicator */}
        {!isPresetMode || !currentPreset.sequence.length ? null : (
          <View style={styles.presetProgressContainer}>
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
                  key={`${item.dhikrId}-${index}`} // More robust key
                  style={[
                    styles.presetProgressItem,
                    isStepActive && styles.presetProgressItemActive,
                    isStepCompleted && styles.presetProgressItemCompleted,
                  ]}
                >
                  <Text style={styles.presetProgressText} numberOfLines={1}>
                    {/* Show current count vs limit for active, else just limit */}
                    {isStepActive
                      ? `${stepCounter?.count ?? 0}/${item.limit} `
                      : `${item.limit}x `}
                    {dhikrInfo ? dhikrInfo.name.substring(0, 4) : ""}{" "}
                    {/* Slightly longer abbr */}
                  </Text>
                </View>
              );
            })}
          </View>
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
              // Iterate over base types for tabs
              const counterData = counters.find((c) => c.id === dhikr.id); // Find current count if needed
              return (
                <TouchableOpacity
                  key={dhikr.id}
                  style={[
                    styles.tab,
                    activeDhikrId === dhikr.id && styles.activeTab,
                  ]}
                  onPress={() => setActiveDhikrId(dhikr.id)} // Directly set active ID in free mode
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeDhikrId === dhikr.id && styles.activeTabText,
                    ]}
                  >
                    {dhikr.name}
                  </Text>
                  {/* Optionally show count on tab: <Text>{counterData?.count}</Text> */}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Main Counter Card */}
        {activeCounter && (
          <View style={styles.counterCard}>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${percentage}%` },
                  percentage >= 100 && !isPresetMode && styles.progressComplete, // Normal complete
                  isPresetMode &&
                    sequenceCompleted &&
                    styles.progressSequenceComplete, // Sequence complete
                ]}
              />
            </View>

            {/* Arabic Text */}
            <Text style={styles.arabicText}>{activeCounter.arabicText}</Text>

            {/* Counter Value */}
            <Text style={styles.counterText}>{activeCounter.count}</Text>

            {/* Limit Indicator */}
            <Text style={styles.limitText}>
              {isPresetMode && sequenceCompleted
                ? "Sequence Complete"
                : `${activeCounter.count} / ${activeLimit}`}
            </Text>

            {/* Completion Message */}
            {isPresetMode && sequenceCompleted && (
              <Text
                style={[styles.completionText, styles.sequenceCompletionText]}
              >
                {currentPreset.name} completed ✓
              </Text>
            )}
            {/* Step completion hint (optional) */}
            {isPresetMode &&
              !sequenceCompleted &&
              isLimitReached &&
              currentPresetIndex < currentPreset.sequence.length - 1 && (
                <Text style={styles.stepCompletionText}>
                  Step complete! Next...
                </Text>
              )}
            {!isPresetMode && isLimitReached && (
              <Text style={styles.completionText}>
                {activeCounter.name} complete ✓
              </Text>
            )}
          </View>
        )}

        {/* Counter Buttons */}
        <View style={styles.countButtonsContainer}>
          {/* Decrement Button */}
          <TouchableOpacity
            style={[
              styles.decrementButton,
              (activeCounter?.count <= 0 ||
                (isPresetMode && sequenceCompleted)) &&
                styles.disabledButton, // Disable logic
            ]}
            onPress={handleDecrement}
            activeOpacity={0.7} // Good practice
            disabled={
              activeCounter?.count <= 0 || (isPresetMode && sequenceCompleted)
            }
          >
            <Text style={styles.decrementButtonText}>-</Text>
          </TouchableOpacity>

          {/* Main Counter Button (Increment) */}
          <TouchableOpacity
            style={[
              styles.counterButton,
              // Disable if limit reached (in free mode OR current step in preset) OR sequence completed
              ((!isPresetMode && isLimitReached) ||
                (isPresetMode && !sequenceCompleted && isLimitReached) ||
                (isPresetMode && sequenceCompleted)) &&
                styles.disabledButton,
            ]}
            onPress={handleIncrement}
            activeOpacity={0.7} // Good practice
            disabled={
              (!isPresetMode && isLimitReached) ||
              (isPresetMode && !sequenceCompleted && isLimitReached) ||
              (isPresetMode && sequenceCompleted)
            }
          >
            <View
              style={[
                styles.counterButtonInner,
                // Darken inner button too when disabled
                ((!isPresetMode && isLimitReached) ||
                  (isPresetMode && !sequenceCompleted && isLimitReached) ||
                  (isPresetMode && sequenceCompleted)) && {
                  backgroundColor: "#55798C",
                },
              ]}
            >
              <Text style={styles.counterButtonText}>Tap</Text>
            </View>
          </TouchableOpacity>
          {/* Placeholder to balance the layout */}
          <View style={{ width: 60, marginRight: 20 }} />
        </View>

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.resetButton,
              // Disable reset current during active preset
              isPresetMode && !sequenceCompleted && styles.disabledButton,
            ]}
            onPress={handleResetCurrent}
            disabled={isPresetMode && !sequenceCompleted}
          >
            <Text style={styles.resetButtonText}>Reset Current</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, styles.resetAllButton]}
            onPress={handleResetAll} // Reset All always enabled
          >
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>

        {/* Total Counter */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Dhikr:</Text>
          <Text style={styles.totalCount}>{totalDhikr}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Minor adjustments and additions) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  cardsContainer: {},

  cardsContent: {
    paddingVertical: 15,
  },
  prayerCard: {
    width: 170,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    minHeight: 160,
  },
  selectedPrayerCard: {
    backgroundColor: "rgba(102,179,204,0.2)",
    borderColor: "#66B3CC",
    transform: [{ scale: 1.03 }], // Slightly more emphasis
    shadowColor: "#66B3CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  prayerCardIcon: {
    fontSize: 22, // Slightly smaller icon
    marginBottom: 6,
  },
  prayerCardTitle: {
    fontSize: 16, // Adjusted size
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  prayerCardDescription: {
    fontSize: 12, // Smaller description
    color: "#A3CCE6",
    marginBottom: 8,
    flexShrink: 1, // Allow description to shrink if needed
  },
  prayerCardSequence: {
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: 6, // Adjusted padding
    borderRadius: 6,
    marginTop: "auto", // Push sequence to bottom
  },
  prayerCardSequenceItem: {
    color: "#FFFFFF",
    fontSize: 11, // Smaller sequence text
    marginVertical: 1,
  },
  presetProgressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8, // Reduced margin
    paddingHorizontal: 15, // Reduced padding
  },
  presetProgressItem: {
    flexShrink: 1, // Allow items to shrink
    paddingVertical: 6, // Reduced padding
    paddingHorizontal: 8,
    marginHorizontal: 4, // Reduced margin
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent", // Default no border
  },
  presetProgressItemActive: {
    backgroundColor: "rgba(102,179,204,0.5)",
    borderColor: "#66B3CC",
  },
  presetProgressItemCompleted: {
    backgroundColor: "rgba(102,204,138,0.3)", // More subtle completed
    borderColor: "rgba(102,204,138,0.6)",
  },
  presetProgressText: {
    color: "#FFFFFF",
    fontSize: 11, // Smaller text
    fontWeight: "500",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    maxHeight: 50, // Reduced height
    marginVertical: 5, // Reduced margin
  },
  tabsContent: {
    paddingHorizontal: 15,
    alignItems: "center", // Center tabs vertically
  },
  tab: {
    paddingHorizontal: 18, // Adjusted padding
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20, // More rounded
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  activeTab: {
    backgroundColor: "#4A8DB7", // Slightly different blue for active tab
  },
  tabText: {
    color: "#A3CCE6",
    fontSize: 13, // Slightly smaller tab text
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  counterCard: {
    flexGrow: 1, // Allow card to take available space
    justifyContent: "center", // Center content vertically in the card
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  progressContainer: {
    position: "absolute", // Position progress bar at the top
    top: 0,
    left: 0,
    right: 0,
    height: 2, // Thicker bar
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 10
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#66B3CC", // Teal progress color
  },
  progressComplete: {
    backgroundColor: "#66CC8A", // Green completion color (Free mode)
  },
  progressSequenceComplete: {
    backgroundColor: "#FFC107", // Amber/Gold for sequence completion
  },
  arabicText: {
    fontSize: 32, // Larger Arabic text
    color: "#FFFFFF",
    marginBottom: 10,
    fontWeight: "300",
    textAlign: "center",
  },
  counterText: {
    fontSize: 72, // Larger counter
    fontWeight: "bold",
    color: "#FFFFFF",
    lineHeight: 80, // Adjust line height
  },
  limitText: {
    fontSize: 16,
    color: "#A3CCE6",
    marginTop: 8,
  },
  completionText: {
    // Base style for completion messages
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "center",
  },
  sequenceCompletionText: {
    color: "#FFC107", // Match sequence progress bar color
  },
  stepCompletionText: {
    // Optional style for step complete hint
    color: "#66B3CC", // Teal color
    fontSize: 14,
    fontWeight: "normal",
    marginTop: 10,
  },
  countButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center buttons horizontally
    paddingHorizontal: 200, // Padding on sides
    marginVertical: 15,
  },
  counterButton: {
    // Main Increment Button
    width: 140, // Slightly smaller
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 15, // Space around main button
  },
  counterButtonInner: {
    width: 120, // Smaller inner circle
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#66B3CC", // Teal color
  },
  counterButtonText: {
    color: "#FFFFFF",
    fontSize: 16, // Smaller text
    fontWeight: "bold",
  },
  decrementButton: {
    // Decrement Button
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(239, 83, 80, 0.3)", // Red hint
    borderWidth: 1,
    borderColor: "rgba(239, 83, 80, 0.5)",
    marginRight: 20, // Keep margin for spacing
  },
  decrementButtonText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 32, // Adjust vertical centering
  },
  disabledButton: {
    opacity: 0.4, // Consistent disabled style
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10, // Reduced margin
    paddingBottom: 10,
  },
  resetButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 18,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  resetAllButton: {
    backgroundColor: "rgba(239, 83, 80, 0.2)", // Red hint for Reset All
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13, // Slightly smaller text
    fontWeight: "500",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15, // Adjusted margin
    marginBottom: 15, // Ensure some bottom margin
  },
  totalLabel: {
    color: "#A3CCE6",
    fontSize: 16,
    marginRight: 10,
  },
  totalCount: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
});
