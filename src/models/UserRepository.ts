// Repositorio de Usuarios — MangaTools (capa Model)
// Acceso a datos: persistencia de usuarios y de la sesión activa en AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, hashPassword } from './User';

const USERS_KEY = '@mangatools/users';
const SESSION_KEY = '@mangatools/session';

// Credenciales del usuario administrador sembrado por defecto
export const ADMIN_EMAIL = 'admin';
export const ADMIN_PASSWORD = 'admin';

function parseUsers(raw: string | null): User[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export const UserRepository = {
  async getUsers(): Promise<User[]> {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return parseUsers(raw);
  },

  async saveUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.getUsers();
    return users.find((user) => user.email === email);
  },

  async emailExists(email: string): Promise<boolean> {
    return (await this.findByEmail(email)) !== undefined;
  },

  async addUser(user: User): Promise<void> {
    const users = await this.getUsers();
    users.push(user);
    await this.saveUsers(users);
  },

  async getSessionUser(): Promise<User | undefined> {
    const email = await AsyncStorage.getItem(SESSION_KEY);
    if (!email) return undefined;
    return this.findByEmail(email);
  },

  async setSession(email: string): Promise<void> {
    await AsyncStorage.setItem(SESSION_KEY, email);
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
  },

  /**
   * Garantiza que el usuario administrador por defecto exista.
   * Se invoca al arrancar la app.
   */
  async seedAdminUser(): Promise<void> {
    if (await this.emailExists(ADMIN_EMAIL)) return;
    const admin: User = {
      name: 'Administrador',
      email: ADMIN_EMAIL,
      passwordHash: hashPassword(ADMIN_PASSWORD),
      createdAt: new Date().toISOString(),
    };
    await this.addUser(admin);
  },
};
