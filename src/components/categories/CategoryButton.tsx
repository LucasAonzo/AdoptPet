import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Icon } from 'react-native-elements';

interface CategoryButtonProps {
  /**
   * Title of the category
   */
  title: string;
  
  /**
   * Icon name from material-community icon set
   */
  icon: string;
  
  /**
   * Whether the category is currently active/selected
   */
  isActive?: boolean;
  
  /**
   * Callback function when the button is pressed
   */
  onPress: () => void;
  
  /**
   * Background color of the button
   */
  backgroundColor?: string;
  
  /**
   * Background color of the icon container
   */
  iconBackground?: string;
}

interface Styles {
  categoryItem: ViewStyle;
  selectedCategory: ViewStyle;
  categoryIcon: ViewStyle;
  categoryText: TextStyle;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({ 
  title, 
  icon, 
  isActive = false, 
  onPress, 
  backgroundColor, 
  iconBackground 
}) => {
  // Determine the appropriate icon color
  const getIconColor = (): string => {
    if (isActive) return '#fff'; // White when active
    
    // For non-active state, use white if iconBackground is close to backgroundColor
    // or use backgroundColor if they're different enough
    if (iconBackground === backgroundColor || !iconBackground) {
      return '#fff';
    }
    
    return backgroundColor || '#ab9abb';
  };
  
  return (
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
        <Icon name={icon} type="material-community" color={getIconColor()} size={24} />
      </View>
      <Text style={styles.categoryText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create<Styles>({
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