import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Appbar, ActivityIndicator, Text, List, Checkbox, Button, Portal, Dialog, TextInput } from 'react-native-paper';
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
  const [addItemVisible, setAddItemVisible] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [cancelVisible, setCancelVisible] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<TaskItemDto | null>(null);

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

  const allCompleted = useMemo(() => (items ? items.filter((i) => !i.isCanceled).every((i) => i.isCompleted) : false), [items]);

  const toggleItem = async (it: TaskItemDto) => {
    try {
      await tasksService.CompleteItenTask({ taskItenId: it.id });
      setItems((prev) => prev?.map((p) => (p.id === it.id ? { ...p, isCompleted: !p.isCompleted } : p)) || null);
    } catch (e) {
      console.warn('[Tasks] Falha ao completar item', e);
    }
  };

  const submitNewItem = async () => {
    const desc = newItemDesc.trim();
    if (!desc) { setAddItemVisible(false); return; }
    try {
      await tasksService.AddNewItenTask({ taskId: task.id, taskDescription: desc });
      setAddItemVisible(false);
      setNewItemDesc('');
      load();
    } catch (e) {
      console.warn('[Tasks] Falha ao adicionar item', e);
    }
  };

  const startCancelItem = (it: TaskItemDto) => {
    setItemToCancel(it);
    setCancelVisible(true);
  };

  const confirmCancelItem = async () => {
    if (!itemToCancel) return;
    try {
      await tasksService.CancelTaskItenById({ taskItenId: itemToCancel.id, taskId: task.id });
      setItems((prev) => (prev ? prev.filter((x) => x.id !== itemToCancel.id) : prev));
    } catch (e) {
      console.warn('[Tasks] Falha ao cancelar item', e);
    } finally {
      setCancelVisible(false);
      setItemToCancel(null);
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
        <Portal>
          <Dialog visible={addItemVisible} onDismiss={() => setAddItemVisible(false)}>
            <Dialog.Title>Novo Item</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Descrição"
                value={newItemDesc}
                onChangeText={setNewItemDesc}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setAddItemVisible(false)}>Cancelar</Button>
              <Button onPress={submitNewItem}>Adicionar</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={cancelVisible} onDismiss={() => setCancelVisible(false)}>
            <Dialog.Title>Cancelar item</Dialog.Title>
            <Dialog.Content>
              <Text>Tem certeza que deseja cancelar este item?</Text>
              {!!itemToCancel && (
                <Text style={{ marginTop: 8, color: colors.textSecondary }}>{itemToCancel.description}</Text>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setCancelVisible(false)}>Não</Button>
              <Button onPress={confirmCancelItem}>Sim, cancelar</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <Button mode="contained" style={{ margin: 12, alignSelf: 'flex-start' }} onPress={() => setAddItemVisible(true)}>
          Adicionar Item
        </Button>
        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}
        {items && (
          <List.Section>
            {items
              .filter((i) => !i.isCanceled)
              .map((i) => (
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
                right={() => (!i.isCompleted ? (
                  <Button compact onPress={() => startCancelItem(i)}>Cancelar</Button>
                ) : null)}
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



