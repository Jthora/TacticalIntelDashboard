export class LocalStorageUtil {
  static getItem<T>(key: string): T | null {
    try {
      const storedItem = localStorage.getItem(key);
      if (!storedItem) {
        return null;
      }

      const parsedItem = JSON.parse(storedItem);
      if (parsedItem.expiry && new Date(parsedItem.expiry) < new Date()) {
        localStorage.removeItem(key);
        return null;
      }

      return parsedItem.value !== undefined ? parsedItem.value : parsedItem;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return null;
    }
  }

  static setItem<T>(key: string, value: T, expiryInMinutes?: number): void {
    try {
      const item: { value: T; expiry?: string } = { value };
      if (expiryInMinutes) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + expiryInMinutes);
        item.expiry = expiry.toISOString();
      }
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
    }
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  }

  static getNamespacedKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }
}