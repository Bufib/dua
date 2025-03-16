import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Platform,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  TextInput
} from "react-native";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import * as Haptics from 'expo-haptics';
import { CoustomTheme } from "@/utils/coustomTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

// Common Dhikr presets with translations
const dhikrPresets = [
  {
    id: 1,
    arabic: "سُبْحَانَ اللهِ",
    transliteration: "Subhan Allah",
    translation: {
      en: "Glory be to Allah",
      de: "Gepriesen sei Allah",
      ar: "سُبْحَانَ اللهِ"
    },
    recommendedCount: 33,
  },
  {
    id: 2,
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    transliteration: "Alhamdulillah",
    translation: {
      en: "Praise be to Allah",
      de: "Aller Preis gebührt Allah",
      ar: "ٱلْحَمْدُ لِلَّٰهِ"
    },
    recommendedCount: 33,
  },
  {
    id: 3,
    arabic: "اللهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: {
      en: "Allah is the Greatest",
      de: "Allah ist der Größte",
      ar: "اللهُ أَكْبَرُ"
    },
    recommendedCount: 33,
  },
  {
    id: 4,
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    transliteration: "La ilaha illallah",
    translation: {
      en: "There is no god but Allah",
      de: "Es gibt keinen Gott außer Allah",
      ar: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ"
    },
    recommendedCount: 100,
  },
  {
    id: 5,
    arabic: "أَسْتَغْفِرُ اللهَ",
    transliteration: "Astaghfirullah",
    translation: {
      en: "I seek forgiveness from Allah",
      de: "Ich bitte Allah um Vergebung",
      ar: "أَسْتَغْفِرُ اللهَ"
    },
    recommendedCount: 100,
  },
];

// Storage key
const TASBIH_STORAGE_KEY = "tasbih_progress";

export default function TasbihScreen() {
  const colorScheme = useColorScheme();
  const themeStyles = CoustomTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'AR';

  // State
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrPresets[0]);
  const [count, setCount] = useState(0);
  const [sets, setSets] = useState(0);
  const [targetCount, setTargetCount] = useState(33);
  const [animationValue] = useState(new Animated.Value(1));
  const [progress, setProgress] = useState<Record<number, {count: number, sets: number, customTarget?: number}>>({});
  const [customTargetModalVisible, setCustomTargetModalVisible] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState("");
  
  // Refs
  const countAreaRef = useRef(null);
  
  // Load saved progress
  useEffect(() => {
    loadProgress();
  }, []);
  
  // Save progress when count changes
  useEffect(() => {
    saveProgress();
  }, [count, sets, selectedDhikr]);

  // Update target count when selected dhikr changes
  useEffect(() => {
    // Load existing progress for this dhikr
    if (progress[selectedDhikr.id]) {
      setCount(progress[selectedDhikr.id].count);
      setSets(progress[selectedDhikr.id].sets);
      // Use custom target if it exists, otherwise use recommended count
      setTargetCount(progress[selectedDhikr.id].customTarget || selectedDhikr.recommendedCount);
    } else {
      setCount(0);
      setSets(0);
      setTargetCount(selectedDhikr.recommendedCount);
    }
  }, [selectedDhikr]);

  // Animation effect when count changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Check if target is reached
    if (count > 0 && count % targetCount === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSets(prev => prev + 1);
      
      // Vibrate more strongly on completion of a set
      if (Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
  }, [count]);

  // Load progress from AsyncStorage
  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(TASBIH_STORAGE_KEY);
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        setProgress(parsedProgress);
        
        // Set initial count based on saved progress for selected dhikr
        if (parsedProgress[selectedDhikr.id]) {
          setCount(parsedProgress[selectedDhikr.id].count);
          setSets(parsedProgress[selectedDhikr.id].sets);
        }
      }
    } catch (error) {
      console.error("Error loading tasbih progress:", error);
    }
  };
  
  // Save progress to AsyncStorage
  const saveProgress = async () => {
    try {
      const customTarget = progress[selectedDhikr.id]?.customTarget;
      const updatedProgress = {
        ...progress,
        [selectedDhikr.id]: { 
          count, 
          sets,
          // Only include customTarget if it exists
          ...(customTarget && { customTarget })
        }
      };
      setProgress(updatedProgress);
      await AsyncStorage.setItem(TASBIH_STORAGE_KEY, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error("Error saving tasbih progress:", error);
    }
  };

  // Increment the counter
  const incrementCount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCount(prevCount => prevCount + 1);
  };
  
  // Decrement the counter
  const decrementCount = () => {
    if (count > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCount(prevCount => prevCount - 1);
      
      // If we're at the beginning of a new set, decrement the sets count
      if (count % targetCount === 1 && sets > 0) {
        setSets(prev => prev - 1);
      }
    }
  };
  
  // Set custom target
  const saveCustomTarget = () => {
    const numValue = parseInt(customTargetInput);
    if (isNaN(numValue) || numValue <= 0) {
      Alert.alert(
        t('invalidNumber'),
        t('enterPositiveNumber'),
        [{ text: t('ok') }]
      );
      return;
    }
    
    setTargetCount(numValue);
    
    // Save the custom target in progress
    const updatedProgress = {
      ...progress,
      [selectedDhikr.id]: { 
        count: progress[selectedDhikr.id]?.count || 0, 
        sets: progress[selectedDhikr.id]?.sets || 0,
        customTarget: numValue
      }
    };
    setProgress(updatedProgress);
    
    // Reset counter if requested
    if (count > 0) {
      Alert.alert(
        t('resetCounter'),
        t('resetCounterWithNewTarget'),
        [
          { text: t('no') },
          { 
            text: t('yes'), 
            onPress: () => {
              setCount(0);
              setSets(0);
            }
          }
        ]
      );
    }
    
    setCustomTargetModalVisible(false);
  };

  // Reset the counter
  const resetCounter = () => {
    Alert.alert(
      t('resetConfirmation'),
      t('resetConfirmationMessage'),
      [
        {
          text: t('cancel'),
          style: "cancel"
        },
        { 
          text: t('reset'), 
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setCount(0);
            setSets(0);
          }
        }
      ]
    );
  };

  // Select a dhikr
  const selectDhikr = (dhikr) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDhikr(dhikr);
  };

  return (
    <SafeAreaView style={[styles.container, themeStyles.defaultBackgorundColor]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={[
            styles.headerIcon, 
            { backgroundColor: colorScheme === 'dark' ? '#444' : '#e8edf4' }
          ]}>
            <Ionicons 
              name="timer-outline" 
              size={24} 
              color={colorScheme === 'dark' ? '#90cdf4' : '#3b82f6'} 
            />
          </View>
          <Text 
            style={[
              styles.header, 
              { color: colorScheme === 'dark' ? '#fff' : '#1e293b' },
              isRTL && { textAlign: 'right' }
            ]}
          >
            {t('tasbih')}
          </Text>
        </View>

        {/* Dhikr selection */}
        <View style={styles.sectionContainer}>
          <View style={[styles.sectionHeaderRow, isRTL && {flexDirection: 'row-reverse'}]}>
            <Text 
              style={[
                styles.sectionTitle, 
                { color: colorScheme === 'dark' ? '#e2e8f0' : '#334155' },
                isRTL && {textAlign: 'right'}
              ]}
            >
              {t('selectDhikr')}
            </Text>
          </View>

          <FlatList
            data={dhikrPresets}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dhikrContainer}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.dhikrCard,
                  { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff' },
                  selectedDhikr.id === item.id && {
                    borderColor: colorScheme === 'dark' ? '#90cdf4' : '#3b82f6',
                    borderWidth: 2,
                  }
                ]}
                onPress={() => selectDhikr(item)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dhikrArabic,
                  { color: colorScheme === 'dark' ? '#e2e8f0' : '#1e293b' }
                ]}>
                  {item.arabic}
                </Text>
                <Text style={[
                  styles.dhikrTransliteration,
                  { color: colorScheme === 'dark' ? '#e2e8f0' : '#334155' }
                ]}>
                  {item.transliteration}
                </Text>
                <Text style={[
                  styles.dhikrTranslation,
                  { color: colorScheme === 'dark' ? '#94a3b8' : '#64748b' }
                ]}>
                  {item.translation[language] || item.translation.EN}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Tasbih Counter */}
        <View style={styles.counterSection}>
          {/* Sets display */}
          <View style={[
            styles.setsContainer, 
            { backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9' }
          ]}>
            <Text style={[
              styles.setsText,
              { color: colorScheme === 'dark' ? '#cbd5e0' : '#64748b' }
            ]}>
              {t('sets')}
            </Text>
            <Text style={[
              styles.setsCount,
              { color: colorScheme === 'dark' ? '#f8fafc' : '#1e293b' }
            ]}>
              {sets}
            </Text>
          </View>

          {/* Target setting button */}
          <TouchableOpacity
            style={[
              styles.targetButton,
              { backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9' }
            ]}
            onPress={() => {
              setCustomTargetInput(targetCount.toString());
              setCustomTargetModalVisible(true);
            }}
          >
            <Text style={[
              styles.targetButtonText,
              { color: colorScheme === 'dark' ? '#90cdf4' : '#3b82f6' }
            ]}>
              {t('target')}: {targetCount}
            </Text>
            <Ionicons 
              name="settings-outline" 
              size={16} 
              color={colorScheme === 'dark' ? '#90cdf4' : '#3b82f6'} 
            />
          </TouchableOpacity>

          {/* Main counter */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.counterContainer,
              { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff' }
            ]}
            onPress={incrementCount}
            ref={countAreaRef}
          >            
            <Animated.View
              style={[
                styles.countContainer,
                { transform: [{ scale: animationValue }] }
              ]}
            >
              <Text style={[
                styles.countText,
                { color: colorScheme === 'dark' ? '#f8fafc' : '#1e293b' }
              ]}>
                {count}
              </Text>
              <Text style={[
                styles.remainingText,
                { color: colorScheme === 'dark' ? '#90cdf4' : '#3b82f6' }
              ]}>
                {targetCount - (count % targetCount === 0 ? targetCount : count % targetCount)}
              </Text>
            </Animated.View>
            
            <Text style={[
              styles.tapInstructionText,
              { color: colorScheme === 'dark' ? '#94a3b8' : '#64748b' }
            ]}>
              {t('tapToContinue')}
            </Text>
          </TouchableOpacity>

          {/* Control buttons */}
          <View style={styles.controlButtonsContainer}>
            {/* Decrement button */}
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9' }
              ]}
              onPress={decrementCount}
            >
              <Ionicons 
                name="remove-outline" 
                size={24} 
                color={colorScheme === 'dark' ? '#90cdf4' : '#3b82f6'} 
              />
            </TouchableOpacity>

            {/* Reset button */}
            <TouchableOpacity
              style={[
                styles.resetButton,
                { backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9' }
              ]}
              onPress={resetCounter}
            >
              <Text style={[
                styles.resetText,
                { color: colorScheme === 'dark' ? '#fc8181' : '#e53e3e' }
              ]}>
                {t('reset')}
              </Text>
              <Ionicons 
                name="refresh-outline" 
                size={18} 
                color={colorScheme === 'dark' ? '#fc8181' : '#e53e3e'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={[
            styles.instructionsTitle,
            { color: colorScheme === 'dark' ? '#e2e8f0' : '#334155' }
          ]}>
            {t('howToUse')}
          </Text>
          <Text style={[
            styles.instructionsText,
            { color: colorScheme === 'dark' ? '#cbd5e0' : '#64748b' }
          ]}>
            {t('tasbihInstructions')}
          </Text>
        </View>
        {/* Custom Target Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={customTargetModalVisible}
          onRequestClose={() => setCustomTargetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[
              styles.modalContainer,
              { backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff' }
            ]}>
              <Text style={[
                styles.modalTitle,
                { color: colorScheme === 'dark' ? '#f8fafc' : '#1e293b' }
              ]}>
                {t('setCustomTarget')}
              </Text>
              
              <TextInput
                style={[
                  styles.modalInput,
                  { 
                    backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9',
                    color: colorScheme === 'dark' ? '#f8fafc' : '#1e293b',
                    borderColor: colorScheme === 'dark' ? '#4a5568' : '#e2e8f0'
                  }
                ]}
                keyboardType="number-pad"
                value={customTargetInput}
                onChangeText={setCustomTargetInput}
                placeholder={t('enterNumber')}
                placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#64748b'}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colorScheme === 'dark' ? '#2d3748' : '#f1f5f9' }
                  ]}
                  onPress={() => setCustomTargetModalVisible(false)}
                >
                  <Text style={[
                    styles.modalButtonText,
                    { color: colorScheme === 'dark' ? '#94a3b8' : '#64748b' }
                  ]}>
                    {t('cancel')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colorScheme === 'dark' ? '#3b82f6' : '#dbeafe' }
                  ]}
                  onPress={saveCustomTarget}
                >
                  <Text style={[
                    styles.modalButtonText,
                    { color: colorScheme === 'dark' ? '#ffffff' : '#3b82f6' }
                  ]}>
                    {t('save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 6,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
  },
  // Section styles
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  // Dhikr selection
  dhikrContainer: {
    paddingBottom: 8,
    paddingTop: 4,
  },
  dhikrCard: {
    width: width * 0.7,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  dhikrArabic: {
    fontSize: 26,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  dhikrTransliteration: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  dhikrTranslation: {
    fontSize: 14,
    textAlign: 'center',
  },
  // Counter section
  counterSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  setsText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  setsCount: {
    fontSize: 20,
    fontWeight: '700',
  },
  targetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  targetButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  counterContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countContainer: {
    alignItems: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: '700',
  },
  remainingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  tapInstructionText: {
    fontSize: 14,
    position: 'absolute',
    bottom: 40,
  },
  controlButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  controlButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  // Instructions
  instructionsContainer: {
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
  },
});