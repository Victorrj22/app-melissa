import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

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
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.iconWrapper}>
          <Feather name="thermometer" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>Temperatura atual</Text>
      </View>
      <TouchableOpacity style={styles.locationButton} onPress={onSelectLocation}>
        <Text style={styles.locationButtonText}>Selecionar Local</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.content}>
      <View style={styles.temperatureContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <>
            <Text style={styles.temperature}>{temperature}°</Text>
            <Text style={styles.temperatureUnit}>C</Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.locationContainer}>
          <Feather name="map-pin" size={16} color={colors.textSecondary} />
          <Text style={styles.location}>{location}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={loading}
        >
          <Feather
            name="refresh-cw"
            size={20}
            color={colors.textOnPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  },
  locationButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  locationButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  content: {
    gap: 16
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 10
  },
  temperature: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 72,
    letterSpacing: -2
  },
  temperatureUnit: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 8,
    marginLeft: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  location: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
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
        elevation: 4
      }
    })
  }
});

export default TemperatureCard;
