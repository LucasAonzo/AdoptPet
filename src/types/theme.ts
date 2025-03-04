/**
 * Type definitions for the AdoptMe theme system
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Color definitions
 */
export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
  };
  accent: {
    teal: string;
    lightBlue: string;
    purple: string;
  };
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: {
    white: string;
    black: string;
    grey50: string;
    grey100: string;
    grey200: string;
    grey300: string;
    grey400: string;
    grey500: string;
    grey600: string;
    grey700: string;
    grey800: string;
    grey900: string;
  };
  background: {
    default: string;
    paper: string;
    dark: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
    light: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  shadow: {
    light: string;
    medium: string;
    dark: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    success: string[];
    error: string[];
    warning: string[];
  };
  states: {
    active: string;
    hover: string;
    pressed: string;
    disabled: string;
  };
  species: {
    all: string;
    cat: string;
    dog: string;
    bird: string;
    other: string;
  };
}

/**
 * Typography definitions
 */
export interface ThemeTypography {
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  lineHeight: {
    xs: number;
    sm: number;
    base: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
  };
  fontWeight: {
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };
  letterSpacing: {
    tighter: number;
    tight: number;
    normal: number;
    wide: number;
    wider: number;
    widest: number;
  };
}

/**
 * Spacing definitions
 */
export interface ThemeSpacing {
  none: number;
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
  '6xl': number;
}

/**
 * Border definitions
 */
export interface ThemeBorders {
  radius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
    full: number;
  };
  width: {
    none: number;
    thin: number;
    base: number;
    thick: number;
  };
}

/**
 * Shadow definitions
 */
export interface ThemeShadows {
  none: ViewStyle;
  xs: ViewStyle;
  sm: ViewStyle;
  md: ViewStyle;
  lg: ViewStyle;
  xl: ViewStyle;
  '2xl': ViewStyle;
}

/**
 * Animation definitions
 */
export interface ThemeAnimation {
  fast: number;
  normal: number;
  slow: number;
  very_slow: number;
}

/**
 * Breakpoint definitions
 */
export interface ThemeBreakpoints {
  phone: number;
  tablet: number;
  desktop: number;
}

/**
 * Complete theme interface
 */
export interface Theme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  border: ThemeBorders;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  breakpoints: ThemeBreakpoints;
  
  // Utility functions
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number) => number;
  getResponsiveWidth: (percentage: number) => number;
  getResponsiveHeight: (percentage: number) => number;
  isTablet: boolean;
}

/**
 * Component style types
 */
export interface ComponentStyles {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
}

/**
 * Responsive style creator
 */
export type CreateResponsiveStyle = <T extends ComponentStyles>(
  baseStyle: T,
  tabletStyle?: Partial<T>,
  desktopStyle?: Partial<T>
) => T; 