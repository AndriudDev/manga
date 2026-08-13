// Pruebas del periférico de cámara (persistencia) — MangaTools
// Verifica que PhotoStore copia la imagen capturada desde la caché al
// almacenamiento persistente de la app y que su limpieza es tolerante a fallos.

import { persistPhoto, deletePhoto } from '../src/models/PhotoStore';

jest.mock('expo-file-system', () => {
  const createMock = jest.fn();
  const copyMock = jest.fn();
  const deleteMock = jest.fn();
  // URI cuyo archivo ya no existe (para probar limpieza tolerante).
  const missing = new Set<string>();

  function join(...parts: unknown[]): string {
    return parts
      .map((part) => (typeof part === 'string' ? part : (part as { uri: string }).uri))
      .join('/');
  }

  class Directory {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = join(...parts);
    }
    create(options: unknown): void {
      createMock(options);
    }
  }

  class File {
    uri: string;
    exists: boolean;
    constructor(...parts: unknown[]) {
      this.uri = join(...parts);
      this.exists = !missing.has(this.uri);
    }
    async copy(dest: File): Promise<void> {
      copyMock(this.uri, dest.uri);
    }
    delete(): void {
      deleteMock(this.uri);
    }
  }

  return {
    Directory,
    File,
    Paths: {
      get document(): Directory {
        return new Directory('file:///documents');
      },
    },
    __mocks: { createMock, copyMock, deleteMock, missing },
  };
});

const fsMocks = () =>
  jest.requireMock('expo-file-system') as {
    Directory: new (...parts: unknown[]) => { uri: string; create(options: unknown): void };
    File: new (...parts: unknown[]) => { uri: string; exists: boolean };
    __mocks: {
      createMock: jest.Mock;
      copyMock: jest.Mock;
      deleteMock: jest.Mock;
      missing: Set<string>;
    };
  };

describe('PhotoStore.persistPhoto', () => {
  it('copia la imagen capturada al directorio persistente de la app', async () => {
    const { createMock, copyMock } = fsMocks().__mocks;

    const uri = await persistPhoto('file:///cache/ImagePicker/captured.jpg');

    // El directorio de fotos se crea con opciones idempotentes.
    expect(createMock).toHaveBeenCalledWith({ idempotent: true, intermediates: true });
    // La imagen se copia desde la caché hacia el directorio persistente.
    expect(copyMock).toHaveBeenCalledWith(
      'file:///cache/ImagePicker/captured.jpg',
      expect.stringMatching(/^file:\/\/\/documents\/task-photos\//),
    );
    // Devuelve la URI persistente con nombre único.
    expect(uri).toMatch(/^file:\/\/\/documents\/task-photos\/task-\d+-[a-z0-9]+\.jpg$/);
  });
});

describe('PhotoStore.deletePhoto', () => {
  it('elimina el archivo persistido', async () => {
    const { deleteMock } = fsMocks().__mocks;

    await deletePhoto('file:///documents/task-photos/task-1-abc.jpg');

    expect(deleteMock).toHaveBeenCalledWith('file:///documents/task-photos/task-1-abc.jpg');
  });

  it('no falla si el archivo ya no existe (limpieza best effort)', async () => {
    const { deleteMock, missing } = fsMocks().__mocks;
    missing.add('file:///documents/task-photos/task-2-xyz.jpg');

    await expect(
      deletePhoto('file:///documents/task-photos/task-2-xyz.jpg'),
    ).resolves.toBeUndefined();
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
