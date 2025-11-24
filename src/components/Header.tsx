import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  userName: string;
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onOpenSettings }) => (
  <View style={styles.container}>
    <View style={styles.identity}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatar}
      >
        <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
      </LinearGradient>
      <View>
        <Text style={styles.appName}>Melissa</Text>
        <Text style={styles.caption}>Sua assistente inteligente</Text>
      </View>
    </View>
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => undefined}
      >
        <Feather name="bell" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onOpenSettings}
      >
        <Feather name="settings" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 12,
    marginBottom: 8
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
      },
      android: {
        elevation: 6
      }
    })
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textOnPrimary
  },
  appName: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.3
  },
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    gap: 4
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  }
});

export default Header;
