import { StyleSheet, Dimensions, ViewStyle, TextStyle } from 'react-native';

const { width, height } = Dimensions.get('window');

// Define the interface for the styles
interface LoadingOverlayStyles {
  container: ViewStyle;
  loaderContainer: ViewStyle;
  gradientBackground: ViewStyle;
  text: TextStyle;
  dotsContainer: ViewStyle;
  dot: ViewStyle;
  pulseContainer: ViewStyle;
  pulse: ViewStyle;
  pulseCenter: ViewStyle;
  pawContainer: ViewStyle;
  spinnerContainer: ViewStyle;
}

// Create the styles with proper typing
const styles = StyleSheet.create<LoadingOverlayStyles>({
  container: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)',
  },
  loaderContainer: {
    overflow: 'hidden',
    width: 150,
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 15,
    textAlign: 'center',
  },
  // Dots indicator styles
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    margin: 5,
  },
  // Pulse indicator styles
  pulseContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 3,
  },
  pulseCenter: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  // Paw indicator styles
  pawContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Spinner indicator styles
  spinnerContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles; 