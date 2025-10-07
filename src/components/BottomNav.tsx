import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import { colors } from '@theme/colors';

type ActionKey = 'home' | 'microphone' | 'tasks';

const actions: Array<{ icon: 'home' | 'microfone' | 'task'; key: ActionKey }> = [
  { icon: 'home', key: 'home' },
  { icon: 'microfone', key: 'microphone' },
  { icon: 'task', key: 'tasks' }
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

type BottomNavProps = {
  active?: ActionKey;
  onPressHome?: () => void;
  onPressMicrophone?: () => void;
  onPressTasks?: () => void;
  onMicrophonePressIn?: () => void;
  onMicrophonePressOut?: () => void;
};

const BottomNav: React.FC<BottomNavProps> = ({
  active = 'home',
  onPressHome,
  onPressMicrophone,
  onPressTasks,
  onMicrophonePressIn,
  onMicrophonePressOut
}) => (
  <View style={styles.container}>
    {actions.map((action) => {
      const isActive = active === action.key;
      return (
        <IconButton
          key={action.key}
          icon={renderIcon(action.icon)}
          size={28}
          style={isActive ? styles.active : undefined}
          iconColor={isActive ? '#fff' : colors.textSecondary}
          containerColor={isActive ? colors.primary : 'transparent'}
          onPress={() => {
            if (action.key === 'home') onPressHome?.();
            else if (action.key === 'microphone') onPressMicrophone?.();
            else if (action.key === 'tasks') onPressTasks?.();
          }}
          {...(action.key === 'microphone'
            ? {
                onPressIn: onMicrophonePressIn,
                onPressOut: onMicrophonePressOut
              }
            : {})}
        />
      );
    })}
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
