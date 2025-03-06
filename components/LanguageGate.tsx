// src/components/LanguageGate.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelectionScreen from './LanguageSelectionScreen';
interface LanguageGateProps {
  children: React.ReactNode;
}

const LanguageGate: React.FC<LanguageGateProps> = ({ children }) => {
  const { isFirstLaunch, isLoading } = useLanguage();

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  // If it's the first launch, display the language selection screen.
  return isFirstLaunch ? <LanguageSelectionScreen /> : <>{children}</>;
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageGate;
