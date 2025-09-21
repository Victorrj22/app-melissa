import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '@theme/colors';

const actions = [
  { icon: 'home', key: 'home' },
  { icon: 'microfone', key: 'microphone' },
  { icon: 'task', key: 'tasks' },
];

const renderIcon = (name: 'home' | 'microfone' | 'task') => (props: { size: number; color: string }) => {
  let src: any;
  switch (name) {
    case 'home':
      src = require('../../assets/home_icon.png');
      break;
    case 'microfone':
      src = require('../../assets/microfone_icon.png');
      break;
    case 'task':
      src = require('../../assets/task_icon.png');
      break;
  }
  return (
    <Image
      source={src}
      style={{ width: props.size ?? 28, height: props.size ?? 28, tintColor: props.color }}
      resizeMode="contain"
    />
  );
};

const BottomNav: React.FC = () => (
  <View style={styles.container}>
    {actions.map((action, index) => (
      <IconButton
        key={action.key}
        icon={renderIcon(action.icon as 'home' | 'microfone' | 'task')}
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
