import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from 'react-native-elements';

const CategoryButton = ({ title, icon, isActive, onPress, backgroundColor, iconBackground }) => (
  <TouchableOpacity 
    style={[
      styles.categoryItem, 
      { backgroundColor: backgroundColor || '#ab9abb' },
      isActive && styles.selectedCategory
    ]} 
    onPress={onPress}
  >
    <View style={[
      styles.categoryIcon, 
      { backgroundColor: iconBackground || backgroundColor || '#ab9abb' }
    ]}>
      <Icon name={icon} type="material-community" color={isActive ? '#fff' : backgroundColor} size={24} />
    </View>
    <Text style={styles.categoryText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 25,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: '#8e74ae',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CategoryButton; 