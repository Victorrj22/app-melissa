import React, { useMemo } from 'react';
import { Modal, Portal, Text, Button } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { colors } from '@theme/colors';

export interface YearCalendarModalProps {
  visible: boolean;
  onDismiss: () => void;
  year: number;
  markedDates: string[]; // YYYY-MM-DD
}

const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const YearCalendarModal: React.FC<YearCalendarModalProps> = ({ visible, onDismiss, year, markedDates }) => {
  const marked = useMemo(() => new Set(markedDates), [markedDates]);
  const [month, setMonth] = React.useState<number>(new Date().getFullYear() === year ? new Date().getMonth() : 0);

  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevDisabled = month === 0;
  const nextDisabled = month === 11;

  const grid: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    grid.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
  }

  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <View style={styles.header}>
          <Button onPress={() => setMonth((m) => Math.max(0, m - 1))} disabled={prevDisabled}>
            Anterior
          </Button>
          <Text style={styles.headerTitle}>
            {monthNames[month]} {year}
          </Text>
          <Button onPress={() => setMonth((m) => Math.min(11, m + 1))} disabled={nextDisabled}>
            Próximo
          </Button>
        </View>
        <View style={styles.weekdays}>
          {daysOfWeek.map((d, i) => (
            <Text key={d + '-' + i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {grid.map((iso, idx) => {
            if (!iso) return <View key={`e-${idx}`} style={styles.cell} />;
            const markedDay = marked.has(iso);
            return (
              <View key={iso} style={[styles.cell, markedDay && styles.markedCell]}>
                <Text style={[styles.dayLabel, markedDay && styles.markedText]}>{Number(iso.slice(-2))}</Text>
              </View>
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
  markedCell: {
    backgroundColor: colors.primary
  },
  dayLabel: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  markedText: {
    color: '#fff',
    fontWeight: '700'
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8
  }
});

export default YearCalendarModal;
