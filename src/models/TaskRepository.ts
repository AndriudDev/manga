// Repositorio de Tareas — MangaTools (capa Model)
// Acceso a datos CRUD sobre AsyncStorage, por usuario propietario.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TodoTask } from './Task';

const TASKS_PREFIX = '@mangatools/tasks';

// Namespace por usuario: el identificador (correo) aísla la lista de cada sesión.
function tasksKey(owner: string): string {
  return `${TASKS_PREFIX}/${owner}`;
}

function parseTasks(raw: string | null): TodoTask[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as TodoTask[];
  } catch {
    return [];
  }
}

export const TaskRepository = {
  async getTasks(owner: string): Promise<TodoTask[]> {
    const raw = await AsyncStorage.getItem(tasksKey(owner));
    return parseTasks(raw);
  },

  async saveTasks(owner: string, tasks: TodoTask[]): Promise<void> {
    await AsyncStorage.setItem(tasksKey(owner), JSON.stringify(tasks));
  },

  async addTask(owner: string, task: TodoTask): Promise<void> {
    const tasks = await this.getTasks(owner);
    tasks.push(task);
    await this.saveTasks(owner, tasks);
  },

  async deleteTask(owner: string, id: string): Promise<void> {
    const tasks = await this.getTasks(owner);
    await this.saveTasks(
      owner,
      tasks.filter((task) => task.id !== id),
    );
  },

  async updateTask(
    owner: string,
    id: string,
    changes: Partial<Pick<TodoTask, 'title' | 'completed'>>,
  ): Promise<void> {
    const tasks = await this.getTasks(owner);
    await this.saveTasks(
      owner,
      tasks.map((task) => (task.id === id ? { ...task, ...changes } : task)),
    );
  },
};
