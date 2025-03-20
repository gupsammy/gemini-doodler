"use client";

import { DoodleHistoryItem } from "./doodler-types";

const DB_NAME = "GeminiDoodler";
const DB_VERSION = 1;
const HISTORY_STORE = "history";
const PREFERENCES_STORE = "preferences";

/**
 * Initialize the IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("Error opening database:", event);
      reject("Could not open database");
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create history store
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, {
          keyPath: "id",
        });
        historyStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      // Create preferences store
      if (!db.objectStoreNames.contains(PREFERENCES_STORE)) {
        db.createObjectStore(PREFERENCES_STORE, { keyPath: "id" });
      }
    };
  });
};

/**
 * Save a history item to IndexedDB
 */
export const saveHistoryItem = async (
  item: DoodleHistoryItem
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);

    const request = store.add(item);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error saving history item:", event);
        reject("Failed to save history item");
      };
    });
  } catch (error) {
    console.error("Error in saveHistoryItem:", error);
    throw error;
  }
};

/**
 * Get all history items from IndexedDB
 */
export const getAllHistoryItems = async (): Promise<DoodleHistoryItem[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(HISTORY_STORE, "readonly");
    const store = transaction.objectStore(HISTORY_STORE);
    const index = store.index("timestamp");

    const request = index.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error("Error getting history items:", event);
        reject("Failed to get history items");
      };
    });
  } catch (error) {
    console.error("Error in getAllHistoryItems:", error);
    return [];
  }
};

/**
 * Clear all history items from IndexedDB
 */
export const clearHistory = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(HISTORY_STORE);

    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error clearing history:", event);
        reject("Failed to clear history");
      };
    });
  } catch (error) {
    console.error("Error in clearHistory:", error);
    throw error;
  }
};

/**
 * Save user preferences to IndexedDB
 */
export const savePreferences = async (
  preferences: Record<string, unknown>
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(PREFERENCES_STORE, "readwrite");
    const store = transaction.objectStore(PREFERENCES_STORE);

    const request = store.put({
      id: "userPreferences",
      ...preferences,
      updatedAt: Date.now(),
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve();
      request.onerror = (event) => {
        console.error("Error saving preferences:", event);
        reject("Failed to save preferences");
      };
    });
  } catch (error) {
    console.error("Error in savePreferences:", error);
    throw error;
  }
};

/**
 * Get user preferences from IndexedDB
 */
export const getPreferences = async (): Promise<Record<
  string,
  unknown
> | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(PREFERENCES_STORE, "readonly");
    const store = transaction.objectStore(PREFERENCES_STORE);

    const request = store.get("userPreferences");

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = (event) => {
        console.error("Error getting preferences:", event);
        reject("Failed to get preferences");
      };
    });
  } catch (error) {
    console.error("Error in getPreferences:", error);
    return null;
  }
};
