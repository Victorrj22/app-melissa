import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider, Portal, Dialog, List, Button } from 'react-native-paper';
import Header from '@components/Header';
import WelcomeCard from '@components/WelcomeCard';
import TemperatureCard from '@components/TemperatureCard';
import TaskListCard from '@components/TaskListCard';
import UpcomingHolidaysCard from '@components/UpcomingHolidaysCard';
import BottomNav from '@components/BottomNav';
import { Task } from '@components/TaskItem';
import { colors } from '@theme/colors';
import melissaService from '../services/MelissaService';

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Revisar relatórios trimestrais',
      dueDate: new Date('2025-09-17'),
      completed: false
    },
    {
      id: '2',
      title: 'Enviar feedback da equipe',
      dueDate: new Date('2025-09-22'),
      completed: true
    }
  ]);

  const holidays = useMemo(
    () => [
      { id: '1', name: 'Ano novo', date: new Date('2025-01-01') },
      { id: '2', name: 'Natal', date: new Date('2025-12-25') }
    ],
    []
  );

  const toggleTask = (taskId: string) =>
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

  const [temperature, setTemperature] = useState<number>(0);
  const [location, setLocation] = useState<string>('Porto Real');
  const [locationDialogVisible, setLocationDialogVisible] = useState<boolean>(false);

  const loadTemperature = async (cityParam?: string) => {
    try {
      const effectiveLocation = cityParam ?? location;
      const result = await melissaService.Temperatura({ city: effectiveLocation });
      if (!Number.isNaN(result.temperature)) {
        setTemperature(Math.round(result.temperature));
      }
    } catch (e) {
      console.warn('[Melissa] Falha ao buscar temperatura:', e);
    }
  };

  useEffect(() => {
    loadTemperature();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header userName="Melissa" />
        <WelcomeCard />
        <TemperatureCard
          temperature={temperature}
          location={location}
          onSelectLocation={() => setLocationDialogVisible(true)}
          onRefresh={() => loadTemperature()}
        />

        <Portal>
          <Dialog
            visible={locationDialogVisible}
            onDismiss={() => setLocationDialogVisible(false)}
          >
            <Dialog.Title>Selecionar Local</Dialog.Title>
            <Dialog.Content>
              <List.Section>
                <List.Item
                  title="Porto Real"
                  onPress={() => {
                    setLocation('Porto Real');
                    setLocationDialogVisible(false);
                    loadTemperature('Porto Real');
                  }}
                />
                <List.Item
                  title="Resende"
                  onPress={() => {
                    setLocation('Resende');
                    setLocationDialogVisible(false);
                    loadTemperature('Resende');
                  }}
                />
              </List.Section>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLocationDialogVisible(false)}>Cancelar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <TaskListCard
          tasks={tasks}
          onToggleTask={toggleTask}
          onAddTask={() => undefined}
          onManageTasks={() => undefined}
        />
        <UpcomingHolidaysCard holidays={holidays} />
      </ScrollView>
      <Divider />
      <BottomNav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
    gap: 4
  }
});

export default HomeScreen;
