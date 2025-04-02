//! Basis
// import React, { useState } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';

// export default function App() {
//   // Define different dhikr types with their respective limits
//   const dhikrTypes = [
//     { id: 1, name: 'Subhanallah', arabicText: 'سُبْحَانَ ٱللَّٰهِ', limit: 33, count: 0 },
//     { id: 2, name: 'Alhamdulillah', arabicText: 'ٱلْحَمْدُ لِلَّٰهِ', limit: 33, count: 0 },
//     { id: 3, name: 'Allahu Akbar', arabicText: 'ٱللَّٰهُ أَكْبَرُ', limit: 34, count: 0 },
//     { id: 4, name: 'La ilaha illallah', arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', limit: 100, count: 0 },
//     { id: 5, name: 'Astaghfirullah', arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ', limit: 100, count: 0 }
//   ];

//   const [counters, setCounters] = useState(dhikrTypes);
//   const [activeTab, setActiveTab] = useState(1);
//   const [totalDhikr, setTotalDhikr] = useState(0);

//   // Handle increment for the active dhikr
//   const handleIncrement = (id) => {
//     setCounters(prevCounters =>
//       prevCounters.map(counter => {
//         if (counter.id === id && counter.count < counter.limit) {
//           setTotalDhikr(prev => prev + 1);
//           return { ...counter, count: counter.count + 1 };
//         }
//         return counter;
//       })
//     );
//   };

//   // Reset the active counter
//   const handleReset = (id) => {
//     setCounters(prevCounters =>
//       prevCounters.map(counter => {
//         if (counter.id === id) {
//           setTotalDhikr(prev => prev - counter.count);
//           return { ...counter, count: 0 };
//         }
//         return counter;
//       })
//     );
//   };

//   // Reset all counters
//   const handleResetAll = () => {
//     setCounters(counters.map(counter => ({ ...counter, count: 0 })));
//     setTotalDhikr(0);
//   };

//   // Get the active counter
//   const activeCounter = counters.find(counter => counter.id === activeTab);

//   // Calculate percentage for progress indicator
//   const percentage = activeCounter ? (activeCounter.count / activeCounter.limit) * 100 : 0;

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Tasbih</Text>
//         <Text style={styles.headerSubtitle}>Digital Prayer Counter</Text>
//       </View>

//       {/* Dhikr Selection Tabs */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={styles.tabsContainer}
//         contentContainerStyle={styles.tabsContent}
//       >
//         {counters.map(counter => (
//           <TouchableOpacity
//             key={counter.id}
//             style={[
//               styles.tab,
//               activeTab === counter.id && styles.activeTab
//             ]}
//             onPress={() => setActiveTab(counter.id)}
//           >
//             <Text style={[
//               styles.tabText,
//               activeTab === counter.id && styles.activeTabText
//             ]}>
//               {counter.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Main Counter Card */}
//       {activeCounter && (
//         <View style={styles.counterCard}>
//           {/* Progress Indicator */}
//           <View style={styles.progressContainer}>
//             <View
//               style={[
//                 styles.progressBar,
//                 { width: `${percentage}%` },
//                 percentage >= 100 && styles.progressComplete,
//               ]}
//             />
//           </View>

//           {/* Arabic Text */}
//           <Text style={styles.arabicText}>{activeCounter.arabicText}</Text>

//           {/* Counter Value */}
//           <Text style={styles.counterText}>{activeCounter.count}</Text>

//           {/* Limit Indicator */}
//           <Text style={styles.limitText}>
//             {activeCounter.count}/{activeCounter.limit}
//           </Text>

//           {/* Completion Message */}
//           {activeCounter.count >= activeCounter.limit && (
//             <Text style={styles.completionText}>
//               {activeCounter.name} complete ✓
//             </Text>
//           )}
//         </View>
//       )}

//       {/* Counter Button */}
//       <TouchableOpacity
//         style={[
//           styles.counterButton,
//           activeCounter && activeCounter.count >= activeCounter.limit && styles.disabledButton
//         ]}
//         onPress={() => handleIncrement(activeTab)}
//         activeOpacity={0.8}
//         disabled={activeCounter && activeCounter.count >= activeCounter.limit}
//       >
//         <View style={styles.counterButtonInner}>
//           <Text style={styles.counterButtonText}>Tap to Count</Text>
//         </View>
//       </TouchableOpacity>

//       {/* Control Buttons */}
//       <View style={styles.controlsContainer}>
//         <TouchableOpacity
//           style={styles.resetButton}
//           onPress={() => handleReset(activeTab)}
//         >
//           <Text style={styles.resetButtonText}>Reset Current</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.resetButton, styles.resetAllButton]}
//           onPress={handleResetAll}
//         >
//           <Text style={styles.resetButtonText}>Reset All</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Total Counter */}
//       <View style={styles.totalContainer}>
//         <Text style={styles.totalLabel}>Total Dhikr:</Text>
//         <Text style={styles.totalCount}>{totalDhikr}</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1A3B59',
//   },
//   header: {
//     paddingTop: 20,
//     paddingBottom: 15,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     letterSpacing: 1,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#A3CCE6',
//     marginTop: 5,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     maxHeight: 60,
//     marginVertical: 15,
//   },
//   tabsContent: {
//     paddingHorizontal: 15,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 25,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//   },
//   activeTab: {
//     backgroundColor: '#4A8DB7',
//   },
//   tabText: {
//     color: '#A3CCE6',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   counterCard: {
//     marginHorizontal: 20,
//     marginVertical: 20,
//     padding: 20,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//   },
//   progressContainer: {
//     height: 6,
//     width: '100%',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 3,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#66B3CC',
//     borderRadius: 3,
//   },
//   progressComplete: {
//     backgroundColor: '#66CC8A',
//   },
//   arabicText: {
//     fontSize: 30,
//     color: '#FFFFFF',
//     marginBottom: 15,
//     fontWeight: '300',
//     textAlign: 'center',
//   },
//   counterText: {
//     fontSize: 70,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   limitText: {
//     fontSize: 16,
//     color: '#A3CCE6',
//     marginTop: 10,
//   },
//   completionText: {
//     color: '#66CC8A',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 15,
//   },
//   counterButton: {
//     alignSelf: 'center',
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//     marginVertical: 20,
//   },
//   counterButtonInner: {
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#66B3CC',
//   },
//   counterButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   controlsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 20,
//   },
//   resetButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginHorizontal: 10,
//   },
//   resetAllButton: {
//     backgroundColor: 'rgba(239, 83, 80, 0.2)',
//   },
//   resetButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 30,
//     marginBottom: 20,
//   },
//   totalLabel: {
//     color: '#A3CCE6',
//     fontSize: 16,
//     marginRight: 10,
//   },
//   totalCount: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
// });

// //! Erweitert
// import React, { useState, useEffect } from 'react';
// import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Switch } from 'react-native';

// export default function App() {
//   // Define different dhikr types with their respective limits
//   const dhikrTypes = [
//     { id: 1, name: 'Subhanallah', arabicText: 'سُبْحَانَ ٱللَّٰهِ', limit: 33, count: 0 },
//     { id: 2, name: 'Alhamdulillah', arabicText: 'ٱلْحَمْدُ لِلَّٰهِ', limit: 33, count: 0 },
//     { id: 3, name: 'Allahu Akbar', arabicText: 'ٱللَّٰهُ أَكْبَرُ', limit: 34, count: 0 },
//     { id: 4, name: 'La ilaha illallah', arabicText: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ', limit: 100, count: 0 },
//     { id: 5, name: 'Astaghfirullah', arabicText: 'أَسْتَغْفِرُ ٱللَّٰهَ', limit: 100, count: 0 }
//   ];

//   // Preset sequence definition (34 A, 33 B, 33 C)
//   const presetSequence = [
//     { dhikrId: 3, name: 'Allahu Akbar', count: 34 },    // 34 times "A"
//     { dhikrId: 1, name: 'Subhanallah', count: 33 },     // 33 times "B"
//     { dhikrId: 2, name: 'Alhamdulillah', count: 33 }    // 33 times "C"
//   ];

//   const [counters, setCounters] = useState(dhikrTypes);
//   const [activeTab, setActiveTab] = useState(1);
//   const [totalDhikr, setTotalDhikr] = useState(0);
//   const [isPresetMode, setIsPresetMode] = useState(false);
//   const [currentPresetIndex, setCurrentPresetIndex] = useState(0);
//   const [sequenceCompleted, setSequenceCompleted] = useState(false);

//   // Handle increment for the active dhikr
//   const handleIncrement = (id) => {
//     setCounters(prevCounters =>
//       prevCounters.map(counter => {
//         if (counter.id === id && counter.count < counter.limit) {
//           setTotalDhikr(prev => prev + 1);
//           return { ...counter, count: counter.count + 1 };
//         }
//         return counter;
//       })
//     );
//   };

//   // Handle decrement for the active dhikr
//   const handleDecrement = (id) => {
//     setCounters(prevCounters =>
//       prevCounters.map(counter => {
//         if (counter.id === id && counter.count > 0) {
//           setTotalDhikr(prev => prev - 1);
//           return { ...counter, count: counter.count - 1 };
//         }
//         return counter;
//       })
//     );
//   };

//   // Reset the active counter
//   const handleReset = (id) => {
//     setCounters(prevCounters =>
//       prevCounters.map(counter => {
//         if (counter.id === id) {
//           setTotalDhikr(prev => prev - counter.count);
//           return { ...counter, count: 0 };
//         }
//         return counter;
//       })
//     );
//   };

//   // Reset all counters
//   const handleResetAll = () => {
//     setCounters(counters.map(counter => ({ ...counter, count: 0 })));
//     setTotalDhikr(0);
//     setCurrentPresetIndex(0);
//     setSequenceCompleted(false);
//   };

//   // Toggle between preset mode and free mode
//   const toggleMode = () => {
//     setIsPresetMode(prev => !prev);
//     // Reset when switching modes
//     handleResetAll();
//   };

//   // Get the active counter
//   const activeCounter = counters.find(counter => counter.id === activeTab);

//   // Calculate percentage for progress indicator
//   const percentage = activeCounter ? (activeCounter.count / activeCounter.limit) * 100 : 0;

//   // Effect to handle preset sequence progression
//   useEffect(() => {
//     if (isPresetMode && !sequenceCompleted) {
//       const currentPreset = presetSequence[currentPresetIndex];
//       const currentCounter = counters.find(c => c.id === currentPreset.dhikrId);

//       // Check if current dhikr in sequence is complete
//       if (currentCounter && currentCounter.count >= currentPreset.count) {
//         // Move to next dhikr in sequence
//         if (currentPresetIndex < presetSequence.length - 1) {
//           setCurrentPresetIndex(prev => prev + 1);
//           // Set the active tab to the next dhikr in sequence
//           setActiveTab(presetSequence[currentPresetIndex + 1].dhikrId);
//         } else {
//           // Sequence completed
//           setSequenceCompleted(true);
//         }
//       }

//       // Always set active tab to current preset dhikr
//       if (!sequenceCompleted) {
//         setActiveTab(currentPreset.dhikrId);
//       }
//     }
//   }, [counters, currentPresetIndex, isPresetMode, sequenceCompleted]);

//   // Function to render preset sequence progress
//   const renderPresetProgress = () => {
//     if (!isPresetMode) return null;

//     return (
//       <View style={styles.presetProgressContainer}>
//         {presetSequence.map((item, index) => {
//           const isActive = index === currentPresetIndex;
//           const isCompleted = index < currentPresetIndex || sequenceCompleted;

//           return (
//             <View
//               key={index}
//               style={[
//                 styles.presetProgressItem,
//                 isActive && styles.presetProgressItemActive,
//                 isCompleted && styles.presetProgressItemCompleted
//               ]}
//             >
//               <Text style={styles.presetProgressText}>
//                 {item.count}x {item.name.charAt(0)}
//               </Text>
//             </View>
//           );
//         })}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Tasbih</Text>
//         <Text style={styles.headerSubtitle}>Digital Prayer Counter</Text>
//       </View>

//       {/* Mode Toggle */}
//       <View style={styles.modeToggleContainer}>
//         <Text style={[styles.modeText, !isPresetMode && styles.activeModeText]}>Free Mode</Text>
//         <Switch
//           value={isPresetMode}
//           onValueChange={toggleMode}
//           thumbColor={isPresetMode ? '#66B3CC' : '#FFFFFF'}
//           trackColor={{ false: 'rgba(255,255,255,0.3)', true: 'rgba(102,179,204,0.5)' }}
//         />
//         <Text style={[styles.modeText, isPresetMode && styles.activeModeText]}>Preset Mode</Text>
//       </View>

//       {/* Preset Progress Indicator */}
//       {renderPresetProgress()}

//       {/* Dhikr Selection Tabs - Only show in free mode or if sequence completed */}
//       {(!isPresetMode || sequenceCompleted) && (
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={styles.tabsContainer}
//           contentContainerStyle={styles.tabsContent}
//         >
//           {counters.map(counter => (
//             <TouchableOpacity
//               key={counter.id}
//               style={[
//                 styles.tab,
//                 activeTab === counter.id && styles.activeTab
//               ]}
//               onPress={() => setActiveTab(counter.id)}
//               disabled={isPresetMode && !sequenceCompleted}
//             >
//               <Text style={[
//                 styles.tabText,
//                 activeTab === counter.id && styles.activeTabText
//               ]}>
//                 {counter.name}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       )}

//       {/* Main Counter Card */}
//       {activeCounter && (
//         <View style={styles.counterCard}>
//           {/* Progress Indicator */}
//           <View style={styles.progressContainer}>
//             <View
//               style={[
//                 styles.progressBar,
//                 { width: `${percentage}%` },
//                 percentage >= 100 && styles.progressComplete,
//               ]}
//             />
//           </View>

//           {/* Arabic Text */}
//           <Text style={styles.arabicText}>{activeCounter.arabicText}</Text>

//           {/* Counter Value */}
//           <Text style={styles.counterText}>{activeCounter.count}</Text>

//           {/* Limit Indicator */}
//           <Text style={styles.limitText}>
//             {isPresetMode && !sequenceCompleted
//               ? `${activeCounter.count}/${presetSequence[currentPresetIndex].count}`
//               : `${activeCounter.count}/${activeCounter.limit}`
//             }
//           </Text>

//           {/* Completion Message */}
//           {isPresetMode && sequenceCompleted && (
//             <Text style={styles.completionText}>
//               Full sequence completed ✓
//             </Text>
//           )}
//           {!isPresetMode && activeCounter.count >= activeCounter.limit && (
//             <Text style={styles.completionText}>
//               {activeCounter.name} complete ✓
//             </Text>
//           )}
//         </View>
//       )}

//       {/* Counter Buttons */}
//       <View style={styles.countButtonsContainer}>
//         {/* Decrement Button - NEW */}
//         <TouchableOpacity
//           style={styles.decrementButton}
//           onPress={() => handleDecrement(activeTab)}
//           activeOpacity={0.8}
//           disabled={(activeCounter && activeCounter.count <= 0) || (isPresetMode && sequenceCompleted)}
//         >
//           <Text style={styles.decrementButtonText}>-</Text>
//         </TouchableOpacity>

//         {/* Main Counter Button */}
//         <TouchableOpacity
//           style={[
//             styles.counterButton,
//             ((activeCounter && activeCounter.count >= activeCounter.limit) ||
//              (isPresetMode && sequenceCompleted)) && styles.disabledButton
//           ]}
//           onPress={() => handleIncrement(activeTab)}
//           activeOpacity={0.8}
//           disabled={(activeCounter && activeCounter.count >= activeCounter.limit) ||
//                    (isPresetMode && sequenceCompleted)}
//         >
//           <View style={styles.counterButtonInner}>
//             <Text style={styles.counterButtonText}>Tap to Count</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Control Buttons */}
//       <View style={styles.controlsContainer}>
//         <TouchableOpacity
//           style={styles.resetButton}
//           onPress={() => handleReset(activeTab)}
//           disabled={isPresetMode && !sequenceCompleted}
//         >
//           <Text style={styles.resetButtonText}>Reset Current</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.resetButton, styles.resetAllButton]}
//           onPress={handleResetAll}
//         >
//           <Text style={styles.resetButtonText}>Reset All</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Total Counter */}
//       <View style={styles.totalContainer}>
//         <Text style={styles.totalLabel}>Total Dhikr:</Text>
//         <Text style={styles.totalCount}>{totalDhikr}</Text>
//       </View>

//       {/* Mode Instructions */}
//       {isPresetMode && !sequenceCompleted && (
//         <View style={styles.instructionsContainer}>
//           <Text style={styles.instructionsText}>
//             Preset Sequence: Complete each dhikr to progress
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1A3B59',
//   },
//   header: {
//     paddingTop: 20,
//     paddingBottom: 15,
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(255,255,255,0.1)',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     letterSpacing: 1,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#A3CCE6',
//     marginTop: 5,
//   },
//   modeToggleContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 10,
//     marginTop: 5,
//   },
//   modeText: {
//     color: 'rgba(255,255,255,0.6)',
//     fontSize: 14,
//     marginHorizontal: 10,
//   },
//   activeModeText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   presetProgressContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginVertical: 10,
//     paddingHorizontal: 20,
//   },
//   presetProgressItem: {
//     flex: 1,
//     padding: 8,
//     marginHorizontal: 5,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   presetProgressItemActive: {
//     backgroundColor: 'rgba(102,179,204,0.5)',
//     borderWidth: 1,
//     borderColor: '#66B3CC',
//   },
//   presetProgressItemCompleted: {
//     backgroundColor: 'rgba(102,204,138,0.5)',
//     borderWidth: 1,
//     borderColor: '#66CC8A',
//   },
//   presetProgressText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     maxHeight: 60,
//     marginVertical: 15,
//   },
//   tabsContent: {
//     paddingHorizontal: 15,
//   },
//   tab: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     marginHorizontal: 5,
//     borderRadius: 25,
//     backgroundColor: 'rgba(255,255,255,0.1)',
//   },
//   activeTab: {
//     backgroundColor: '#4A8DB7',
//   },
//   tabText: {
//     color: '#A3CCE6',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   activeTabText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },
//   counterCard: {
//     marginHorizontal: 20,
//     marginVertical: 15,
//     padding: 20,
//     backgroundColor: 'rgba(255,255,255,0.05)',
//     borderRadius: 20,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.1)',
//   },
//   progressContainer: {
//     height: 6,
//     width: '100%',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderRadius: 3,
//     marginBottom: 20,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#66B3CC',
//     borderRadius: 3,
//   },
//   progressComplete: {
//     backgroundColor: '#66CC8A',
//   },
//   arabicText: {
//     fontSize: 30,
//     color: '#FFFFFF',
//     marginBottom: 15,
//     fontWeight: '300',
//     textAlign: 'center',
//   },
//   counterText: {
//     fontSize: 70,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//   },
//   limitText: {
//     fontSize: 16,
//     color: '#A3CCE6',
//     marginTop: 10,
//   },
//   completionText: {
//     color: '#66CC8A',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 15,
//   },
//   countButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 15,
//   },
//   counterButton: {
//     width: 160,
//     height: 160,
//     borderRadius: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   counterButtonInner: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#66B3CC',
//   },
//   counterButtonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   decrementButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(239, 83, 80, 0.3)',
//     borderWidth: 1,
//     borderColor: 'rgba(239, 83, 80, 0.5)',
//     marginRight: 20,
//   },
//   decrementButtonText: {
//     color: '#FFFFFF',
//     fontSize: 30,
//     fontWeight: 'bold',
//   },
//   disabledButton: {
//     opacity: 0.5,
//   },
//   controlsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginTop: 15,
//   },
//   resetButton: {
//     backgroundColor: 'rgba(255,255,255,0.1)',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     marginHorizontal: 10,
//   },
//   resetAllButton: {
//     backgroundColor: 'rgba(239, 83, 80, 0.2)',
//   },
//   resetButtonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 25,
//     marginBottom: 20,
//   },
//   totalLabel: {
//     color: '#A3CCE6',
//     fontSize: 16,
//     marginRight: 10,
//   },
//   totalCount: {
//     color: '#FFFFFF',
//     fontSize: 22,
//     fontWeight: 'bold',
//   },
//   instructionsContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//     paddingHorizontal: 20,
//   },
//   instructionsText: {
//     color: 'rgba(255,255,255,0.7)',
//     fontSize: 14,
//     textAlign: 'center',
//   },
// });

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
      style={[styles.container, { backgroundColor: Colors.universal.primary }]}
      edges={["top"]}
    >
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
    </SafeAreaView>
  );
}

// --- Styles (Minor adjustments and additions) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 10,
  },
  headerContainer: {
    backgroundColor: "red",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  cardsContainer: {
  },

  cardsContent: {
    flex: 1,
    backgroundColor: "blue"

  },
  prayerCard: {
    width: 170, 
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    padding: 12, 
    marginHorizontal: 8, 
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "space-between", // Distribute content vertically
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
    flex: 1,
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
    minHeight: 200, // Minimum height
  },
  progressContainer: {
    position: "absolute", // Position progress bar at the top
    top: 0,
    left: 0,
    right: 0,
    height: 8, // Thicker bar
    backgroundColor: "rgba(255,255,255,0.1)",
    borderTopLeftRadius: 20, // Match card radius
    borderTopRightRadius: 20,
    overflow: "hidden",
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
    paddingHorizontal: 20, // Padding on sides
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
