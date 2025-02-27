import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import CategoryButton from '../categories/CategoryButton';

const CategoriesSection = ({ categories, selectedCategory, onCategoryPress }) => {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pet Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>More Category</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            title={category.name}
            icon={category.icon}
            isActive={selectedCategory === category.id}
            onPress={() => onCategoryPress(category.id)}
            backgroundColor={category.backgroundColor}
            iconBackground={category.iconBackground}
          />
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#8e74ae',
  },
  categoriesContainer: {
    paddingLeft: 15,
    marginBottom: 25,
  },
});

export default CategoriesSection; 