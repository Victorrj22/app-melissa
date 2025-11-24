import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import TaskItem, { Task } from './TaskItem';
import { colors } from '@theme/colors';
import { Feather } from '@expo/vector-icons';

interface TaskListCardProps {
  tasks: Task[];
  onAddTask?: () => void;
  onManageTasks?: () => void;
  onToggleTask?: (taskId: string) => void;
}

const TaskListCard: React.FC<TaskListCardProps> = ({ tasks, onAddTask, onManageTasks, onToggleTask }) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.iconWrapper}>
            <Feather name="check-circle" size={20} color={colors.primary} />
          </View>
          <Text style={styles.title}>Tarefas Pendentes</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddTask}>
          <Feather name="plus" size={18} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tasks.map((task, index) => (
          <View key={task.id}>
            <TaskItem task={task} onToggle={onToggleTask} />
            {index < tasks.length - 1 && <Divider style={styles.divider} />}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.manageButton} onPress={onManageTasks}>
          <Text style={styles.manageButtonText}>Ver todas as tarefas</Text>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
      },
      android: {
        elevation: 4
      }
    })
  },
  content: {
    gap: 0
  },
  divider: {
    backgroundColor: colors.divider,
    marginVertical: 8
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary
  }
});

export default TaskListCard;
