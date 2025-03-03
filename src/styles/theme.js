import { Dimensions } from 'react-native';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Base width for scaling (iPhone 8 width as reference)
const baseWidth = 375;
const baseHeight = 667;

// Create scaling factors
const widthScale = width / baseWidth;
const heightScale = height / baseHeight;

// Device type detection
const isTablet = width > 768;

/**
 * Function to scale sizes based on device width
 * @param {number} size - Size to scale
 * @returns {number} - Scaled size
 */
export const scale = (size) => Math.round(size * widthScale);

/**
 * Function to scale vertical sizes (heights, margin/padding top/bottom)
 * @param {number} size - Size to scale
 * @returns {number} - Scaled size
 */
export const verticalScale = (size) => Math.round(size * heightScale);

/**
 * Function for scaling sizes that should scale less aggressively
 * (e.g. font sizes, border radius)
 * @param {number} size - Size to scale
 * @param {number} factor - Scaling factor (0.5 by default)
 * @returns {number} - Scaled size
 */
export const moderateScale = (size, factor = 0.5) => 
  Math.round(size + (scale(size) - size) * factor);

/**
 * Get responsive dimensions based on percentage of screen
 * @param {number} percentage - Percentage of screen width
 * @returns {number} - Value in pixels
 */
export const getResponsiveWidth = (percentage) => {
  return (percentage * width) / 100;
};

/**
 * Get responsive dimensions based on percentage of screen
 * @param {number} percentage - Percentage of screen height
 * @returns {number} - Value in pixels
 */
export const getResponsiveHeight = (percentage) => {
  return (percentage * height) / 100;
};

// Font family
export const fontFamily = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

// COLORS
export const colors = {
  // Primary brand colors
  primary: {
    main: '#8e74ae',       // Main purple
    light: '#a58fd8',      // Light purple
    dark: '#6a5683',       // Dark purple
    50: '#f3effb',
    100: '#e7dff6',
    200: '#d0bfed',
    300: '#b9a0e3',
    400: '#a58fd8',
    500: '#8e74ae',
    600: '#6a5683',
    700: '#56466c',
    800: '#413551',
    900: '#2d2437',
  },

  // Secondary colors
  secondary: {
    main: '#f3b8a2',       // Peach
    light: '#ffd9c9',      // Light peach
    dark: '#d39a84',       // Dark peach
  },

  // Accent colors
  accent: {
    teal: '#b9e6e0',       // Teal
    lightBlue: '#a7d1d6',  // Light blue
    purple: '#ab9abb',     // Purple
  },

  // Functional colors
  success: {
    main: '#4CAF50',
    light: '#E7F5E8',
    dark: '#388E3C',
  },
  warning: {
    main: '#FF9800',
    light: '#FFF5E6',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',
    light: '#FEECEF',
    dark: '#D32F2F',
  },
  info: {
    main: '#2196F3',
    light: '#E8F4FD',
    dark: '#1976D2',
  },

  // Neutrals
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    grey50: '#FAFAFA',
    grey100: '#F5F5F5',
    grey200: '#EEEEEE',
    grey300: '#E0E0E0',
    grey400: '#BDBDBD',
    grey500: '#9E9E9E',
    grey600: '#757575',
    grey700: '#616161',
    grey800: '#424242',
    grey900: '#212121',
  },

  // Background colors
  background: {
    default: '#F8F8F8',    // Default background
    paper: '#FFFFFF',      // Card/Paper background
    dark: '#121212',       // Dark mode background
  },

  // Text colors
  text: {
    primary: '#333333',    // Primary text
    secondary: '#666666',  // Secondary text
    disabled: '#999999',   // Disabled text
    hint: '#BBBBBB',       // Hint text
    light: '#FFFFFF',      // Light text (on dark bg)
  },

  // Border colors
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E',
  },

  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.2)',
  },

  // Gradient presets
  gradients: {
    primary: ['#a58fd8', '#8e74ae'],
    secondary: ['#ffd9c9', '#f3b8a2'],
    teal: ['#d2f5f0', '#b9e6e0'],
    success: ['#81C784', '#4CAF50'],
    warning: ['#FFB74D', '#FF9800'],
    error: ['#E57373', '#F44336'],
  },

  // States
  states: {
    active: '#8e74ae',
    hover: 'rgba(142, 116, 174, 0.1)',
    pressed: 'rgba(142, 116, 174, 0.2)',
    disabled: '#E0E0E0',
  },

  // Species-specific colors (from data/categories.js)
  species: {
    all: { main: '#8e74ae', background: '#ab9abb' },
    cat: { main: '#e8b3b5', background: '#ab9abb' },
    dog: { main: '#a0cbc4', background: '#b9e6e0' },
    bird: { main: '#8db3b8', background: '#a7d1d6' },
    other: { main: '#d39a84', background: '#f3b8a2' },
  },
};

// TYPOGRAPHY
export const typography = {
  // Font sizes
  fontSize: {
    xs: moderateScale(10),
    sm: moderateScale(12),
    base: moderateScale(14),
    md: moderateScale(16),
    lg: moderateScale(18),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
    '3xl': moderateScale(30),
    '4xl': moderateScale(36),
    '5xl': moderateScale(48),
  },

  // Line heights
  lineHeight: {
    xs: moderateScale(14),
    sm: moderateScale(18),
    base: moderateScale(22),
    md: moderateScale(24),
    lg: moderateScale(28),
    xl: moderateScale(30),
    '2xl': moderateScale(36),
    '3xl': moderateScale(42),
    '4xl': moderateScale(48),
    '5xl': moderateScale(60),
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
};

// SPACING
export const spacing = {
  none: 0,
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  base: scale(16),
  lg: scale(20),
  xl: scale(24),
  '2xl': scale(32),
  '3xl': scale(40),
  '4xl': scale(48),
  '5xl': scale(64),
  '6xl': scale(80),
};

// BORDERS
export const border = {
  radius: {
    none: 0,
    xs: scale(2),
    sm: scale(4),
    md: scale(8),
    lg: scale(12),
    xl: scale(16),
    '2xl': scale(20),
    full: 9999,
  },
  width: {
    none: 0,
    thin: 1,
    base: 2,
    thick: 3,
  },
};

// SHADOWS
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 12,
  },
};

// ANIMATION timing
export const animation = {
  fast: 150,
  normal: 250,
  slow: 350,
  very_slow: 500,
};

// Device size breakpoints
export const breakpoints = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

// Z-index values
export const zIndex = {
  deep: -10,
  normal: 0,
  float: 10,
  modal: 100,
  toast: 1000,
  tooltip: 1500,
};

// Export the theme object
export default {
  colors,
  typography,
  spacing,
  border,
  shadows,
  animation,
  scale,
  verticalScale,
  moderateScale,
  getResponsiveWidth,
  getResponsiveHeight,
  fontFamily,
  isTablet,
  breakpoints,
  zIndex,
}; 