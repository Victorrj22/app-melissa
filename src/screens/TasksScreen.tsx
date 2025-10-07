import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Appbar, ActivityIndicator, Text, List, Button, SegmentedButtons } from 'react-native-paper';
import { colors } from '@theme/colors';
import tasksService, { TaskDto } from '../services/TasksService';
import userSettings from '../services/UserSettings';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@components/BottomNav';

export interface TasksScreenProps {
  onBack: () => void;
  onOpenTask: (task: TaskDto) => void;
  onStartVoice?: () => void;
  onStopVoice?: () => void;
}

const TasksScreen: React.FC<TasksScreenProps> = ({ onBack, onOpenTask, onStartVoice, onStopVoice }) => {
  const [allTasks, setAllTasks] = useState<TaskDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'open' | 'archived'>('open');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksService.GetAllTasks();
      setAllTasks(data);
    } catch (e: any) {
      setError(e?.message || 'Falha ao buscar tarefas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const archiveTask = async (t: TaskDto) => {
    try {
      await tasksService.ArchiveTaskById({ taskId: t.id });
      load();
    } catch (e) {
      console.warn('[Tasks] Falha ao arquivar tarefa', e);
    }
  };

  const sendTask = async (t: TaskDto) => {
    try {
      await userSettings.init();
      const snapshot = userSettings.getSnapshot();
      const email = (snapshot.email || '').trim();
      if (!email) {
        Alert.alert('Atenção', 'Configure um email na tela de configurações antes de enviar a tarefa.');
        return;
      }

      await tasksService.SendTaskByEmail({ email, taskId: t.id, taskName: t.title });
      Alert.alert('Sucesso', 'A tarefa foi enviada por email.');
    } catch (e) {
      console.warn('[Tasks] Falha ao enviar tarefa por email', e);
      const message = e instanceof Error ? e.message : undefined;
      Alert.alert('Falha', message || 'Não foi possível enviar a tarefa.');
    }
  };

  const unarchiveTask = async (t: TaskDto) => {
    try {
      await tasksService.UnarchiveTaskById({ taskId: t.id });
      load();
    } catch (e) {
      console.warn('[Tasks] Falha ao desarquivar tarefa', e);
    }
  };

  const tasks = useMemo(() => {
    const list = allTasks ?? [];
    return list.filter((t) => (tab === 'archived' ? !!t.isArchived : !t.isArchived));
  }, [allTasks, tab]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Action
            onPress={onBack}
            icon={(props) => (
              <Image
                source={require('../../assets/back_icon.png')}
                style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }}
                resizeMode="contain"
              />
            )}
          />
          <Appbar.Content title="Tarefas" />
          <Appbar.Action
            onPress={load}
            icon={(props) => (
              <Image
                source={require('../../assets/refresh_icon.png')}
                style={{ width: props.size ?? 24, height: props.size ?? 24, tintColor: props.color }}
                resizeMode="contain"
              />
            )}
          />
        </Appbar.Header>
        <View style={styles.content}>
          <View style={{ paddingHorizontal: 12, paddingTop: 8 }}>
            <SegmentedButtons
              value={tab}
              onValueChange={(v) => setTab(v as 'open' | 'archived')}
              buttons={[
                { value: 'open', label: 'Abertas' },
                { value: 'archived', label: 'Arquivadas' }
              ]}
            />
          </View>
          {loading && <ActivityIndicator />}
          {error && <Text style={styles.error}>{error}</Text>}
          {tasks && (
            <List.Section>
              {tasks.map((t) => (
                <TouchableOpacity key={t.id} onPress={() => onOpenTask(t)}>
                  <List.Item
                    title={t.title}
                    description={t.description}
                    right={(props) => (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {tab === 'open' ? (
                          <View style={styles.actionGroup}>
                            <Button compact onPress={() => sendTask(t)}>Enviar</Button>
                            <Button compact onPress={() => archiveTask(t)}>Arquivar</Button>
                          </View>
                        ) : (
                          <Button compact onPress={() => unarchiveTask(t)}>Desarquivar</Button>
                        )}
                        <Image
                          source={require('../../assets/chevron_right_icon.png')}
                          style={{ width: 24, height: 24, tintColor: props.color, marginLeft: 8 }}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                  />
                </TouchableOpacity>
              ))}
            </List.Section>
          )}
        </View>
      </View>
      <BottomNav
        active="tasks"
        onPressHome={onBack}
        onMicrophonePressIn={onStartVoice}
        onMicrophonePressOut={onStopVoice}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  error: { color: 'crimson', padding: 12 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 }
});

export default TasksScreen;































