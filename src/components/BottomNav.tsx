import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

type ActionKey = 'home' | 'microphone' | 'tasks';

type BottomNavProps = {
  active?: ActionKey;
  onPressHome?: () => void;
  onPressMicrophone?: () => void;
  onPressTasks?: () => void;
  onMicrophonePressIn?: () => void;
  onMicrophonePressOut?: () => void;
  isProcessingAudio?: boolean;
};

const BottomNav: React.FC<BottomNavProps> = ({
  active = 'home',
  onPressHome,
  onPressMicrophone,
  onPressTasks,
  onMicrophonePressIn,
  onMicrophonePressOut,
  isProcessingAudio = false
}) => {
  const NavButton = ({
    iconName,
    isActive,
    onPress,
    onPressIn,
    onPressOut
  }: {
    iconName: 'home' | 'mic' | 'check-square';
    isActive: boolean;
    onPress?: () => void;
    onPressIn?: () => void;
    onPressOut?: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.navButton, isActive && styles.navButtonActive]}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Feather
        name={iconName}
        size={24}
        color={isActive ? colors.textOnPrimary : colors.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NavButton
        iconName="home"
        isActive={active === 'home'}
        onPress={onPressHome}
      />
      <TouchableOpacity
        style={[styles.micButton, isProcessingAudio && styles.micButtonDisabled]}
        onPressIn={isProcessingAudio ? undefined : onMicrophonePressIn}
        onPressOut={isProcessingAudio ? undefined : onMicrophonePressOut}
        onPress={isProcessingAudio ? undefined : onPressMicrophone}
        disabled={isProcessingAudio}
      >
        {isProcessingAudio ? (
          <ActivityIndicator size={28} color={colors.textOnPrimary} />
        ) : (
          <Feather name="mic" size={28} color={colors.textOnPrimary} />
        )}
      </TouchableOpacity>
      <NavButton
        iconName="check-square"
        isActive={active === 'tasks'}
        onPress={onPressTasks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadowDark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12
      },
      android: {
        elevation: 12
      }
    })
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  navButtonActive: {
    backgroundColor: colors.primaryLight + '30'
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },
  micButtonDisabled: {
    opacity: 0.7
  }
});

export default BottomNav;
