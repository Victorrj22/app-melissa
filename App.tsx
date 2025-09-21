import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from '@screens/HomeScreen';
import holidaysService from './src/services/HolidaysService';
import { theme } from '@theme/index';

const App: React.FC = () => {
  useEffect(() => {
    const now = new Date();
    const isJanFirst = now.getMonth() === 0 && now.getDate() === 1;
    if (isJanFirst) {
      holidaysService.exportNationalHolidaysToTxt().catch((e) => {
        console.warn('[Holidays] Export failed:', e);
      });
    }
  }, []);
  return (
  <PaperProvider theme={theme}>
    <SafeAreaProvider>
      <HomeScreen />
    </SafeAreaProvider>
  </PaperProvider>
  );
};

export default App;


