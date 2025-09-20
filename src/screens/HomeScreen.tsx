import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider } from 'react-native-paper';
import Header from '@components/Header';
import WelcomeCard from '@components/WelcomeCard';
import TemperatureCard from '@components/TemperatureCard';
import TaskListCard from '@components/TaskListCard';
import UpcomingHolidaysCard from '@components/UpcomingHolidaysCard';
import BottomNav from '@components/BottomNav';
import { Task } from '@components/TaskItem';
import { colors } from '@theme/colors';

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header userName="Melissa" />
        <WelcomeCard />
        <TemperatureCard
          temperature={22}
          location="Porto Real, RJ"
          onSelectLocation={() => undefined}
          onRefresh={() => undefined}
        />
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
