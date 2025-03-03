# AdoptMe UI Theme System

This directory contains the AdoptMe app's theme system, which provides a consistent set of design tokens, responsive utilities, and component styles to ensure visual consistency across the app.

## Key Files

- **theme.js**: Contains all design tokens (colors, typography, spacing, etc.) and responsive scaling utilities.
- **componentStyles.js**: Pre-built component styles using the theme tokens.
- **commonStyles.js**: Legacy common styles (kept for backward compatibility).
- **index.js**: Central export point for all styling resources, along with helper functions.
- **ThemeExample.js**: Example component showing how to use the theme system in practice.

## Using the Theme System

### Basic Usage

```javascript
import { theme, componentStyles } from '../styles';

// Use theme tokens directly
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.default,
    padding: theme.spacing.base,
    borderRadius: theme.border.radius.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

// Or use pre-built component styles
<View style={componentStyles.card}>
  <Text style={componentStyles.heading2}>Card Title</Text>
  <Text style={componentStyles.bodyText}>Card content goes here</Text>
</View>
```

### Responsive Scaling

The theme system includes utilities for responsive design:

```javascript
import { theme } from '../styles';

// Scale values based on screen width (compared to base iPhone 8 width)
const scaledSize = theme.scale(16);  // For width-based values
const scaledHeight = theme.verticalScale(100);  // For height-based values
const scaledFont = theme.moderateScale(16);  // For font sizes (scales less aggressively)

// Get values as percentage of screen
const halfScreenWidth = theme.getResponsiveWidth(50);  // 50% of screen width
```

### Device-Specific Styles

```javascript
import { createResponsiveStyle, theme } from '../styles';

const styles = createResponsiveStyle(
  // Base styles for phones
  {
    container: {
      padding: theme.spacing.base,
    },
    title: {
      fontSize: theme.typography.fontSize.lg,
    }
  },
  // Tablet override styles
  {
    container: {
      padding: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
    }
  }
);
```

## Available Theme Tokens

### Colors

- **Primary**: `theme.colors.primary` (main, light, dark, 50-900 shades)
- **Secondary**: `theme.colors.secondary` (main, light, dark)
- **Accent**: `theme.colors.accent` (teal, lightBlue, purple)
- **Functional**: `theme.colors.success`, `theme.colors.warning`, `theme.colors.error`, `theme.colors.info`
- **Neutral**: `theme.colors.neutral` (white, black, grey50-900)
- **Background**: `theme.colors.background` (default, paper, dark)
- **Text**: `theme.colors.text` (primary, secondary, disabled, hint, light)
- **Border**: `theme.colors.border` (light, main, dark)
- **Shadow**: `theme.colors.shadow` (light, medium, dark)
- **Gradients**: `theme.colors.gradients` (primary, secondary, etc.)
- **States**: `theme.colors.states` (active, hover, pressed, disabled)
- **Species-specific**: `theme.colors.species` (all, cat, dog, bird, other)

### Typography

- **Font Sizes**: `theme.typography.fontSize` (xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
- **Line Heights**: `theme.typography.lineHeight` (xs, sm, base, md, lg, xl, 2xl, 3xl, 4xl, 5xl)
- **Font Weights**: `theme.typography.fontWeight` (thin, extralight, light, normal, medium, semibold, bold, extrabold, black)
- **Letter Spacing**: `theme.typography.letterSpacing` (tighter, tight, normal, wide, wider, widest)

### Spacing

- **theme.spacing**: (none, xs, sm, md, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl)

### Borders

- **Radius**: `theme.border.radius` (none, xs, sm, md, lg, xl, 2xl, full)
- **Width**: `theme.border.width` (none, thin, base, thick)

### Shadows

- **theme.shadows**: (none, xs, sm, md, lg, xl, 2xl)

### Animation

- **theme.animation**: (fast, normal, slow, very_slow)

### Breakpoints

- **theme.breakpoints**: (phone, tablet, desktop)

## Best Practices

1. **Always use theme tokens instead of hard-coded values**
2. **Leverage responsive scaling functions for different screen sizes**
3. **Use pre-built component styles when possible for consistency**
4. **Extend component styles rather than creating completely custom ones**
5. **Check `ThemeExample.js` for implementation examples**

## Responsive Design Approach

The theme system is designed to be responsive across different device sizes:

1. **Scaling**: Values scale automatically based on device screen width
2. **Device detection**: `theme.isTablet` detects larger screen sizes
3. **Responsive helpers**: Use `createResponsiveStyle()` for device-specific overrides
4. **Percentage-based sizing**: Use `getResponsiveWidth()` and `getResponsiveHeight()`
5. **Orientation change handling**: Add listeners for dimension changes 