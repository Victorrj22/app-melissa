import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

const WelcomeCard: React.FC = () => (
  <LinearGradient
    colors={[colors.primary, colors.primaryLight]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.card}
  >
    <View style={styles.iconContainer}>
      <Feather name="sparkles" size={24} color={colors.textOnPrimary} />
    </View>
    <View style={styles.content}>
      <Text style={styles.title}>
        Bem-vindo à Melissa
      </Text>
      <Text style={styles.subtitle}>
        Sua assistente pessoal inteligente. Todos os dados são processados com segurança e privacidade.
      </Text>
    </View>
  </LinearGradient>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    color: colors.textOnPrimary,
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  }
});

export default WelcomeCard;
