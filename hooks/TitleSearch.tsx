import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { searchQuestions } from '@/components/initializeDatabase';
import Feather from '@expo/vector-icons/Feather';
interface TitleSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  themeStyles: any;
}

interface SelectedItem {
  title: string;
  category_name: string;
  subcategory_name: string;
}

const DEBOUNCE_DELAY = 300;

export const TitleSearchInput = ({ 
  value, 
  onChangeText, 
  style, 
  themeStyles 
}: TitleSearchInputProps) => {
  const [searchResults, setSearchResults] = useState<Array<SelectedItem>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<SelectedItem>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Debounced search function
  const searchTitles = useCallback(async (searchText: string) => {
    if (!searchText.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchQuestions(searchText);
      const formattedResults = results.map(item => ({
        title: item.title,
        category_name: item.category_name,
        subcategory_name: item.subcategory_name
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Error searching titles:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTitles(value);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [value, searchTitles]);

  const handleSelectSuggestion = (selectedItem: SelectedItem) => {
    if (!selectedItems.some(item => item.title === selectedItem.title)) {
      setSelectedItems([...selectedItems, selectedItem]);
    }
    onChangeText('');
    setShowSuggestions(false);
  };

  const handleDeleteItem = (itemToDelete: SelectedItem) => {
    setSelectedItems(selectedItems.filter(item => item.title !== itemToDelete.title));
  };

  const renderSelectedItem = ({ item }: { item: SelectedItem }) => (
    <View style={[styles.selectedItemContainer, themeStyles.contrast]}>
      <View style={styles.selectedItemContent}>
        <ThemedText style={styles.titleText}>{item.title}</ThemedText>
        <ThemedText style={styles.categoryText}>
          {item.category_name} {">"} {item.subcategory_name}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => handleDeleteItem(item)}
        style={styles.deleteButton}
      >
       <Feather name="trash-2" size={24} color="black" />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, style, themeStyles.text]}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Gib den vollständingen Titel eine Frage an"
        placeholderTextColor="#888"
      />
      
      {loading && showSuggestions && (
        <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
          <ActivityIndicator size="small" color="#888" />
        </View>
      )}

      {!loading && showSuggestions && searchResults.length > 0 && (
        <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.title}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                <ThemedText style={styles.titleText}>{item.title}</ThemedText>
                <ThemedText style={styles.categoryText}>
                  {item.category_name} {">"} {item.subcategory_name}
                </ThemedText>
              </Pressable>
            )}
            scrollEnabled={searchResults.length > 3}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          />
        </View>
      )}

      {!loading && showSuggestions && value && searchResults.length === 0 && (
        <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
          <ThemedText style={styles.noResults}>
            Keine passenden Titel gefunden
          </ThemedText>
        </View>
      )}

      {selectedItems.length > 0 && (
        <FlatList
          data={selectedItems}
          renderItem={renderSelectedItem}
          keyExtractor={(item) => item.title}
          style={styles.selectedItemsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleText: {
    fontSize: 16,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  noResults: {
    padding: 12,
    textAlign: 'center',
    color: '#888',
  },
  selectedItemsList: {
    marginTop: 10,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedItemContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
});