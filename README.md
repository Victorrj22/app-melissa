# Melissa - Assistente Pessoal

Aplicativo mobile construído com React Native (Expo) que replica o layout proposto para a assistente Melissa utilizando bibliotecas de UI prontas.

## Tecnologias

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons)
- [TypeScript](https://www.typescriptlang.org/)

## Executando o projeto

```bash
npm install
npx expo start -c
```

Depois utilize o aplicativo Expo Go ou um emulador para visualizar a aplicação.

## Estrutura

```
src/
  components/   # Componentes reutilizáveis da interface
  screens/      # Telas da aplicação
  theme/        # Definições de tema e cores
  utils/        # Funções utilitárias
```

## Layout

A tela inicial apresenta:

- Cabeçalho com identidade da assistente e ações rápidas.
- Cartão de boas-vindas com informações sobre privacidade.
- Cartão de temperatura com seleção de local.
- Cartão de tarefas com lista e ações de gerenciamento.
- Cartão de próximos feriados.
- Barra de navegação inferior.
