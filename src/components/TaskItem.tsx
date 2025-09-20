import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { colors } from '@theme/colors';

export interface Task {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
}

interface TaskItemProps {
  task: Task;
  onToggle?: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => (
  <View style={styles.container}>
    <Checkbox.Android
      status={task.completed ? 'checked' : 'unchecked'}
      onPress={() => onToggle?.(task.id)}
    />
    <View>
      <Text variant="bodyLarge" style={[styles.title, task.completed && styles.completed]}>
        {task.title}
      </Text>
      <Text variant="labelSmall" style={styles.date}>
        {task.dueDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600'
  },
  completed: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary
  },
  date: {
    color: colors.textSecondary,
    textTransform: 'capitalize'
  }
});

export default TaskItem;
