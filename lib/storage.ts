import { TarotSession } from "./types";

const DB_NAME = "taro-ritual-db";
const STORE_NAME = "sessions";
const DB_VERSION = 1;

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => void) {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    action(store);
    transaction.oncomplete = () => resolve(undefined as T);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function upsertSession(session: TarotSession) {
  await withStore("readwrite", (store) => {
    store.put(session);
  });
}

export async function getSessions() {
  const db = await openDb();
  return new Promise<TarotSession[]>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const sessions = (request.result as TarotSession[]).sort(
        (a, b) => b.createdAt - a.createdAt
      );
      resolve(sessions);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearSessions() {
  await withStore("readwrite", (store) => {
    store.clear();
  });
}
