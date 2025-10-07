import TasksScreen from '@screens/TasksScreen';
import TaskItemsScreen from '@screens/TaskItemsScreen';
import SettingsScreen from '@screens/SettingsScreen';
import { TaskDto } from './src/services/TasksService';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from '@screens/HomeScreen';
import holidaysService from './src/services/HolidaysService';
import { theme } from '@theme/index';
import audioChatService from '@services/AudioChatService';

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
  const [route, setRoute] = useState<
    | { name: 'home' }
    | { name: 'tasks' }
    | { name: 'taskItems'; task: TaskDto }
    | { name: 'settings' }
  >({ name: 'home' });

  const openTasks = () => setRoute({ name: 'tasks' });
  const openTaskItems = (task: TaskDto) => setRoute({ name: 'taskItems', task });
  const goHome = () => setRoute({ name: 'home' });
  const goTasks = () => setRoute({ name: 'tasks' });
  const openSettings = () => setRoute({ name: 'settings' });

  const startVoice = useCallback(async () => {
    try {
      await audioChatService.startStreaming();
    } catch (err) {
      console.warn('[AudioChat] Falha ao iniciar transmissão.', err);
      const message = err instanceof Error ? err.message : undefined;
      Alert.alert('Falha', message || 'Não foi possível iniciar a transmissão de áudio.');
    }
  }, []);

  const stopVoice = useCallback(async () => {
    try {
      await audioChatService.stopStreaming();
    } catch (err) {
      console.warn('[AudioChat] Falha ao finalizar transmissão.', err);
    }
  }, []);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        {route.name === 'home' && (
          <HomeScreen
            onManageTasks={openTasks}
            onOpenSettings={openSettings}
            onStartVoice={startVoice}
            onStopVoice={stopVoice}
          />
        )}
        {route.name === 'tasks' && (
          <TasksScreen
            onBack={goHome}
            onOpenTask={openTaskItems}
            onStartVoice={startVoice}
            onStopVoice={stopVoice}
          />
        )}
        {route.name === 'taskItems' && (
          <TaskItemsScreen task={route.task} onBack={goTasks} />
        )}
        {route.name === 'settings' && (
          <SettingsScreen onBack={goHome} />
        )}
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;

