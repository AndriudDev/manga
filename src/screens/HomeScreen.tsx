import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { TaskController } from '../controllers/TaskController';
import { TodoTask } from '../models/Task';

interface HomeScreenProps {
  userName?: string;
  onLogout: () => void;
}

export default function HomeScreen({ userName, onLogout }: HomeScreenProps) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setTasks(await TaskController.getTasks());
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const handleAdd = async () => {
    if (input.trim().length === 0) return;
    const updated = await TaskController.addTask(input);
    setTasks(updated);
    setInput('');
  };

  const handleToggle = async (id: string) => {
    setTasks(await TaskController.toggleTask(id));
  };

  const handleDelete = async (id: string) => {
    setTasks(await TaskController.deleteTask(id));
  };

  const pendingCount = tasks.filter((task) => !task.completed).length;

  const renderItem = ({ item }: { item: TodoTask }) => (
    <View style={styles.taskRow}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checkboxDone]}
        activeOpacity={0.7}
        onPress={() => handleToggle(item.id)}
      >
        {item.completed ? (
          <Ionicons name="checkmark" size={16} color={Colors.textPrimary} />
        ) : null}
      </TouchableOpacity>
      <Text
        style={[styles.taskTitle, item.completed && styles.taskTitleDone]}
        numberOfLines={2}
      >
        {item.title}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        activeOpacity={0.7}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.backgroundPrimary} />

      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>¡Hola, {userName ?? 'Lector'}!</Text>
          <Text style={styles.subtitle}>
            Tienes {pendingCount} tarea{pendingCount === 1 ? '' : 's'} pendiente
            {pendingCount === 1 ? '' : 's'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={onLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Entrada nueva tarea */}
      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Agregar nueva tarea..."
            placeholderTextColor={Colors.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
        </View>
        <TouchableOpacity
          style={[styles.addButton, input.trim().length === 0 && styles.addButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleAdd}
          disabled={input.trim().length === 0}
        >
          <Ionicons name="add" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Lista de tareas */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accentPrimary} size="large" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin tareas por ahora</Text>
              <Text style={styles.emptySubtitle}>
                Agrega tu primera tarea usando el campo de arriba.
              </Text>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    paddingTop: 60,
  },

  // Encabezado
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfacePrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Entrada
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    height: '100%',
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },

  // Lista
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.accentSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: Colors.accentSecondary,
    borderColor: Colors.accentSecondary,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  taskTitleDone: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 4,
  },
  separator: {
    height: 10,
  },

  // Estados
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
