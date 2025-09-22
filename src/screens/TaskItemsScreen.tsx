import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, ActivityIndicator, Text, List, Checkbox, Button } from 'react-native-paper';
import { colors } from '@theme/colors';
import tasksService, { TaskDto, TaskItemDto } from '../services/TasksService';

export interface TaskItemsScreenProps {
  task: TaskDto;
  onBack: () => void;
}

const TaskItemsScreen: React.FC<TaskItemsScreenProps> = ({ task, onBack }) => {
  const [items, setItems] = useState<TaskItemDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.GetAllItensTasks(task.id);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Falha ao buscar itens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [task.id]);

  const allCompleted = useMemo(() => (items ? items.every((i) => i.isCompleted) : false), [items]);

  const toggleItem = async (it: TaskItemDto) => {
    try {
      await tasksService.CompleteItenTask({ taskItenId: it.id });
      setItems((prev) => prev?.map((p) => (p.id === it.id ? { ...p, isCompleted: !p.isCompleted } : p)) || null);
    } catch (e) {
      console.warn('[Tasks] Falha ao completar item', e);
    }
  };

  return (
    <View style={styles.container}>
            <Appbar.Header>
        <Appbar.Action onPress={onBack} icon={(props) => (
          <Image source={require("../../assets/back_icon.png")} style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }} resizeMode="contain" />
        )} />
        <Appbar.Content title={task.title} titleStyle={allCompleted ? styles.strikeHeader : undefined} />
        <Appbar.Action onPress={load} icon={(props) => (
          <Image source={require("../../assets/refresh_icon.png")} style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }} resizeMode="contain" />
        )} />
      </Appbar.Header>
      <View style={styles.content}>
        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}
        {items && (
          <List.Section>
            {items.map((i) => (
              <List.Item
                key={i.id}
                title={i.description}
                titleStyle={i.isCompleted ? styles.strikeText : undefined}
                left={(props) => (
                  <Checkbox
                    status={i.isCompleted ? 'checked' : 'unchecked'}
                    onPress={() => toggleItem(i)}
                  />
                )}
              />
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
  error: { color: 'crimson', padding: 12 },
  strikeText: { textDecorationLine: 'line-through', color: colors.textSecondary },
  strikeHeader: { textDecorationLine: 'line-through' }
});

export default TaskItemsScreen;



