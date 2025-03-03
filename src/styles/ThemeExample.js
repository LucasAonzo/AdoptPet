import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme, componentStyles } from './index';

/**
 * Example component showing how to use the theme system
 * This is a reference file and not meant to be used directly in the app
 */
const ThemeExample = () => {
  return (
    <SafeAreaView style={componentStyles.safeAreaContainer}>
      <ScrollView 
        contentContainerStyle={componentStyles.scrollViewContent}
        style={styles.container}
      >
        <View style={styles.section}>
          <Text style={componentStyles.heading1}>Theme System</Text>
          <Text style={componentStyles.bodyText}>
            This is an example of how to use the theme system in components.
          </Text>
        </View>

        {/* Typography Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Typography</Text>
          
          <Text style={componentStyles.heading1}>Heading 1</Text>
          <Text style={componentStyles.heading2}>Heading 2</Text>
          <Text style={componentStyles.heading3}>Heading 3</Text>
          <Text style={componentStyles.heading4}>Heading 4</Text>
          <Text style={componentStyles.heading5}>Heading 5</Text>
          
          <Text style={componentStyles.bodyText}>
            This is body text that wraps to multiple lines. It uses the standard font size and color
            from our theme.
          </Text>
          
          <Text style={componentStyles.bodyTextBold}>This is bold body text.</Text>
          
          <Text style={componentStyles.caption}>
            This is caption text, used for smaller labels and descriptions.
          </Text>
          
          <Text style={componentStyles.smallText}>
            This is small text, used for very small annotations.
          </Text>
        </View>

        {/* Color Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Colors</Text>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary.main }]}>
              <Text style={styles.colorLabel}>Primary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary.light }]}>
              <Text style={styles.colorLabel}>Primary Light</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary.dark }]}>
              <Text style={styles.colorLabel}>Primary Dark</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary.main }]}>
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.accent.teal }]}>
              <Text style={styles.colorLabel}>Accent Teal</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.accent.lightBlue }]}>
              <Text style={styles.colorLabel}>Accent Blue</Text>
            </View>
          </View>
          
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.success.main }]}>
              <Text style={[styles.colorLabel, { color: '#fff' }]}>Success</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.warning.main }]}>
              <Text style={[styles.colorLabel, { color: '#fff' }]}>Warning</Text>
            </View>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.error.main }]}>
              <Text style={[styles.colorLabel, { color: '#fff' }]}>Error</Text>
            </View>
          </View>
        </View>

        {/* Card Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Cards</Text>
          
          <View style={componentStyles.card}>
            <View style={componentStyles.cardHeader}>
              <Text style={componentStyles.cardTitle}>Basic Card</Text>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.primary} />
            </View>
            <Text style={componentStyles.bodyText}>
              This is a basic card component using our theme system.
            </Text>
          </View>
          
          <View style={componentStyles.cardElevated}>
            <View style={componentStyles.cardHeader}>
              <Text style={componentStyles.cardTitle}>Elevated Card</Text>
              <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.primary} />
            </View>
            <Text style={componentStyles.bodyText}>
              This card has elevated shadow for more prominence.
            </Text>
            <View style={componentStyles.cardFooter}>
              <TouchableOpacity>
                <Text style={{ color: theme.colors.primary.main }}>Action</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Button Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Buttons</Text>
          
          <TouchableOpacity style={componentStyles.buttonPrimary}>
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={theme.colors.text.light} 
              style={{ marginRight: theme.spacing.sm }}
            />
            <Text style={componentStyles.buttonText}>Primary Button</Text>
          </TouchableOpacity>
          
          <View style={{ height: theme.spacing.md }} />
          
          <TouchableOpacity style={componentStyles.buttonSecondary}>
            <Text style={componentStyles.buttonTextSecondary}>Secondary Button</Text>
          </TouchableOpacity>
          
          <View style={{ height: theme.spacing.md }} />
          
          <TouchableOpacity style={componentStyles.buttonOutline}>
            <Text style={componentStyles.buttonTextSecondary}>Outline Button</Text>
          </TouchableOpacity>
          
          <View style={{ height: theme.spacing.md }} />
          
          <TouchableOpacity style={componentStyles.buttonDisabled} disabled>
            <Text style={componentStyles.buttonTextDisabled}>Disabled Button</Text>
          </TouchableOpacity>
        </View>
        
        {/* Form Elements */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Form Elements</Text>
          
          <View style={componentStyles.inputContainer}>
            <Text style={componentStyles.inputLabel}>Input Label</Text>
            <View style={componentStyles.input} />
            <Text style={componentStyles.inputHelperText}>Helper text</Text>
          </View>
          
          <View style={componentStyles.inputContainer}>
            <Text style={componentStyles.inputLabel}>Input with Error</Text>
            <View style={[componentStyles.input, componentStyles.inputError]} />
            <Text style={componentStyles.inputErrorText}>Error message</Text>
          </View>
        </View>
        
        {/* Status Indicators */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Status Indicators</Text>
          
          <View style={styles.badgeRow}>
            <View style={[componentStyles.badge, componentStyles.statusPending]}>
              <Text style={[componentStyles.badgeText, componentStyles.pendingText]}>Pending</Text>
            </View>
            
            <View style={[componentStyles.badge, componentStyles.statusSuccess]}>
              <Text style={[componentStyles.badgeText, componentStyles.successText]}>Approved</Text>
            </View>
            
            <View style={[componentStyles.badge, componentStyles.statusError]}>
              <Text style={[componentStyles.badgeText, componentStyles.errorText]}>Rejected</Text>
            </View>
            
            <View style={[componentStyles.badge, componentStyles.statusInfo]}>
              <Text style={[componentStyles.badgeText, componentStyles.infoText]}>Info</Text>
            </View>
          </View>
        </View>
        
        {/* Spacing Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Spacing</Text>
          
          <View style={styles.spacingContainer}>
            {Object.entries(theme.spacing).map(([key, value]) => 
              key !== 'none' && (
                <View key={key} style={styles.spacingRow}>
                  <Text style={styles.spacingLabel}>{key}</Text>
                  <View style={[styles.spacingBox, { width: value, height: 20 }]} />
                  <Text style={styles.spacingValue}>{value}px</Text>
                </View>
              )
            )}
          </View>
        </View>
        
        {/* Border Radius Examples */}
        <View style={styles.section}>
          <Text style={componentStyles.heading2}>Border Radius</Text>
          
          <View style={styles.radiusContainer}>
            {Object.entries(theme.border.radius).map(([key, value]) => 
              key !== 'none' && key !== 'full' && (
                <View key={key} style={styles.radiusRow}>
                  <Text style={styles.radiusLabel}>{key}</Text>
                  <View style={[styles.radiusBox, { borderRadius: value }]} />
                  <Text style={styles.radiusValue}>{value}px</Text>
                </View>
              )
            )}
            <View style={styles.radiusRow}>
              <Text style={styles.radiusLabel}>full</Text>
              <View style={[styles.radiusBox, { borderRadius: 9999 }]} />
              <Text style={styles.radiusValue}>9999px</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Local styles specific to this component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  section: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.border.radius.lg,
    ...theme.shadows.sm,
  },
  colorRow: {
    flexDirection: 'row',
    marginVertical: theme.spacing.sm,
  },
  colorBox: {
    flex: 1,
    height: theme.verticalScale(60),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.border.radius.md,
    marginHorizontal: theme.spacing.xs,
  },
  colorLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  spacingContainer: {
    marginTop: theme.spacing.md,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  spacingLabel: {
    width: 50,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  spacingBox: {
    backgroundColor: theme.colors.primary.main,
    marginHorizontal: theme.spacing.md,
  },
  spacingValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  radiusContainer: {
    marginTop: theme.spacing.md,
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  radiusLabel: {
    width: 50,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  radiusBox: {
    width: 60,
    height: 60,
    backgroundColor: theme.colors.primary.main,
    marginHorizontal: theme.spacing.md,
  },
  radiusValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default ThemeExample; 