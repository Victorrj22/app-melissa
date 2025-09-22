import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

interface TemperatureCardProps {
  temperature: number;
  location: string;
  loading?: boolean;
  onSelectLocation?: () => void;
  onRefresh?: () => void;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({
  temperature,
  location,
  onSelectLocation,
  onRefresh,
  loading
}) => (
  <Card style={styles.card} mode="contained">
    <Card.Content>
      <View style={styles.header}>
        <Text variant="titleMedium" style={styles.title}>
          Temperatura atual
        </Text>
        <Button mode="outlined" compact onPress={onSelectLocation}>
          Selecionar Local
        </Button>
      </View>
      <View style={styles.content}>
        <View>
          <Text variant="displaySmall" style={styles.temperature}>
            {loading ? '- °C' : `${temperature}ºC`}
          </Text>
          <Text variant="bodyMedium" style={styles.location}>
            {location}
          </Text>
        </View>
        <IconButton
          icon={(props) => (
            <Image
              source={require('../../assets/refresh_icon.png')}
              style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }}
              resizeMode="contain"
            />
          )}
          size={28}
          mode="contained"
          containerColor={colors.primary}
          iconColor="#fff"
          onPress={onRefresh}
        />
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  title: {
    fontWeight: '600',
    color: colors.textPrimary
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  temperature: {
    fontWeight: '700'
  },
  location: {
    color: colors.textSecondary
  }
});

export default TemperatureCard;
