type StorageAdapter = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
};

const createMemoryAdapter = (): StorageAdapter => {
  const store = new Map<string, string>();
  return {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: key => { store.delete(key); },
    clear: () => store.clear()
  };
};

const resolveDefaultAdapter = (): StorageAdapter => {
  try {
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      const nativeStorage = (globalThis as any).localStorage as Storage;
      return {
        getItem: key => nativeStorage.getItem(key),
        setItem: (key, value) => nativeStorage.setItem(key, value),
        removeItem: key => nativeStorage.removeItem(key),
        clear: () => nativeStorage.clear()
      };
    }
  } catch {
    // fall through to memory adapter
  }

  return createMemoryAdapter();
};

let storageAdapter: StorageAdapter = resolveDefaultAdapter();

export const setStorageAdapter = (adapter: StorageAdapter | null | undefined): void => {
  storageAdapter = adapter ?? createMemoryAdapter();
};

export const resetStorageAdapter = (): void => {
  storageAdapter = resolveDefaultAdapter();
};

export class LocalStorageUtil {
  static getItem<T>(key: string): T | null {
    try {
      const storedItem = storageAdapter.getItem(key);
      if (!storedItem) {
        return null;
      }

      const parsedItem = JSON.parse(storedItem);
      if (parsedItem.expiry && new Date(parsedItem.expiry) < new Date()) {
        storageAdapter.removeItem(key);
        return null;
      }

      return parsedItem.value !== undefined ? parsedItem.value : parsedItem;
    } catch (error) {
      console.error(`Error getting item from storage: ${error}`);
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
      storageAdapter.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting item in storage: ${error}`);
    }
  }

  static removeItem(key: string): void {
    try {
      storageAdapter.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${error}`);
    }
  }

  static clear(): void {
    try {
      storageAdapter.clear();
    } catch (error) {
      console.error(`Error clearing storage: ${error}`);
    }
  }

  static getNamespacedKey(namespace: string, key: string): string {
    return `${namespace}:${key}`;
  }
}