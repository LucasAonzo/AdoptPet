import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  activityIndicator: {
    marginBottom: 10,
  },
  text: {
    color: '#333',
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
  },
}); 