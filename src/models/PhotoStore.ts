// Almacén de Fotos — MangaTools (capa Model)
// Copia las fotos capturadas por la cámara al directorio de documentos de la app
// para que sobrevivan entre sesiones, y habilita su limpieza.

import { File, Directory, Paths } from 'expo-file-system';

const PHOTO_DIR = 'task-photos';

function buildDirectory(): Directory {
  return new Directory(Paths.document, PHOTO_DIR);
}

/**
 * Copia la imagen temporal (caché) al almacenamiento persistente y devuelve su URI.
 */
export async function persistPhoto(sourceUri: string): Promise<string> {
  const dir = buildDirectory();
  dir.create({ idempotent: true, intermediates: true });

  const fileName = `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const dest = new File(dir, fileName);
  await new File(sourceUri).copy(dest);
  return dest.uri;
}

/**
 * Elimina una foto persistida de forma tolerante a fallos (best effort).
 */
export async function deletePhoto(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // Si el archivo ya no existe o no se puede eliminar, no bloqueamos el flujo.
  }
}
