import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput,
  Vibration,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert
} from 'react-native';

export default function App() {
  const [count, setCount] = useState(0);
  const [maxCount, setMaxCount] = useState(33);
  const [tempMaxCount, setTempMaxCount] = useState('33');
  const [sound, setSound] = useState();





  // Function to increment counter
  const incrementCounter = () => {
    if (count < maxCount) {
      setCount(count + 1);
      Vibration.vibrate(20); // Short vibration for feedback
     
      
      // Alert when max count is reached
      if (count + 1 === maxCount) {
        Alert.alert('Maximum Count Reached', 'You have reached your target count!');
        Vibration.vibrate([100, 200, 100]); // Pattern vibration for max count
      }
    }
  };

  // Function to decrement counter
  const decrementCounter = () => {
    if (count > 0) {
      setCount(count - 1);
      Vibration.vibrate(10); // Shorter vibration for decrement
    }
  };

  // Function to reset counter
  const resetCounter = () => {
    Alert.alert(
      'Reset Counter',
      'Are you sure you want to reset the counter?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => setCount(0),
          style: 'destructive',
        },
      ]
    );
  };

  // Function to set max count
  const updateMaxCount = () => {
    const newMaxCount = parseInt(tempMaxCount);
    if (isNaN(newMaxCount) || newMaxCount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid positive number');
      return;
    }
    setMaxCount(newMaxCount);
    
    // If current count is greater than new max, reset count
    if (count > newMaxCount) {
      Alert.alert(
        'Count Adjusted',
        'Current count was greater than new maximum and has been reset.'
      );
      setCount(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Tasbih Counter</Text>
      </View>
      
      {/* Counter Display */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{count}</Text>
        <Text style={styles.maxCountText}>of {maxCount}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${(count / maxCount) * 100}%` }
            ]} 
          />
        </View>
      </View>
      
      {/* Main Tap Area */}
      <TouchableOpacity 
        style={styles.tapArea} 
        onPress={incrementCounter}
        activeOpacity={0.7}
      >
        <Text style={styles.tapText}>Tap to Count</Text>
      </TouchableOpacity>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={decrementCounter}
        >
          <Text style={styles.controlButtonText}>-1</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.resetButton]} 
          onPress={resetCounter}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {/* Max Count Setting */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsLabel}>Set Maximum Count:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={tempMaxCount}
            onChangeText={setTempMaxCount}
            maxLength={5}
          />
          <TouchableOpacity 
            style={styles.setButton} 
            onPress={updateMaxCount}
          >
            <Text style={styles.setButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1e2e',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#39364f',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  counterText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  maxCountText: {
    fontSize: 18,
    color: '#a9a9c1',
    marginTop: 10,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#39364f',
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#7f5af0',
  },
  tapArea: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: '#7f5af0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 30,
    elevation: 5,
    shadowColor: '#7f5af0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  controlButton: {
    backgroundColor: '#2e2c3d',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#47424f',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  settingsContainer: {
    padding: 20,
  },
  settingsLabel: {
    fontSize: 16,
    color: '#a9a9c1',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2e2c3d',
    padding: 12,
    borderRadius: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  setButton: {
    backgroundColor: '#7f5af0',
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
  },
  setButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});