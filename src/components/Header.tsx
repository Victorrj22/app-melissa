import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Avatar, IconButton, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

interface HeaderProps {
  userName: string;
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ userName, onOpenSettings }) => (
  <View style={styles.container}>
    <View style={styles.identity}>
      <Avatar.Text size={44} label={userName.charAt(0)} style={styles.avatar} />
      <View>
        <Text variant="titleMedium" style={styles.appName}>
          Melissa
        </Text>
        <Text variant="labelSmall" style={styles.caption}>
          Sua agente de IA privativa
        </Text>
      </View>
    </View>
    <View style={styles.actions}>
      <IconButton
        icon={(props) => (
          <Image
            source={require('../../assets/bell_icon.png')}
            style={{ width: props.size ?? 22, height: props.size ?? 22, tintColor: props.color }}
            resizeMode="contain"
          />
        )}
        size={22}
        onPress={() => undefined}
      />
      <IconButton
        icon={(props) => (
          <Image
            source={require('../../assets/cog_icon.png')}
            style={{ width: props.size ?? 22, height: props.size ?? 22, tintColor: props.color }}
            resizeMode="contain"
          />
        )}
        size={22}
        onPress={onOpenSettings}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  actions: {
    flexDirection: 'row'
  },
  avatar: {
    backgroundColor: colors.primary
  },
  appName: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  caption: {
    color: colors.textSecondary
  }
});

export default Header;
