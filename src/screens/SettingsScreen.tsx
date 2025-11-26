import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Appbar, TextInput, Button, Text, Card } from 'react-native-paper';
import { colors } from '@theme/colors';
import DatePickerModal from '@components/DatePickerModal';
import conversationService from '../services/ConversationService';
import userSettings from '../services/UserSettings';

export interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const initialSettings = userSettings.getSnapshot();
  const [server, setServer] = useState(initialSettings.server || '');
  const [email, setEmail] = useState(initialSettings.email || '');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [fromVisible, setFromVisible] = useState(false);
  const [toVisible, setToVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    userSettings
      .init()
      .then(() => {
        if (cancelled) return;
        const snapshot = userSettings.getSnapshot();
        setServer(snapshot.server || '');
        setEmail(snapshot.email || '');
      })
      .catch((err) => {
        console.warn('[SettingsScreen] Falha ao carregar as configurações.', err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistServer = useCallback(async (value: string) => {
    try {
      const updated = await userSettings.setServerHost(value);
      setServer(updated.server || '');
    } catch (err) {
      console.warn('[SettingsScreen] Failed to persist server.', err);
    }
  }, []);

  const persistEmail = useCallback(async (value: string) => {
    try {
      const updated = await userSettings.setEmail(value);
      setEmail(updated.email || '');
    } catch (err) {
      console.warn('[SettingsScreen] Failed to persist email.', err);
    }
  }, []);

  const formatDate = (d: Date | null) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const onSubmitHistory = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Atenção', 'Informe um email.');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Atenção', 'Selecione as datas De e Até.');
      return;
    }
    try {
      await persistEmail(trimmedEmail);
      const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
      const end = endOfDay(toDate);
      await conversationService.SendEmailConversationHistoryByPeriod({
        email: trimmedEmail,
        startPeriod: start,
        endPeriod: end
      });
      Alert.alert('Solicitação enviada', 'O histórico será enviado por email.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : undefined;
      Alert.alert('Falha', message || 'Falha ao solicitar histórico.');
    }
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
            <View style={styles.inputRow}>
              <TextInput
                mode="outlined"
                label="Servidor"
                placeholder="https://melissa.alluneed.com.br"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                value={server}
                onChangeText={setServer}
                style={styles.inputFlex}
              />
              <Button
                mode="contained"
                onPress={() => { void persistServer(server); }}
                style={styles.confirmButton}
              >
                Confirmar
              </Button>
            </View>
            <Button
              mode="outlined"
              onPress={async () => {
                try {
                  console.log('[SettingsScreen] === Teste de Conexão Iniciado ===');
                  console.log('[SettingsScreen] Current settings:', userSettings.getSnapshot());

                  const baseUrl = userSettings.getBaseUrl();
                  const testUrl = `${baseUrl}/health`;

                  console.log('[SettingsScreen] Testing connection to:', testUrl);
                  console.log('[SettingsScreen] Full URL breakdown:', {
                    baseUrl,
                    endpoint: '/health',
                    fullUrl: testUrl
                  });

                  Alert.alert('Testando...', `Conectando em ${testUrl}`);

                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => {
                    console.log('[SettingsScreen] Request timeout after 10 seconds');
                    controller.abort();
                  }, 10000);

                  const response = await fetch(testUrl, {
                    method: 'GET',
                    headers: {
                      'Accept': 'text/plain',
                      'User-Agent': 'Melissa-Mobile-App'
                    },
                    signal: controller.signal
                  });

                  clearTimeout(timeoutId);

                  const text = await response.text();
                  console.log('[SettingsScreen] Test result:', {
                    status: response.status,
                    statusText: response.statusText,
                    text,
                    headers: Object.fromEntries(response.headers.entries())
                  });

                  if (response.ok) {
                    Alert.alert('Sucesso! ✅', `Servidor respondeu: ${text}\n\nStatus: ${response.status}`);
                  } else {
                    Alert.alert('Erro ❌', `Status ${response.status}: ${text}`);
                  }
                } catch (err: unknown) {
                  const message = err instanceof Error ? err.message : String(err);
                  console.error('[SettingsScreen] Test failed:', err);
                  console.error('[SettingsScreen] Error details:', {
                    name: (err as Error)?.name,
                    message: (err as Error)?.message,
                    stack: (err as Error)?.stack
                  });
                  Alert.alert('Falha na conexão ❌', `Erro: ${message}\n\nVerifique os logs do console para mais detalhes.`);
                }
              }}
              style={{ marginTop: 8 }}
            >
              Testar Conexão
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title title="Email" />
          <Card.Content>
            <View style={styles.inputRow}>
              <TextInput
                mode="outlined"
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                style={styles.inputFlex}
              />
              <Button
                mode="contained"
                onPress={() => { void persistEmail(email); }}
                style={styles.confirmButton}
              >
                Confirmar
              </Button>
            </View>
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
              <Button mode="contained" style={{ alignSelf: 'center', marginLeft: 4 }} onPress={onSubmitHistory}>
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
  card: { backgroundColor: colors.surface, borderRadius: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputFlex: { flex: 1 },
  confirmButton: { marginTop: 4, alignSelf: 'flex-start' }
});

export default SettingsScreen;
