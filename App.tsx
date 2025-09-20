import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from '@screens/HomeScreen';
import { theme } from '@theme/index';

const App: React.FC = () => (
  <PaperProvider theme={theme}>
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  </PaperProvider>
);

export default App;
