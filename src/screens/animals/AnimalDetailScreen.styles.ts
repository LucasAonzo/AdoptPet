import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 cards per row with margins

interface AnimalDetailScreenStyles {
  container: ViewStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  mainContent: ViewStyle;
  petDetailImageContainer: ViewStyle;
  petDetailImage: ImageStyle;
  imageGradientOverlay: ViewStyle;
  detailHeaderButtons: ViewStyle;
  detailHeaderButton: ViewStyle;
  detailImageIndicator: ViewStyle;
  petDetailContent: ViewStyle;
  petDetailHeader: ViewStyle;
  petNameContainer: ViewStyle;
  speciesIcon: TextStyle;
  petDetailName: TextStyle;
  statusBadgeContainer: ViewStyle;
  statusBadge: ViewStyle;
  statusText: TextStyle;
  petDetailLocation: ViewStyle;
  petDetailLocationText: TextStyle;
  petInfoCardsContainer: ViewStyle;
  petInfoCardRow: ViewStyle;
  petInfoCard: ViewStyle;
  petInfoCardValue: TextStyle;
  petInfoCardLabel: TextStyle;
  ownerSection: ViewStyle;
  ownerInfo: ViewStyle;
  ownerImage: ImageStyle;
  ownerTextInfo: ViewStyle;
  ownerLabel: TextStyle;
  ownerName: TextStyle;
  contactButtons: ViewStyle;
  contactButton: ViewStyle;
  descriptionSection: ViewStyle;
  descriptionTitle: TextStyle;
  descriptionText: TextStyle;
  compatibilitySection: ViewStyle;
  compatibilityTitle: TextStyle;
  compatibilityIcons: ViewStyle;
  compatibilityItem: ViewStyle;
  compatibilityText: TextStyle;
  adoptionDetailsSection: ViewStyle;
  sectionTitle: TextStyle;
  adoptionDetailItem: ViewStyle;
  adoptionDetailText: TextStyle;
  adoptButton: ViewStyle;
  adoptButtonDisabled: ViewStyle;
  applicationSubmittedButton: ViewStyle;
  adoptButtonGradient: ViewStyle;
  adoptButtonContent: ViewStyle;
  adoptButtonText: TextStyle;
  adoptButtonFee: TextStyle;
  errorText: TextStyle;
  retryButton: ViewStyle;
  retryButtonText: TextStyle;
  buttonContainer: ViewStyle;
  ownerButtonsContainer: ViewStyle;
  ownerControlsContainer: ViewStyle;
  editButton: ViewStyle;
  deleteButton: ViewStyle;
  editButtonGradient: ViewStyle;
  deleteButtonGradient: ViewStyle;
  editButtonText: TextStyle;
  deleteButtonText: TextStyle;
  buttonContent: ViewStyle;
  buttonText: TextStyle;
}

const styles = StyleSheet.create<AnimalDetailScreenStyles>({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  mainContent: {
    flex: 1,
  },
  petDetailImageContainer: {
    position: 'relative',
    width: '100%',
    height: 350,
  },
  petDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  detailHeaderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 9,
  },
  detailHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailImageIndicator: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  petDetailContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  petDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  petNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speciesIcon: {
    marginRight: 8,
  },
  petDetailName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusBadgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  statusBadge: {
    backgroundColor: '#8e74ae',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  petDetailLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  petDetailLocationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  petInfoCardsContainer: {
    marginBottom: 25,
  },
  petInfoCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  petInfoCard: {
    width: cardWidth,
    backgroundColor: '#f8f6fb',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(142, 116, 174, 0.1)',
  },
  petInfoCardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  petInfoCardLabel: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  ownerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 25,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8e74ae',
  },
  ownerTextInfo: {
    marginLeft: 15,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#888',
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#8e74ae',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  descriptionSection: {
    marginBottom: 25,
    backgroundColor: '#f8f6fb',
    padding: 20,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8e74ae',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  compatibilitySection: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  compatibilityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  compatibilityIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  compatibilityItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 10,
    borderRadius: 10,
    width: 80,
  },
  compatibilityText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  adoptionDetailsSection: {
    marginBottom: 25,
    backgroundColor: '#f8f6fb',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  adoptionDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  adoptionDetailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  adoptButton: {
    borderRadius: 30,
    marginVertical: 25,
    marginHorizontal: 20,
    shadowColor: '#8e74ae',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  adoptButtonDisabled: {
    opacity: 0.7,
  },
  applicationSubmittedButton: {
    shadowColor: '#4CAF50',
  },
  adoptButtonGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  adoptButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adoptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 8,
  },
  adoptButtonFee: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#e74c3c',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8e74ae',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Owner Controls
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 5,
    position: 'relative',
    marginTop: 15,
  },
  ownerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginVertical: 25,
  },
  ownerControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButtonGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  deleteButtonGradient: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default styles; 