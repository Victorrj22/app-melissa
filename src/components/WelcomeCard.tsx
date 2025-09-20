import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

const WelcomeCard: React.FC = () => (
  <Card style={styles.card} mode="contained">
    <Card.Content>
      <Text variant="titleLarge" style={styles.title}>
        Bem-vindo à Melissa
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Todos os dados são processados localmente no seu dispositivo para garantir total privacidade e segurança.
      </Text>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 18
  },
  title: {
    fontWeight: '700',
    marginBottom: 6,
    color: colors.textPrimary
  },
  subtitle: {
    color: colors.textSecondary
  }
});

export default WelcomeCard;
