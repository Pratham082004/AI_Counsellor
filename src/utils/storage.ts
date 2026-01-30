/**
 * Local storage utility functions with type safety
 */

export const storageKeys = {
  AUTH_TOKEN: 'access_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
} as const;

export class LocalStorage {
  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  }

  static get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Failed to get localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}
