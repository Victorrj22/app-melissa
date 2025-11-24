import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';

export const commonStyles = StyleSheet.create({
  // Card Styles with Glassmorphism
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },

  cardElevated: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24
      },
      android: {
        elevation: 12
      }
    })
  },

  cardGlass: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12
      },
      android: {
        elevation: 4
      }
    })
  },

  // Button Styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },

  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: colors.border
  },

  // Text Styles
  heading1: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5
  },

  heading2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },

  heading3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary
  },

  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 24
  },

  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20
  },

  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textTertiary,
    letterSpacing: 0.5
  },

  // Container Styles
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 32
  },

  // Icon Container
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },

  iconContainerSecondary: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16
  },

  // Badge
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primary
  }
});
