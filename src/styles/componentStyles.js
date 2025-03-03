import { StyleSheet } from 'react-native';
import theme from './theme';

/**
 * Pre-defined component styles that use the theme tokens
 * These can be used directly or extended by component-specific styles
 */
const componentStyles = StyleSheet.create({
  // LAYOUT CONTAINERS
  safeAreaContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  safeAreaTop: {
    flex: 0,
    backgroundColor: theme.colors.primary.main,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  contentContainer: {
    padding: theme.spacing.base,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing['3xl'],
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // CARDS
  card: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardElevated: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.border.radius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  cardImage: {
    width: '100%',
    height: theme.verticalScale(160),
    borderRadius: theme.border.radius.md,
    marginBottom: theme.spacing.md,
  },

  // BUTTONS
  buttonPrimary: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.border.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: theme.border.radius.lg,
    borderWidth: theme.border.width.thin,
    borderColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderRadius: theme.border.radius.lg,
    borderWidth: theme.border.width.thin,
    borderColor: theme.colors.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.neutral.grey300,
    borderRadius: theme.border.radius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.light,
  },
  buttonTextSecondary: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
  },
  buttonTextDisabled: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.disabled,
  },

  // TEXT STYLES
  heading1: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  heading2: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  heading3: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  heading4: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  heading5: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.base,
  },
  bodyTextBold: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.base,
  },
  caption: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.secondary,
  },
  smallText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.text.secondary,
  },

  // FORM ELEMENTS
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background.paper,
    borderWidth: theme.border.width.thin,
    borderColor: theme.colors.border.light,
    borderRadius: theme.border.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.base,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  inputFocused: {
    borderColor: theme.colors.primary.main,
  },
  inputError: {
    borderColor: theme.colors.error.main,
  },
  inputHelperText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  inputErrorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs,
  },
  
  // STATUS AND FEEDBACK
  badge: {
    borderRadius: theme.border.radius.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  statusPending: {
    backgroundColor: theme.colors.warning.light,
  },
  statusSuccess: {
    backgroundColor: theme.colors.success.light,
  },
  statusError: {
    backgroundColor: theme.colors.error.light,
  },
  statusInfo: {
    backgroundColor: theme.colors.info.light,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  pendingText: {
    color: theme.colors.warning.main,
  },
  successText: {
    color: theme.colors.success.main,
  },
  errorText: {
    color: theme.colors.error.main,
  },
  infoText: {
    color: theme.colors.info.main,
  },

  // DIVIDERS
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.lg,
  },
  dividerThin: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.md,
  },

  // LISTS
  listItem: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  listItemContent: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  listItemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  listItemDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  // ICONS
  iconContainer: {
    width: theme.scale(36),
    height: theme.scale(36),
    borderRadius: theme.border.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSmall: {
    width: theme.scale(28),
    height: theme.scale(28),
    borderRadius: theme.border.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerLarge: {
    width: theme.scale(48),
    height: theme.scale(48),
    borderRadius: theme.border.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPrimary: {
    backgroundColor: theme.colors.primary.main,
  },
  iconSecondary: {
    backgroundColor: theme.colors.secondary.main,
  },
  
  // EMPTY STATES
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  
  // LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.md,
  },
});

export default componentStyles; 