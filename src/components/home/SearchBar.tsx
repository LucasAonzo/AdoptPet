import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  /**
   * Current search text value
   */
  searchText: string;
  
  /**
   * Callback function when search text changes
   */
  onSearchChange: (text: string) => void;
}

interface Styles {
  searchContainer: ViewStyle;
  searchInputContainer: ViewStyle;
  searchInput: TextStyle;
  searchButton: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchText, onSearchChange }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          placeholder="Search..."
          style={styles.searchInput}
          value={searchText}
          onChangeText={onSearchChange}
        />
      </View>
      <TouchableOpacity style={styles.searchButton}>
        <Ionicons name="search" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    marginRight: 10,
    justifyContent: 'center',
  },
  searchInput: {
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8e74ae',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar; 