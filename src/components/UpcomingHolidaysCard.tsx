import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

interface HolidayItem {
  id: string;
  name: string;
  dateText: string;
}

interface UpcomingHolidaysCardProps {
  holidays: HolidayItem[];
  onOpenCalendar?: () => void;
}

const UpcomingHolidaysCard: React.FC<UpcomingHolidaysCardProps> = ({ holidays, onOpenCalendar }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <View style={styles.titleContainer}>
        <View style={styles.iconWrapper}>
          <Feather name="calendar" size={20} color={colors.primary} />
        </View>
        <Text style={styles.title}>Próximos Feriados</Text>
      </View>
      <TouchableOpacity
        style={styles.calendarButton}
        onPress={onOpenCalendar}
        accessibilityRole="button"
        accessibilityLabel="Abrir calendário"
      >
        <Feather name="eye" size={18} color={colors.primary} />
        <Text style={styles.calendarButtonText}>Ver todos</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.content}>
      {holidays.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={40} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Nenhum feriado próximo</Text>
        </View>
      ) : (
        holidays.map((holiday) => (
          <View key={holiday.id} style={styles.holidayRow}>
            <View style={styles.holidayIconContainer}>
              <Feather name="gift" size={18} color={colors.accent} />
            </View>
            <View style={styles.holidayInfo}>
              <Text style={styles.holidayName}>{holiday.name}</Text>
              <View style={styles.dateContainer}>
                <Feather name="clock" size={12} color={colors.textTertiary} />
                <Text style={styles.holidayDate}>{holiday.dateText}</Text>
              </View>
            </View>
          </View>
        ))
      )}
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
  calendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border
  },
  calendarButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary
  },
  content: {
    gap: 12
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12
  },
  emptyText: {
    fontSize: 14,
    color: colors.textTertiary,
    fontWeight: '500'
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 16,
    gap: 14
  },
  holidayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center'
  },
  holidayInfo: {
    flex: 1,
    gap: 6
  },
  holidayName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  holidayDate: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '500'
  }
});

export default UpcomingHolidaysCard;
