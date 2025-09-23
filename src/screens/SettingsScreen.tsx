import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, TextInput, Button, Text, Card } from 'react-native-paper';
import { colors } from '@theme/colors';
import DatePickerModal from '@components/DatePickerModal';

export interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [server, setServer] = useState('');
  const [email, setEmail] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [fromVisible, setFromVisible] = useState(false);
  const [toVisible, setToVisible] = useState(false);

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action
          onPress={onBack}
          icon={(props) => (
            <Image
              source={require('../../assets/back_icon.png')}
              style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }}
              resizeMode="contain"
            />
          )}
        />
        <Appbar.Content title="Configurações" />
      </Appbar.Header>

      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Title title="Servidor" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Servidor"
              placeholder="http://192.168.1.100:5179"
              value={server}
              onChangeText={setServer}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Email" />
          <Card.Content>
            <TextInput
              mode="outlined"
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Histórico de conversa" />
          <Card.Content>
            <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Selecione o período</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="De"
                placeholder="dd/mm/yyyy"
                value={formatDate(fromDate)}
                showSoftInputOnFocus={false}
                onFocus={() => setFromVisible(true)}
              />
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Até"
                placeholder="dd/mm/yyyy"
                value={formatDate(toDate)}
                showSoftInputOnFocus={false}
                onFocus={() => setToVisible(true)}
              />
              <Button mode="contained" style={{ alignSelf: 'center', marginLeft: 4 }} onPress={() => undefined}>
                Solicitar
              </Button>
            </View>
          </Card.Content>
        </Card>
        <DatePickerModal
          visible={fromVisible}
          initialDate={fromDate ?? undefined}
          onDismiss={() => setFromVisible(false)}
          onConfirm={(date) => { setFromDate(date); setFromVisible(false); }}
        />
        <DatePickerModal
          visible={toVisible}
          initialDate={toDate ?? undefined}
          onDismiss={() => setToVisible(false)}
          onConfirm={(date) => { setToDate(date); setToVisible(false); }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: 16, gap: 12 },
  card: { backgroundColor: colors.surface, borderRadius: 16 }
});

export default SettingsScreen;
