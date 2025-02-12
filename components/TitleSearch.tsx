// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   TextInput,
//   FlatList,
//   Pressable,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import { ThemedText } from '@/components/ThemedText';
// import { searchQuestions } from '@/components/initializeDatabase';
// import Feather from '@expo/vector-icons/Feather';

// interface TitleSearchInputProps {
//   /**
//    * The CSV string stored in your form field (e.g., "Title1, Title2")
//    * This is for submitting or editing in your form.
//    */
//   value: string;
//   /**
//    * React Hook Form's onChange method. We'll call this with our new CSV string
//    * whenever items are added or removed.
//    */
//   onChangeText: (text: string) => void;

//   style?: any;
//   themeStyles: any;
// }

// interface SelectedItem {
//   title: string;
//   category_name: string;
//   subcategory_name: string;
// }

// const DEBOUNCE_DELAY = 300;

// export const TitleSearchInput = ({
//   value,        // CSV from the form
//   onChangeText, // updates the form's CSV
//   style,
//   themeStyles,
// }: TitleSearchInputProps) => {
//   const [searchText, setSearchText] = useState('');         // local text for searching
//   const [searchResults, setSearchResults] = useState<SelectedItem[]>([]);
//   const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [loading, setLoading] = useState(false);

//   // When the component mounts, parse the initial CSV (if any) into "selectedItems"
//   // This is helpful if you are editing existing data.
//   useEffect(() => {
//     if (value) {
//       const titles = value.split(',').map((t) => t.trim()).filter(Boolean);
//       // If you need more data (like category_name), you'd have to fetch those
//       // or store them separately. For now, let's just store the title in selectedItems.
//       const initialItems = titles.map((title) => ({
//         title,
//         category_name: '',
//         subcategory_name: '',
//       }));
//       setSelectedItems(initialItems);
//     }
//   }, [value]);

//   // Debounced search function
//   const searchTitles = useCallback(async (query: string) => {
//     if (!query.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     setLoading(true);
//     try {
//       const results = await searchQuestions(query);
//       const formattedResults = results.map((item: any) => ({
//         title: item.title,
//         category_name: item.category_name,
//         subcategory_name: item.subcategory_name,
//       }));
//       setSearchResults(formattedResults);
//     } catch (error) {
//       console.error('Error searching titles:', error);
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Trigger debounced search whenever "searchText" changes
//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       searchTitles(searchText);
//     }, DEBOUNCE_DELAY);

//     return () => clearTimeout(timeoutId);
//   }, [searchText, searchTitles]);

//   /**
//    * Handle selecting a suggestion
//    */
//   const handleSelectSuggestion = (selectedItem: SelectedItem) => {
//     // If already selected, ignore
//     if (selectedItems.some((item) => item.title === selectedItem.title)) {
//       setShowSuggestions(false);
//       return;
//     }

//     const newSelected = [...selectedItems, selectedItem];
//     setSelectedItems(newSelected);

//     // Build a CSV from selected item titles
//     const csv = newSelected.map((item) => item.title).join(', ');
//     onChangeText(csv); // update form field

//     // Clear the local search text so user can type another query
//     setSearchText('');
//     setShowSuggestions(false);
//   };

//   /**
//    * Handle deleting a selected item
//    */
//   const handleDeleteItem = (itemToDelete: SelectedItem) => {
//     const newSelected = selectedItems.filter(
//       (item) => item.title !== itemToDelete.title
//     );
//     setSelectedItems(newSelected);

//     // Build a CSV from selected item titles
//     const csv = newSelected.map((item) => item.title).join(', ');
//     onChangeText(csv); // update form field
//   };

//   /**
//    * Render each "selected item" chip
//    */
//   const renderSelectedItem = ({ item }: { item: SelectedItem }) => (
//     <View style={[styles.selectedItemContainer, themeStyles.contrast]}>
//       <View style={styles.selectedItemContent}>
//         <ThemedText style={styles.titleText}>{item.title}</ThemedText>
//         {Boolean(item.category_name) && (
//           <ThemedText style={styles.categoryText}>
//             {item.category_name} {'>'} {item.subcategory_name}
//           </ThemedText>
//         )}
//       </View>

//       <Pressable onPress={() => handleDeleteItem(item)} style={styles.deleteButton}>
//         <Feather name="trash-2" size={24} color="black" />
//       </Pressable>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {/**
//        * The TextInput is now bound to "searchText"
//        * so we can clear it without losing the CSV stored in the form.
//        */}
//       <TextInput
//         style={[styles.input, style, themeStyles.text]}
//         value={searchText}
//         onChangeText={(text) => {
//           setSearchText(text);
//           setShowSuggestions(true);
//         }}
//         onFocus={() => setShowSuggestions(true)}
//         placeholder="Tippe einen Titel, um zu suchen..."
//         placeholderTextColor="{Colors.universal.fadeColor
//       />

//       {/* SUGGESTIONS LIST */}
//       {loading && showSuggestions && (
//         <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
//           <ActivityIndicator size="small" color="{Colors.universal.fadeColor />
//         </View>
//       )}

//       {!loading && showSuggestions && searchResults.length > 0 && (
//         <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
//           <FlatList
//             data={searchResults}
//             keyExtractor={(item) => item.title}
//             renderItem={({ item }) => (
//               <Pressable
//                 style={styles.suggestionItem}
//                 onPress={() => handleSelectSuggestion(item)}
//               >
//                 <ThemedText style={styles.titleText}>{item.title}</ThemedText>
//                 {Boolean(item.category_name) && (
//                   <ThemedText style={styles.categoryText}>
//                     {item.category_name} {'>'} {item.subcategory_name}
//                   </ThemedText>
//                 )}
//               </Pressable>
//             )}
//             scrollEnabled={searchResults.length > 3}
//             keyboardShouldPersistTaps="handled"
//           />
//         </View>
//       )}

//       {!loading && showSuggestions && searchText && searchResults.length === 0 && (
//         <View style={[styles.suggestionsContainer, themeStyles.contrast]}>
//           <ThemedText style={styles.noResults}>
//             Keine passenden Titel gefunden
//           </ThemedText>
//         </View>
//       )}

//       {/** SELECTED ITEMS (CHIPS) */}
//       {selectedItems.length > 0 && (
//         <FlatList
//           data={selectedItems}
//           renderItem={renderSelectedItem}
//           keyExtractor={(item) => item.title}
//           style={styles.selectedItemsList}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'relative',
//     zIndex: 1,
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 10,
//     fontSize: 16,
//   },
//   suggestionsContainer: {
//     position: 'absolute',
//     top: '100%',
//     left: 0,
//     right: 0,
//     borderWidth: 1,
//     borderRadius: 8,
//     maxHeight: 200,
//     zIndex: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   suggestionItem: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   titleText: {
//     fontSize: 16,
//     marginBottom: 4,
//   },
//   categoryText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   noResults: {
//     padding: 12,
//     textAlign: 'center',
//     color: '#888',
//   },
//   selectedItemsList: {
//     marginTop: 10,
//   },
//   selectedItemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   selectedItemContent: {
//     flex: 1,
//   },
//   deleteButton: {
//     padding: 8,
//   },
// });

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { searchQuestions } from "@/utils/initializeDatabase";
import Feather from "@expo/vector-icons/Feather";
import { Colors } from "@/constants/Colors";

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
  themeStyles,
}: TitleSearchInputProps) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SelectedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (value) {
      const titles = value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const initialItems = titles.map((title) => ({
        title,
        category_name: "",
        subcategory_name: "",
      }));
      setSelectedItems(initialItems);
    }
  }, [value]);

  const searchTitles = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchQuestions(query);
      const formattedResults = results.map((item: any) => ({
        title: item.title,
        category_name: item.category_name,
        subcategory_name: item.subcategory_name,
      }));
      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Error searching titles:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchTitles(searchText);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [searchText, searchTitles]);

  const handleSelectSuggestion = (selectedItem: SelectedItem) => {
    if (selectedItems.some((item) => item.title === selectedItem.title)) {
      return;
    }

    const newSelected = [...selectedItems, selectedItem];
    setSelectedItems(newSelected);
    const csv = newSelected.map((item) => item.title).join(", ");
    onChangeText(csv);
    setSearchText("");
    setModalVisible(false);
  };

  const handleDeleteItem = (itemToDelete: SelectedItem) => {
    const newSelected = selectedItems.filter(
      (item) => item.title !== itemToDelete.title
    );
    setSelectedItems(newSelected);
    const csv = newSelected.map((item) => item.title).join(", ");
    onChangeText(csv);
  };

  const renderSelectedItem = ({ item }: { item: SelectedItem }) => (
    <View style={[styles.selectedItemContainer, themeStyles.contrast]}>
      <View style={styles.selectedItemContent}>
        <ThemedText style={styles.titleText}>{item.title}</ThemedText>
        {Boolean(item.category_name) && (
          <ThemedText style={styles.categoryText}>
            {item.category_name} {">"} {item.subcategory_name}
          </ThemedText>
        )}
      </View>
      <Pressable
        onPress={() => handleDeleteItem(item)}
        style={styles.deleteButton}
      >
        <Feather name="trash-2" size={24} color={colorScheme === "dark" ? "#fff" : "#000"} />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[styles.input, style]}
      >
        <ThemedText style={themeStyles.text}>
          {selectedItems.length > 0
            ? selectedItems.map((item) => item.title).join(", ")
            : "Wähle die Fragen aus"}
        </ThemedText>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, themeStyles.contrast]}>
            <TextInput
              style={[styles.input, themeStyles.text]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Suche nach einem Title"
              placeholderTextColor={Colors.universal.fadeColor}
            />
            {loading && <ActivityIndicator size="small" color={Colors.universal.fadeColor} />}
            {!loading && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.title}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.suggestionItem}
                    onPress={() => handleSelectSuggestion(item)}
                  >
                    <ThemedText style={styles.titleText}>
                      {item.title}
                    </ThemedText>
                    {Boolean(item.category_name) && (
                      <ThemedText style={styles.categoryText}>
                        {item.category_name} {">"} {item.subcategory_name}
                      </ThemedText>
                    )}
                  </Pressable>
                )}
                keyboardShouldPersistTaps="handled"
              />
            )}
            {!loading && searchText && searchResults.length === 0 && (
              <ThemedText style={styles.noResults}>
                No matching titles found
              </ThemedText>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <ThemedText style={{color: Colors.universal.link}}>Schließen</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    position: "relative",
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "80%",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titleText: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
  },
  noResults: {
    padding: 12,
    textAlign: "center",
    color: Colors.universal.fadeColor,
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    alignItems: "center",
  },
  selectedItemsList: {
    marginTop: 20,
  },
  selectedItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedItemContent: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
});
