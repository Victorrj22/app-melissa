import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '@theme/colors';

const actions = [
  { icon: 'home-outline', key: 'home' },
  { icon: 'calendar-check-outline', key: 'tasks' },
  { icon: 'chart-box-outline', key: 'analytics' },
  { icon: 'account-circle-outline', key: 'profile' }
];

const BottomNav: React.FC = () => (
  <View style={styles.container}>
    {actions.map((action, index) => (
      <IconButton
        key={action.key}
        icon={action.icon}
        size={28}
        style={index === 0 ? styles.active : undefined}
        iconColor={index === 0 ? '#fff' : colors.textSecondary}
        containerColor={index === 0 ? colors.primary : 'transparent'}
        onPress={() => undefined}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 16
  },
  active: {
    elevation: 2
  }
});

export default BottomNav;
