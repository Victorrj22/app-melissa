import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import TaskItem, { Task } from './TaskItem';
import { colors } from '@theme/colors';

interface TaskListCardProps {
  tasks: Task[];
  onAddTask?: () => void;
  onManageTasks?: () => void;
  onToggleTask?: (taskId: string) => void;
}

const TaskListCard: React.FC<TaskListCardProps> = ({ tasks, onAddTask, onManageTasks, onToggleTask }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <Card style={styles.card}>
      <Card.Title
        title="Tarefas"
        titleStyle={styles.title}
        right={() => (
          <Button mode="contained" onPress={onAddTask}>
            Add Tarefa
          </Button>
        )}
      />
      <Card.Content>
        {tasks.map((task, index) => (
          <View key={task.id}>
            <TaskItem task={task} onToggle={onToggleTask} />
            {index < tasks.length - 1 && <Divider />}
          </View>
        ))}
        <Button mode="outlined" style={styles.manageButton} onPress={onManageTasks}>
          Gerenciar tarefas
        </Button>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    marginBottom: 16,
    borderRadius: 18
  },
  title: {
    fontWeight: '700',
    color: colors.textPrimary
  },
  manageButton: {
    marginTop: 12
  }
});

export default TaskListCard;
