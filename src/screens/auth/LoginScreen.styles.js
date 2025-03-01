import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8e74ae',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
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
    marginBottom: 20,
    shadowColor: '#8e74ae',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  loginButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E0FF',
  },
  orText: {
    color: '#777',
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  forgotPasswordText: {
    color: '#8e74ae',
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
    marginRight: 5,
  },
  signUpText: {
    color: '#8e74ae',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default styles; 