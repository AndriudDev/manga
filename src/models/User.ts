// Modelo de Usuario — MangaTools
// Define la entidad persistida en AsyncStorage.

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export interface User {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

/**
 * Hash simple (no criptográfico) para no persistir la contraseña en texto plano.
 * Solo ilustrativo para el ejercicio con AsyncStorage; en producción la
 * autenticación debe delegarse a un backend con hashing seguro (bcrypt/argon2).
 */
export function hashPassword(password: string): string {
  let hash = 5381;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `h${(hash >>> 0).toString(16)}`;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
