// Controlador de Tareas — MangaTools
// Orquesta el CRUD de la To-Do List sobre el repositorio, ligado a la sesión activa.

import { AuthController } from './AuthController';
import { TaskRepository } from '../models/TaskRepository';
import { TodoTask, createTask } from '../models/Task';
import { persistPhoto, deletePhoto } from '../models/PhotoStore';

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

  /** CREATE — crea la tarea (con foto opcional) y devuelve la lista actualizada. */
  async addTask(title: string, photoUri?: string): Promise<TodoTask[]> {
    const owner = await this.getOwner();
    if (!owner || title.trim().length === 0) return TaskRepository.getTasks(owner ?? '');
    const task = createTask(title, photoUri);
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
};
