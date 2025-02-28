# AdoptMe Modal Component

A flexible, reusable modal component for the AdoptMe application that follows the app's UI design patterns.

## Features

- Multiple modal types (success, error, info, confirmation, loading)
- Consistent styling with the rest of the app
- Easy-to-use API with a custom hook
- Built-in animations
- Customizable options

## Setup

1. **Add the Modal Provider to your App.js**:

```jsx
// App.js
import { ModalProvider } from './src/components/modals';

export default function App() {
  return (
    <OtherProviders>
      <ModalProvider>
        <YourApp />
      </ModalProvider>
    </OtherProviders>
  );
}
```

2. **In your screen or component, import the useModalContext hook**:

```jsx
import { useModalContext } from '../../components/modals';

const YourComponent = () => {
  const { 
    showSuccessModal, 
    showErrorModal,
    // other methods...
  } = useModalContext();

  // Use the modals in your component
}
```

## Usage

### Basic Usage

```jsx
import React from 'react';
import { View, Button } from 'react-native';
import { useModalContext } from '../../components/modals';

const MyScreen = () => {
  const { showInfoModal } = useModalContext();

  return (
    <View>
      <Button 
        title="Show Info Modal" 
        onPress={() => showInfoModal('Information', 'This is an info message')} 
      />
    </View>
  );
};
```

### Modal Types

#### Success Modal

```jsx
showSuccessModal('Success!', 'Operation completed successfully');
```

#### Error Modal

```jsx
showErrorModal('Error', 'Something went wrong');
```

#### Info Modal

```jsx
showInfoModal('Information', 'Here is some information');
```

#### Confirmation Modal

```jsx
showConfirmationModal(
  'Confirm Action',
  'Are you sure you want to proceed?',
  () => {
    // Do something when confirmed
    console.log('User confirmed the action');
  },
  'Yes, Proceed', // Optional custom confirm text
  'No, Cancel'    // Optional custom cancel text
);
```

#### Loading Modal

```jsx
showLoadingModal('Processing your request...');

// Later, when operation is done:
hideModal();
```

### Advanced Usage

You can also use the showModal function directly for more customization:

```jsx
showModal({
  type: 'info',          // 'success', 'error', 'info', 'confirmation', 'loading'
  title: 'Custom Title',
  message: 'Custom message here',
  onConfirm: () => console.log('Confirmed'),
  confirmText: 'Custom Confirm',
  cancelText: 'Custom Cancel',
  hideCloseButton: false
});
```

## Troubleshooting

If modals are not appearing, try the following steps:

1. **Ensure the ModalProvider is properly set up**:
   - The ModalProvider should be above the component tree where you want to use modals
   - Check App.js to make sure ModalProvider is included

2. **Check your imports**:
   - Make sure you're importing `useModalContext` correctly
   - Verify you're using the modal functions correctly

3. **Add console logs for debugging**:
   - Add console.log statements in your handlers to ensure they're being called
   - Look for any errors in the console

4. **Restart your app**:
   - Sometimes a full restart is needed after adding new components

5. **Check for styling conflicts**:
   - The modal uses React Native's Modal component which should overlay everything
   - If other components have very high z-index values, they might overlap

6. **Test with a simple button**:
   - Add a test button that directly calls a modal function to verify the system works

## Props

The `ModalComponent` accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| visible | boolean | false | Whether the modal is visible |
| onClose | function | required | Function to call when the modal is closed |
| type | string | 'info' | Type of modal ('success', 'error', 'info', 'confirmation', 'loading') |
| title | string | '' | Title text for the modal |
| message | string | '' | Main message text for the modal |
| onConfirm | function | null | Function to call when the confirm button is pressed (for confirmation modals) |
| confirmText | string | 'Confirm' | Text for the confirm button |
| cancelText | string | 'Cancel' | Text for the cancel button |
| hideCloseButton | boolean | false | Whether to hide the close button (for loading modals) | 