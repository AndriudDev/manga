// API externa de tareas — MangaTools (capa Model)
// Cliente REST del servicio web externo (integración de tareas).
//
// Por defecto apunta a JSONPlaceholder (https://jsonplaceholder.typicode.com),
// una API REST pública de prueba que soporta GET/POST/PUT/DELETE sobre /todos.
// Para usar un backend real alcanza con cambiar API_BASE_URL por la URL del
// servicio propio.

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';
const TASKS_PATH = '/todos';

/** Formato de tarea que devuelve/recibe el servicio web externo. */
export interface RemoteTodo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`El servicio web respondió con el estado HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export const TaskApi = {
  /** GET — lista completa de tareas remota (usada para importar). */
  async list(): Promise<RemoteTodo[]> {
    return request<RemoteTodo[]>(TASKS_PATH);
  },

  /** POST — persiste una tarea nueva en el servicio web. */
  async create(title: string, completed: boolean): Promise<RemoteTodo> {
    return request<RemoteTodo>(TASKS_PATH, {
      method: 'POST',
      body: JSON.stringify({ title, completed, userId: 1 }),
    });
  },

  /** PUT — actualiza el estado de una tarea ya sincronizada. */
  async update(id: number, title: string, completed: boolean): Promise<RemoteTodo> {
    return request<RemoteTodo>(`${TASKS_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, completed }),
    });
  },

  /** DELETE — elimina la tarea remota asociada. */
  async remove(id: number): Promise<void> {
    await request<unknown>(`${TASKS_PATH}/${id}`, { method: 'DELETE' });
  },
};
