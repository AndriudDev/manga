// Pruebas de integración de Tareas — MangaTools
// Verifica la orquestación del TaskController: adjuntar la imagen capturada,
// registrar la ubicación, y las operaciones de sync/import con la API externa.
// Los repositorios y plugins nativos se mockean para aislar la lógica.

import { TaskController } from '../src/controllers/TaskController';
import { AuthController } from '../src/controllers/AuthController';
import { TaskRepository } from '../src/models/TaskRepository';
import { TaskApi } from '../src/models/TaskApi';
import { persistPhoto, deletePhoto } from '../src/models/PhotoStore';
import { TodoTask } from '../src/models/Task';

jest.mock('../src/controllers/AuthController', () => ({
  AuthController: { getCurrentUser: jest.fn() },
}));
jest.mock('../src/models/TaskRepository', () => ({
  TaskRepository: {
    getTasks: jest.fn(),
    saveTasks: jest.fn(),
    addTask: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
  },
}));
jest.mock('../src/models/TaskApi', () => ({
  TaskApi: { list: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() },
}));
jest.mock('../src/models/PhotoStore', () => ({
  persistPhoto: jest.fn(),
  deletePhoto: jest.fn(),
}));

const mockedGetUser = AuthController.getCurrentUser as jest.MockedFunction<
  typeof AuthController.getCurrentUser
>;
const repo = TaskRepository as jest.Mocked<typeof TaskRepository>;
const api = TaskApi as jest.Mocked<typeof TaskApi>;
const photo = { persistPhoto, deletePhoto } as {
  persistPhoto: jest.Mock;
  deletePhoto: jest.Mock;
};

const OWNER = 'usuario@ejemplo.com';
const ISO = '2026-08-13T10:00:00.000Z';

function task(partial: Partial<TodoTask> & { id: string; title: string }): TodoTask {
  return { completed: false, createdAt: ISO, ...partial };
}

describe('TaskController — captura de imagen y ubicación', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUser.mockResolvedValue({ email: OWNER } as never);
  });

  it('crea una tarea persistiendo foto y ubicación GPS', async () => {
    repo.getTasks.mockResolvedValue([]);

    const result = await TaskController.addTask(
      'Comprar leche',
      'file:///documents/task-photos/p.jpg',
      { latitude: -34.6037, longitude: -58.3816 },
    );

    expect(repo.addTask).toHaveBeenCalledWith(
      OWNER,
      expect.objectContaining({
        title: 'Comprar leche',
        completed: false,
        photoUri: 'file:///documents/task-photos/p.jpg',
        location: { latitude: -34.6037, longitude: -58.3816 },
      }),
    );
    expect(result).toEqual([]);
  });

  it('rechaza el título vacío sin guardar nada', async () => {
    repo.getTasks.mockResolvedValue([]);

    await TaskController.addTask('   ', 'file:///photo.jpg', undefined);

    expect(repo.addTask).not.toHaveBeenCalled();
  });

  it('persiste la imagen capturada y la adjunta a la tarea', async () => {
    const existing = task({ id: 't1', title: 'Editar borrador' });
    repo.getTasks.mockResolvedValue([existing]);
    photo.persistPhoto.mockResolvedValue('file:///documents/task-photos/p1.jpg');

    await TaskController.attachPhoto('t1', 'file:///cache/captured.jpg');

    expect(photo.persistPhoto).toHaveBeenCalledWith('file:///cache/captured.jpg');
    expect(photo.deletePhoto).not.toHaveBeenCalled();
    expect(repo.updateTask).toHaveBeenCalledWith(OWNER, 't1', {
      photoUri: 'file:///documents/task-photos/p1.jpg',
    });
  });

  it('al re-adjuntar elimina la foto anterior y la reemplaza', async () => {
    repo.getTasks.mockResolvedValue([
      task({ id: 't1', title: 'Editar', photoUri: 'file:///old.jpg' }),
    ]);
    photo.persistPhoto.mockResolvedValue('file:///new.jpg');

    await TaskController.attachPhoto('t1', 'file:///cache/captured.jpg');

    expect(photo.deletePhoto).toHaveBeenCalledWith('file:///old.jpg');
    expect(repo.updateTask).toHaveBeenCalledWith(OWNER, 't1', { photoUri: 'file:///new.jpg' });
  });

  it('al quitar la foto elimina el archivo persistido', async () => {
    repo.getTasks.mockResolvedValue([
      task({ id: 't1', title: 'Editar', photoUri: 'file:///persisted.jpg' }),
    ]);

    await TaskController.clearPhoto('t1');

    expect(photo.deletePhoto).toHaveBeenCalledWith('file:///persisted.jpg');
    expect(repo.updateTask).toHaveBeenCalledWith(OWNER, 't1', { photoUri: undefined });
  });

  it('al eliminar la tarea elimina también su foto', async () => {
    repo.getTasks.mockResolvedValue([
      task({ id: 't1', title: 'Editar', photoUri: 'file:///persisted.jpg' }),
    ]);

    await TaskController.deleteTask('t1');

    expect(photo.deletePhoto).toHaveBeenCalledWith('file:///persisted.jpg');
    expect(repo.deleteTask).toHaveBeenCalledWith(OWNER, 't1');
  });
it('modifica el título de una tarea (recortando espacios)', async () => {
    repo.getTasks.mockResolvedValue([task({ id: 't1', title: 'Título viejo' })]);

    await TaskController.updateTitle('t1', '   Título nuevo   ');

    expect(repo.updateTask).toHaveBeenCalledWith(OWNER, 't1', { title: 'Título nuevo' });
  });

  it('ignora la actualización si el título queda vacío', async () => {
    repo.getTasks.mockResolvedValue([task({ id: 't1', title: 'Título viejo' })]);

    await TaskController.updateTitle('t1', '    ');

    expect(repo.updateTask).not.toHaveBeenCalled();
  });

  it('no actualiza si la tarea no existe', async () => {
    repo.getTasks.mockResolvedValue([]);

    await TaskController.updateTitle('no-existe', 'Hola');

    expect(repo.updateTask).not.toHaveBeenCalled();
  });
});

describe('TaskController — integración con la API externa', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUser.mockResolvedValue({ email: OWNER } as never);
  });

  it('importa solo tareas nuevas (dedupe por título insensible a mayúsculas)', async () => {
    api.list.mockResolvedValue([
      { userId: 1, id: 1, title: 'Uno', completed: true },
      { userId: 1, id: 2, title: 'uno', completed: false },
      { userId: 1, id: 3, title: 'Tres', completed: false },
    ]);
    repo.getTasks.mockResolvedValue([task({ id: 'local', title: 'Tres' })]);

    const count = await TaskController.importFromApi();

    expect(count).toBe(1);
    expect(repo.saveTasks).toHaveBeenCalledWith(
      OWNER,
      expect.arrayContaining([
        expect.objectContaining({ title: 'Uno', completed: true, remoteId: 1 }),
      ]),
    );
    expect(repo.saveTasks).toHaveBeenCalledWith(
      OWNER,
      expect.not.arrayContaining([expect.objectContaining({ title: 'uno' })]),
    );
  });

  it('sincroniza creando las nuevas (POST) y actualizando las existentes (PUT)', async () => {
    repo.getTasks.mockResolvedValue([
      task({ id: 'a', title: 'Ya en la nube', remoteId: 7 }),
      task({ id: 'b', title: 'Nueva local', completed: true }),
    ]);
    api.update.mockResolvedValue({ userId: 1, id: 7, title: 'Ya en la nube', completed: false });
    api.create.mockResolvedValue({
      userId: 1,
      id: 99,
      title: 'Nueva local',
      completed: true,
    });

    const result = await TaskController.syncToRemote();

    expect(result).toEqual({ created: 1, updated: 1 });
    expect(api.create).toHaveBeenCalledWith('Nueva local', true);
    expect(api.update).toHaveBeenCalledWith(7, 'Ya en la nube', false);
    expect(repo.saveTasks).toHaveBeenCalledWith(
      OWNER,
      expect.arrayContaining([
        expect.objectContaining({ id: 'b', remoteId: 99 }),
        expect.objectContaining({ id: 'a', remoteId: 7 }),
      ]),
    );
  });

  it('tolera el fallo de red sin contarlo ni marcarlo sincronizado', async () => {
    repo.getTasks.mockResolvedValue([task({ id: 'b', title: 'Sin red' })]);
    api.create.mockRejectedValue(new Error('timeout'));

    const result = await TaskController.syncToRemote();

    expect(result).toEqual({ created: 0, updated: 0 });
    const savedList = repo.saveTasks.mock.calls[0][1];
    expect(savedList).toContainEqual(expect.objectContaining({ id: 'b' }));
    expect(savedList.find((saved) => saved.id === 'b')?.remoteId).toBeUndefined();
  });
});