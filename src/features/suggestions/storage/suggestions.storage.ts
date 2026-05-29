import { openDB } from "idb";

const DB_NAME = "rachaconta";

const STORE_NAME = "suggestions";

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "name",
        });
      }
    },
  });
}

export async function saveSuggestion(name: string) {
  const db = await getDb();

  await db.put(STORE_NAME, {
    name,
  });
}

export async function getSuggestions() {
  const db = await getDb();

  return db.getAll(STORE_NAME);
}
