import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ searchText, onSearchChange }) => {
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

const styles = StyleSheet.create({
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