import TasksScreen from '@screens/TasksScreen';
import TaskItemsScreen from '@screens/TaskItemsScreen';
import { TaskDto } from './src/services/TasksService';
import React, { useEffect, useState } from 'react';
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
  const [route, setRoute] = useState<{ name: 'home' } | { name: 'tasks' } | { name: 'taskItems'; task: TaskDto }>({ name: 'home' });

  const openTasks = () => setRoute({ name: 'tasks' });
  const openTaskItems = (task: TaskDto) => setRoute({ name: 'taskItems', task });
  const goHome = () => setRoute({ name: 'home' });
  const goTasks = () => setRoute({ name: 'tasks' });

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        {route.name === 'home' && <HomeScreen onManageTasks={openTasks} />}
        {route.name === 'tasks' && (
          <TasksScreen onBack={goHome} onOpenTask={openTaskItems} />
        )}
        {route.name === 'taskItems' && (
          <TaskItemsScreen task={route.task} onBack={goTasks} />
        )}
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;

