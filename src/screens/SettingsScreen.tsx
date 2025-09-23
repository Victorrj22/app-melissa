import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, TextInput, Button, Text, Card } from 'react-native-paper';
import { colors } from '@theme/colors';

export interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [server, setServer] = useState('');
  const [email, setEmail] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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
                placeholder="AAAA-MM-DD"
                value={fromDate}
                onChangeText={setFromDate}
              />
              <TextInput
                style={{ flex: 1 }}
                mode="outlined"
                label="Até"
                placeholder="AAAA-MM-DD"
                value={toDate}
                onChangeText={setToDate}
              />
              <Button mode="contained" style={{ alignSelf: 'center', marginLeft: 4 }} onPress={() => undefined}>
                Solicitar
              </Button>
            </View>
          </Card.Content>
        </Card>
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
