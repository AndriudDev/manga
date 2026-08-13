// Modelo de Tarea — MangaTools
// Define la entidad de la lista de pendientes persistida en AsyncStorage.

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export function createTask(title: string): TodoTask {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}
