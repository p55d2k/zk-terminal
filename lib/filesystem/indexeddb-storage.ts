import { Directory } from "../types";

const DB_NAME = "zk-terminal-db";
const DB_VERSION = 1;
const STORE_NAME = "filesystem";

class IndexedDBStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async getData(): Promise<Directory | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get("root");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async setData(data: Directory): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, "root");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearData(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

const idbStorage = new IndexedDBStorage();

// Fallback to localStorage if IndexedDB is not available
const useIndexedDB = typeof window !== "undefined" && window.indexedDB;

export const loadData = async (): Promise<Directory> => {
  if (!useIndexedDB) {
    // Fallback implementation would go here, but we'll keep it simple
    throw new Error("IndexedDB not supported");
  }

  try {
    await idbStorage.init();
    const data = await idbStorage.getData();
    return data || defaultData;
  } catch (error) {
    console.warn("IndexedDB failed, using default data:", error);
    return defaultData;
  }
};

export const saveData = async (data: Directory): Promise<void> => {
  if (!useIndexedDB) return;

  try {
    await idbStorage.init();
    await idbStorage.setData(data);
  } catch (error) {
    console.warn("Failed to save to IndexedDB:", error);
  }
};

export const resetData = async (): Promise<Directory> => {
  if (!useIndexedDB) return defaultData;

  try {
    await idbStorage.init();
    await idbStorage.clearData();
  } catch (error) {
    console.warn("Failed to reset IndexedDB:", error);
  }

  return defaultData;
};

// Keep the default data for fallback
const defaultData: Directory = {
  name: "/",
  type: "directory",
  fullPath: "/",
  permissions: "drwxr-xr-x",
  owner: "user",
  group: "users",
  size: 4096,
  modified: new Date(),
  created: new Date(),
  content: [
    {
      name: "README.md",
      type: "file",
      fullPath: "/README.md",
      content: "Welcome to zk-terminal v1.0",
      permissions: "-rw-r--r--",
      owner: "user",
      group: "users",
      size: 25,
      modified: new Date(),
      created: new Date(),
    },
    {
      name: "projects",
      type: "directory",
      fullPath: "/projects",
      content: [],
      permissions: "drwxr-xr-x",
      owner: "user",
      group: "users",
      size: 4096,
      modified: new Date(),
      created: new Date(),
    },
  ],
};
