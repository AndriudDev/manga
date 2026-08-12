// Controlador de Autenticación — MangaTools
// Orquesta la lógica de registro, ingreso y sesión sobre el repositorio (Modelo).

import { UserRepository } from '../models/UserRepository';
import { User, NewUser, hashPassword, normalizeEmail } from '../models/User';

export interface FormAuthResult {
  ok: boolean;
  error?: string;
}

// Criterios de validación compartidos por Register y Login
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export const AuthController = {
  /**
   * Registra un nuevo usuario y lo deja con sesión iniciada.
   */
  async register(input: NewUser): Promise<FormAuthResult> {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const password = input.password;

    if (name.length === 0) {
      return { ok: false, error: 'El nombre no puede estar vacío' };
    }
    if (!EMAIL_REGEX.test(email)) {
      return { ok: false, error: 'Ingresa un correo electrónico válido' };
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return {
        ok: false,
        error: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      };
    }
    if (await UserRepository.emailExists(email)) {
      return { ok: false, error: 'Ya existe una cuenta con este correo' };
    }

    const user: User = {
      name,
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    await UserRepository.addUser(user);
    await UserRepository.setSession(email);
    return { ok: true };
  },

  /**
   * Inicia sesión con correo y contraseña; valida contra los usuarios guardados.
   */
  async login(emailInput: string, password: string): Promise<FormAuthResult> {
    const email = normalizeEmail(emailInput);

    if (email.length === 0) {
      return { ok: false, error: 'El correo es obligatorio' };
    }
    if (password.length === 0) {
      return { ok: false, error: 'La contraseña es obligatoria' };
    }

    const user = await UserRepository.findByEmail(email);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { ok: false, error: 'Correo o contraseña incorrectos' };
    }

    await UserRepository.setSession(email);
    return { ok: true };
  },

  async logout(): Promise<void> {
    await UserRepository.clearSession();
  },

  async getCurrentUser(): Promise<User | undefined> {
    return UserRepository.getSessionUser();
  },
};
