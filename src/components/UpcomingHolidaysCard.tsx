import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '@theme/colors';
import { formatDate } from '@utils/date';

interface Holiday {
  id: string;
  name: string;
  date: Date;
}

interface UpcomingHolidaysCardProps {
  holidays: Holiday[];
}

const UpcomingHolidaysCard: React.FC<UpcomingHolidaysCardProps> = ({ holidays }) => (
  <Card style={styles.card}>
    <Card.Title title="Próximos Feriados" titleStyle={styles.title} />
    <Card.Content>
      {holidays.map((holiday) => (
        <View key={holiday.id} style={styles.holidayRow}>
          <Text variant="bodyLarge" style={styles.holidayName}>
            {holiday.name}
          </Text>
          <Text variant="labelLarge" style={styles.holidayDate}>
            {formatDate(holiday.date)}
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
    color: colors.textSecondary,
    textTransform: 'capitalize'
  }
});

export default UpcomingHolidaysCard;
