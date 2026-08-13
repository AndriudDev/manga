// Controlador de Tareas — MangaTools
// Orquesta el CRUD de la To-Do List sobre el repositorio, ligado a la sesión activa.

import { AuthController } from './AuthController';
import { TaskRepository } from '../models/TaskRepository';
import { TaskApi } from '../models/TaskApi';
import { TodoTask, createTask } from '../models/Task';
import { persistPhoto, deletePhoto } from '../models/PhotoStore';

/** Resumen del resultado de una sincronización con el servicio web. */
export interface SyncResult {
  created: number;
  updated: number;
}

export const TaskController = {
  /**
   * Identificador del propietario (usuario con sesión) o undefined sin sesión.
   */
  async getOwner(): Promise<string | undefined> {
    const user = await AuthController.getCurrentUser();
    return user ? user.email : undefined;
  },

  /** READ — lista de pendientes del usuario actual. */
  async getTasks(): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    return TaskRepository.getTasks(owner);
  },

  /** CREATE — crea la tarea (con foto y ubicación opcionales) y devuelve la lista actualizada. */
  async addTask(
    title: string,
    photoUri?: string,
    location?: TodoTask['location'],
  ): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner || title.trim().length === 0) return TaskRepository.getTasks(owner ?? '');
    const task = createTask(title, photoUri, location);
    await TaskRepository.addTask(owner, task);
    return TaskRepository.getTasks(owner);
  },

  /** UPDATE — alterna el estado completado de una tarea. */
  async toggleTask(id: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    const tasks = await TaskRepository.getTasks(owner);
    const target = tasks.find((task) => task.id === id);
    if (target) {
      await TaskRepository.updateTask(owner, id, { completed: !target.completed });
    }
    return TaskRepository.getTasks(owner);
  },

  /** UPDATE — modifica el título de una tarea (ignora valores vacíos). */
  async updateTitle(id: string, title: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    const trimmed = title.trim();
    const tasks = await TaskRepository.getTasks(owner);
    if (trimmed.length > 0 && tasks.some((task) => task.id === id)) {
      await TaskRepository.updateTask(owner, id, { title: trimmed });
    }
    return TaskRepository.getTasks(owner);
  },

  /** UPDATE — adjunta (o reemplaza) la foto de una tarea. */
  async attachPhoto(id: string, sourceUri: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    const tasks = await TaskRepository.getTasks(owner);
    const target = tasks.find((task) => task.id === id);
    if (!target) return tasks;

    const photoUri = await persistPhoto(sourceUri);
    if (target.photoUri) {
      await deletePhoto(target.photoUri);
    }
    await TaskRepository.updateTask(owner, id, { photoUri });
    return TaskRepository.getTasks(owner);
  },

  /** UPDATE — quita la foto de una tarea y elimina su archivo. */
  async clearPhoto(id: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    const tasks = await TaskRepository.getTasks(owner);
    const target = tasks.find((task) => task.id === id);
    if (target?.photoUri) {
      await deletePhoto(target.photoUri);
      await TaskRepository.updateTask(owner, id, { photoUri: undefined });
    }
    return TaskRepository.getTasks(owner);
  },

  /** DELETE — elimina una tarea (y su foto) y devuelve la lista actualizada. */
  async deleteTask(id: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner) return [];
    const tasks = await TaskRepository.getTasks(owner);
    const target = tasks.find((task) => task.id === id);
    if (target?.photoUri) {
      await deletePhoto(target.photoUri);
    }
    await TaskRepository.deleteTask(owner, id);
    return TaskRepository.getTasks(owner);
  },

  /**
   * Sincronización — sube las tareas locales al servicio web para almacenarlas
   * de forma remota. Las nuevas se crean (POST) y las ya sincronizadas se
   * actualizan (PUT) para reflejar su estado. Devuelve el resumen del proceso.
   */
  async syncToRemote(): Promise<SyncResult> {
    const owner = await this.getOwner();
    if (!owner) return { created: 0, updated: 0 };

    const tasks = await TaskRepository.getTasks(owner);
    const result: SyncResult = { created: 0, updated: 0 };

    const synced = await Promise.all(
      tasks.map(async (task): Promise<TodoTask> => {
        try {
          if (task.remoteId !== undefined) {
            const remote = await TaskApi.update(task.remoteId, task.title, task.completed);
            result.updated += 1;
            return { ...task, remoteId: remote.id };
          }
          const remote = await TaskApi.create(task.title, task.completed);
          result.created += 1;
          return { ...task, remoteId: remote.id };
        } catch {
          // No lograda: se conserva sin remoteId para reintentar en la próxima.
          return task;
        }
      }),
    );

    await TaskRepository.saveTasks(owner, synced);
    return result;
  },

  /**
   * Importación — trae tareas desde la API externa y las agrega a la lista local.
   * Evita duplicados comparando el título (insensible a mayúsculas) contra las
   * tareas ya presentes. Devuelve la cantidad de tareas nuevas importadas.
   */
  async importFromApi(): Promise<number> {
    const owner = await this.getOwner();
    if (!owner) return 0;

    const remote = await TaskApi.list();
    const tasks = await TaskRepository.getTasks(owner);
    const existingTitles = new Set(tasks.map((task) => task.title.trim().toLowerCase()));

    const added: TodoTask[] = [];
    for (const item of remote) {
      const title = item.title.trim();
      const normalized = title.toLowerCase();
      if (!title || existingTitles.has(normalized)) continue;
      existingTitles.add(normalized);
      added.push({
        id: `api-${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        completed: item.completed,
        createdAt: new Date().toISOString(),
        remoteId: item.id,
      });
    }

    if (added.length > 0) {
      await TaskRepository.saveTasks(owner, [...added, ...tasks]);
    }
    return added.length;
  },
};
