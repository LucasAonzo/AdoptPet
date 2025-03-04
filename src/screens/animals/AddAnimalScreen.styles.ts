import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

interface AddAnimalScreenStyles {
  gradientContainer: ViewStyle;
  container: ViewStyle;
  scrollContainer: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  formContainer: ViewStyle;
  inputGroup: ViewStyle;
  label: TextStyle;
  inputWrapper: ViewStyle;
  textAreaWrapper: ViewStyle;
  inputIcon: TextStyle;
  input: TextStyle;
  textArea: TextStyle;
  imageButton: ViewStyle;
  imageButtonText: TextStyle;
  addButton: ViewStyle;
  addButtonText: TextStyle;
  imagePreviewContainer: ViewStyle;
  imagePreview: ImageStyle;
  changeImageButton: ViewStyle;
  changeImageText: TextStyle;
}

const styles = StyleSheet.create<AddAnimalScreenStyles>({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6FB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0FF',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#444',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9C84BE',
    borderRadius: 12,
    padding: 15,
    marginBottom: 22,
    marginTop: 6,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  imageButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  // Image preview styles
  imagePreviewContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default styles; 