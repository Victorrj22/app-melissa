import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Divider, Portal, Dialog, List, Button, Card, Text } from 'react-native-paper';
import { TextInput } from 'react-native-paper';
import Header from '@components/Header';
import WelcomeCard from '@components/WelcomeCard';
import TemperatureCard from '@components/TemperatureCard';
import TaskListCard from '@components/TaskListCard';
import UpcomingHolidaysCard from '@components/UpcomingHolidaysCard';
import YearCalendarModal from '@components/YearCalendarModal';
import { getUpcomingHolidays, type UpcomingHolidayItem, getHolidayDateStringsForYear } from '@utils/holidayLoader';
import BottomNav from '@components/BottomNav';
import tasksService from '../services/TasksService';
import { Task } from '@components/TaskItem';
import { colors } from '@theme/colors';
import melissaService from '../services/TemperatureService';

type HomeScreenProps = { onManageTasks?: () => void };

const HomeScreen: React.FC<HomeScreenProps> = ({ onManageTasks }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const toggleTask = (taskId: string) =>
    setTasks((previous) =>
      previous.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

  const [temperature, setTemperature] = useState<number>(0);
  const [temperatureLoading, setTemperatureLoading] = useState<boolean>(false);
  const [location, setLocation] = useState<string>('Porto Real');
  const [locationDialogVisible, setLocationDialogVisible] = useState<boolean>(false);

  const loadTemperature = async (cityParam?: string) => {
    setTemperatureLoading(true);
    try {
      const effectiveLocation = cityParam ?? location;
      const result = await melissaService.Temperatura({ city: effectiveLocation });
      if (!Number.isNaN(result.temperature)) {
        setTemperature(Math.round(result.temperature));
      }
    } catch (e) {
      console.warn('[Melissa] Falha ao buscar temperatura:', e);
    } finally {
      setTemperatureLoading(false);
    }
  };
  const loadTasks = async () => {
    try {
      const dtos = await tasksService.GetAllTasks();
      const withItems = await Promise.all(
        dtos.map(async (t) => {
          try {
            const items = await tasksService.GetAllItensTasks(t.id);
            return { t, hasPending: items.some((i) => !i.isCompleted && !i.isCanceled) };
          } catch {
            // Em caso de erro ao buscar itens, não considerar como pendente para evitar falsos positivos
            return { t, hasPending: false };
          }
        })
      );
      const pending = withItems.filter((x) => x.hasPending).map((x) => x.t);
      const mapped: Task[] = pending.map((t) => ({
        id: String(t.id),
        title: t.title,
        dueDate: new Date(t.includedAt),
        completed: false
      }));
      setTasks(mapped.slice(0, 2));
    } catch (e) {
      console.warn('[Tasks] Falha ao carregar tarefas:', e);
      // Em caso de falha geral, não exibir tarefas para não confundir o usuário
      setTasks([]);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Load temperature when screen mounts
  useEffect(() => {
    loadTemperature();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentYear = new Date().getFullYear();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<string[]>([]);
  const openCalendar = async () => {
    const dates = await getHolidayDateStringsForYear(currentYear);
    setMarkedDates(dates);
    setCalendarVisible(true);
  };

    const [addTaskVisible, setAddTaskVisible] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const onAddTask = () => setAddTaskVisible(true);
  const submitNewTask = async () => {
    if (!newTaskTitle.trim()) { setAddTaskVisible(false); return; }
    try {
      await tasksService.AddNewTask({ taskTitle: newTaskTitle.trim(), taskDescription: newTaskDesc.trim() || undefined });
      setAddTaskVisible(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      loadTasks();
    } catch (e) {
      console.warn('[Tasks] Falha ao adicionar tarefa:', e);
    }
  };
  const [holidays, setHolidays] = useState<UpcomingHolidayItem[]>([]);
  useEffect(() => {
    (async () => {
      const nextTwo = await getUpcomingHolidays(2);
      setHolidays(nextTwo);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header userName="Melissa" />
        <WelcomeCard />
                <TemperatureCard
          temperature={temperature}
          location={location}
          loading={temperatureLoading}
          onSelectLocation={() => setLocationDialogVisible(true)}
          onRefresh={() => loadTemperature()}
        />

        <Portal>
          <Dialog visible={locationDialogVisible} onDismiss={() => setLocationDialogVisible(false)}>
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
                <List.Item
                  title="São Paulo"
                  onPress={() => {
                    setLocation('São Paulo');
                    setLocationDialogVisible(false);
                    loadTemperature('São Paulo');
                  }}
                />
              </List.Section>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setLocationDialogVisible(false)}>Cancelar</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={addTaskVisible} onDismiss={() => setAddTaskVisible(false)}>
            <Dialog.Title>Nova Tarefa</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Titulo"
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                mode="outlined"
                style={{ marginBottom: 8 }}
              />
              <TextInput
                label="Descricao (opcional)"
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAddTaskVisible(false)}>Cancelar</Button>
              <Button onPress={submitNewTask}>Adicionar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {tasks.length === 0 ? (
          <Card style={{ backgroundColor: colors.surface, borderRadius: 18, padding: 16 }}>
            <Text style={{ color: colors.textSecondary }}>Nenhuma tarefa pendente.</Text>
            <Button mode="outlined" style={{ marginTop: 12 }} onPress={onManageTasks}>
              Gerenciar tarefas
            </Button>
          </Card>
        ) : (
          <TaskListCard
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={onAddTask}
            onManageTasks={onManageTasks}
          />
        )}

        <UpcomingHolidaysCard holidays={holidays} onOpenCalendar={openCalendar} /><YearCalendarModal visible={calendarVisible} onDismiss={() => setCalendarVisible(false)} year={currentYear} markedDates={markedDates} />
      </ScrollView>
      <Divider />
      <BottomNav onPressTasks={onManageTasks} />
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











