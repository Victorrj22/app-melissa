import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

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
  <Card style={styles.card}>
    <Card.Title
      title="Próximos Feriados"
      titleStyle={styles.title}
      right={() => (
        <TouchableOpacity onPress={onOpenCalendar} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Abrir calendário">
          <Image source={require('../../assets/calendar_icon.png')} style={styles.icon} />
        </TouchableOpacity>
      )}
    />
    <Card.Content>
      {holidays.map((holiday) => (
        <View key={holiday.id} style={styles.holidayRow}>
          <Text variant="bodyLarge" style={styles.holidayName}>
            {holiday.name}
          </Text>
          <Text variant="labelLarge" style={styles.holidayDate}>
            {holiday.dateText}
          </Text>
        </View>
      ))}
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18
  },
  title: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  iconButton: {
    paddingRight: 12,
    paddingVertical: 4
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: colors.primary
  },
  holidayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  holidayName: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  holidayDate: {
    color: colors.textSecondary
  }
});

export default UpcomingHolidaysCard;
