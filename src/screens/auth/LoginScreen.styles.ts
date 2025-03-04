import { StyleSheet, TextStyle, ViewStyle, ImageStyle } from 'react-native';

interface LoginScreenStyles {
  container: ViewStyle;
  keyboardAvoidingView: ViewStyle;
  scrollContainer: ViewStyle;
  logoContainer: ViewStyle;
  logo: ImageStyle;
  appName: TextStyle;
  formContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  inputContainer: ViewStyle;
  label: TextStyle;
  input: TextStyle;
  inputError: TextStyle;
  errorText: TextStyle;
  forgotPasswordContainer: ViewStyle;
  forgotPasswordText: TextStyle;
  loginButton: ViewStyle;
  loginButtonDisabled: ViewStyle;
  loginButtonText: TextStyle;
  signupContainer: ViewStyle;
  signupText: TextStyle;
  signupButtonText: TextStyle;
}

// Define fallback colors in case theme is not available
const colors = {
  background: '#FFFFFF',
  white: '#FFFFFF',
  text: '#000000',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray600: '#757575',
  primary: {
    main: '#3F51B5',
  },
  error: {
    main: '#F44336',
  }
};

// Define fallback spacing
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Define fallback font sizes
const fontSizes = {
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
};

export default StyleSheet.create<LoginScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.gray600,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    color: colors.primary.main,
    fontSize: fontSizes.sm,
  },
  loginButton: {
    backgroundColor: colors.primary.main,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  signupText: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  signupButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
}); 