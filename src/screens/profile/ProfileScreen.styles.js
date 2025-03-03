import { StyleSheet, Dimensions, Platform } from 'react-native';
import theme from '../../styles/theme';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl, 
  },
  
  // Header
  headerContainer: {
    width: '100%',
    backgroundColor: theme.colors.primary.main,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    height: 56,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.light,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  
  // Profile Header
  profileHeaderContainer: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.border.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  profileHeaderGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  profileAvatarContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  profileAvatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    backgroundColor: theme.colors.background.paper,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  editAvatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  
  // Stats/Tabs
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral.grey100,
    backgroundColor: theme.colors.background.paper,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.border.radius.md,
    maxWidth: width / 4,
  },
  activeStatItem: {
    backgroundColor: theme.colors.primary.lighter,
  },
  statIconContainer: {
    position: 'relative',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: theme.colors.secondary.main,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeStatLabel: {
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
  
  // Detail Card
  detailsCard: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  editActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.lighter,
  },
  detailsContainer: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.grey100,
  },
  detailIconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  detailValue: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  
  // Form inputs
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.neutral.grey200,
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.border.radius.md,
    padding: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Buttons
  formButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.neutral.grey300,
    borderRadius: theme.border.radius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  saveButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.border.radius.md,
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: theme.border.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: theme.spacing.xs,
  },
  
  // Animals Section
  animalsSection: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: '#fff',
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: theme.spacing.md,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: theme.border.radius.md,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  animalImage: {
    width: '100%',
    height: 120,
  },
  animalInfo: {
    padding: theme.spacing.sm,
  },
  animalName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  animalBreed: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  addAnimalButton: {
    borderRadius: theme.border.radius.md,
    overflow: 'hidden',
  },
  addAnimalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addAnimalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  
  // Empty state
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  
  // Sign Out Button
  profileActionsContainer: {
    marginTop: theme.spacing.md,
  },
  signOutButton: {
    width: '100%',
    height: 50,
    borderRadius: theme.border.radius.md,
    overflow: 'hidden',
  },
  signOutButtonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  
  // Debug button
  debugButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.border.radius.md,
    backgroundColor: theme.colors.neutral.grey200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.neutral.grey300,
  },
  debugButtonText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});

export default styles; 