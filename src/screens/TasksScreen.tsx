import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, ActivityIndicator, Text, List, Button } from 'react-native-paper';
import { colors } from '@theme/colors';
import tasksService, { TaskDto } from '../services/TasksService';

export interface TasksScreenProps {
  onBack: () => void;
  onOpenTask: (task: TaskDto) => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ onBack, onOpenTask }) => {
  const [tasks, setTasks] = useState<TaskDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.GetAllTasks();
      setTasks(data);
    } catch (e: any) {
      setError(e?.message || 'Falha ao buscar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="Tarefas" />
        <Appbar.Action icon="refresh" onPress={load} />
      </Appbar.Header>
      <View style={styles.content}>
        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}
        {tasks && (
          <List.Section>
            {tasks.map((t) => (
              <TouchableOpacity key={t.id} onPress={() => onOpenTask(t)}>
                <List.Item
                  title={t.title}
                  description={t.description}
                  right={(props) => <List.Icon {...props} icon="chevron-right" />}
                />
              </TouchableOpacity>
            ))}
          </List.Section>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  error: { color: 'crimson', padding: 12 }
});

export default TasksScreen;

