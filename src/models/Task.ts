// Modelo de Tarea — MangaTools
// Define la entidad de la lista de pendientes persistida en AsyncStorage.

export interface TaskLocation {
  latitude: number;
  longitude: number;
}

export interface TodoTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  photoUri?: string;
  location?: TaskLocation;
  /** Identificador asignado por el servicio web al sincronizar la tarea. */
  remoteId?: number;
}

export function createTask(
  title: string,
  photoUri?: string,
  location?: TaskLocation,
): TodoTask {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    photoUri,
    location,
  };
}
