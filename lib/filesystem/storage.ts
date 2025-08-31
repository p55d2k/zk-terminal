import { Directory } from "../types";
import {
  loadData as loadFromIndexedDB,
  saveData as saveToIndexedDB,
  resetData as resetFromIndexedDB,
} from "./indexeddb-storage";
import {
  loadDataWithCache,
  saveDataWithCache,
  resetDataWithCache,
  defaultData,
  reviveDates,
} from "./enhanced-storage";

// Use enhanced storage with caching and compression
export { defaultData };

export const loadData = (): Directory => {
  return loadDataWithCache();
};

export const saveData = (data: Directory): void => {
  saveDataWithCache(data);
};

export const resetData = (): Directory => {
  return resetDataWithCache();
};
