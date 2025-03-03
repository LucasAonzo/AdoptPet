/**
 * Central export point for all styling resources
 */

import theme from './theme';
import componentStyles from './componentStyles';
import commonStyles from './commonStyles';

// Re-export everything for easy imports elsewhere
export {
  theme,          // Theme tokens and scaling functions
  componentStyles, // Pre-built component styles using theme tokens
  commonStyles,    // Legacy common styles (kept for backward compatibility)
};

// Helper functions
export const createResponsiveStyle = (baseStyle, tabletStyle = {}, desktopStyle = {}) => {
  if (theme.isTablet) {
    return { ...baseStyle, ...tabletStyle };
  }
  
  return baseStyle;
};

// Export default theme object as the default export
export default theme; 