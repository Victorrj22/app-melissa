import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { colors } from '@theme/colors';

export interface DatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  initialDate?: Date;
  onConfirm: (date: Date) => void;
}

const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const DatePickerModal: React.FC<DatePickerModalProps> = ({ visible, onDismiss, initialDate, onConfirm }) => {
  const base = initialDate ?? new Date();
  const [year, setYear] = React.useState<number>(base.getFullYear());
  const [month, setMonth] = React.useState<number>(base.getMonth());

  React.useEffect(() => {
    if (visible) {
      const b = initialDate ?? new Date();
      setYear(b.getFullYear());
      setMonth(b.getMonth());
    }
  }, [visible, initialDate]);

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const grid: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month, d));
  }

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Button onPress={prevMonth}>Anterior</Button>
          <Text style={styles.headerTitle}>{monthNames[month]} {year}</Text>
          <Button onPress={nextMonth}>Próximo</Button>
        </View>
        <View style={styles.weekdays}>
          {daysOfWeek.map((d, i) => (
            <Text key={d + '-' + i} style={styles.weekday}>{d}</Text>
          ))}
        </View>
        <View style={styles.grid}>
          {grid.map((date, idx) => {
            if (!date) return <View key={`e-${idx}`} style={styles.cell} />;
            return (
              <TouchableOpacity key={date.toISOString()} style={styles.cell} onPress={() => onConfirm(date)}>
                <Text style={styles.dayLabel}>{date.getDate()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.footer}>
          <Button onPress={onDismiss}>Fechar</Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
    padding: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  headerTitle: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '600'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderRadius: 8
  },
  dayLabel: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8
  }
});

export default DatePickerModal;

