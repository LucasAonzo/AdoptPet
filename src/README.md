# AdoptMe App Architecture

This document outlines the architecture, structure, and best practices for the AdoptMe application.

## Project Structure

The project follows a feature-first architecture with clear separation of concerns:

```
src/
  ├── features/           # Feature-based modules
  │   ├── auth/           # Authentication feature
  │   ├── animals/        # Animal feature
  │   ├── chat/           # Chat feature
  │   └── profile/        # User profile feature
  ├── shared/             # Shared across features
  │   ├── components/     # Common UI components
  │   ├── hooks/          # Common hooks
  │   ├── services/       # Common services
  │   ├── utils/          # Utility functions
  │   └── styles/         # Global styles
  ├── core/               # Core application setup
  │   ├── navigation/     # Navigation setup
  │   ├── api/            # API configuration
  │   ├── store/          # Global store setup
  │   └── config/         # App configuration
  └── README.md           # Documentation
```

## Features

Each feature has its own directory with the following structure:

```
features/auth/
  ├── components/        # Auth-specific components
  ├── screens/           # Auth screens
  ├── hooks/             # Auth-specific hooks
  ├── services/          # Auth-specific services
  └── context/           # Auth-specific context
```

## State Management

The application uses a hybrid approach to state management:

1. **React Query** - For server state management (API data fetching and caching)
2. **Zustand** - For global client state
3. **Context API** - For feature-specific state with limited scope
4. **Local state** - For component-specific state

## Component Design System

We follow the Atomic Design methodology for components:

- **Atoms** - Basic building blocks (buttons, inputs, etc.)
- **Molecules** - Combinations of atoms (form fields, search bars, etc.)
- **Organisms** - Complex UI sections (forms, cards, lists, etc.)
- **Templates** - Page layouts

## Styling Approach

All styling uses a centralized theme system:

- **Theme** - Contains colors, spacing, typography, etc.
- **Component-specific styles** - Should use the theme values

## Error Handling

Error handling is centralized:

- Use the `errorHandler` utilities for consistent error handling
- All API calls should be wrapped in try/catch blocks
- User-friendly error messages should be displayed

## Best Practices

### General

- Keep components small and focused on a single responsibility
- Use proper component memoization (React.memo, useMemo, useCallback)
- Avoid prop drilling by using context or hooks
- Add proper JSDoc comments for all functions and components

### State Management

- Use React Query for all API data
- Use Zustand for global UI state
- Use Context for feature-specific state
- Avoid redundant state and derived state

### Navigation

- Keep navigation logic in the navigation directory
- Use typed routes whenever possible

### Testing

- Write tests for all business logic
- Test components in isolation
- Use mock data for tests

## Example Usage

### Using Theme

```jsx
import theme from 'shared/styles/theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
});
```

### Using React Query

```jsx
import { useQuery } from '@tanstack/react-query';
import { fetchAnimals } from 'features/animals/services/animalService';

function AnimalList() {
  const { data, isLoading, error } = useQuery(['animals'], fetchAnimals);
  // Rest of component
}
```

### Using Shared Components

```jsx
import { Button } from 'shared/components/atoms';

function LoginScreen() {
  return (
    <Button
      title="Login"
      onPress={handleLogin}
      variant="primary"
      size="large"
    />
  );
}
```

### Using Error Handling

```jsx
import { handleApiError } from 'shared/utils/errorHandler';

async function fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    const formattedError = handleApiError(error, 'Failed to fetch data');
    console.error(formattedError);
    throw formattedError;
  }
}
``` 