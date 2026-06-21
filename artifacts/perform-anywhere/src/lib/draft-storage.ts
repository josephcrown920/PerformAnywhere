const DB_NAME = "aurora-studio-draft";
const DB_VERSION = 1;
const FILE_STORE = "staged-files";
const TEXT_KEY = "aurora-studio-draft-v1";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: "kind" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, record: object): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<DraftFileRecord | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(FILE_STORE, "readonly").objectStore(FILE_STORE).get(key);
    req.onsuccess = () => resolve(req.result as DraftFileRecord | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(db: IDBDatabase): Promise<DraftFileRecord[]> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(FILE_STORE, "readonly").objectStore(FILE_STORE).getAll();
    req.onsuccess = () => resolve(req.result as DraftFileRecord[]);
    req.onerror = () => reject(req.error);
  });
}

function idbClear(db: IDBDatabase): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FILE_STORE, "readwrite");
    tx.objectStore(FILE_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

type DraftFileRecord = { kind: string; name: string; type: string; data: ArrayBuffer };

export type DraftText = {
  title: string;
  selectedModel: string;
  scenePrompt: string;
  stylePrompt: string;
  customPrompt: string;
  enhanced: string;
  step: number;
  savedAt: number;
};

export type DraftFile = { kind: string; file: File; preview: string };

// ─── Save ─────────────────────────────────────────────────────────────────────

export function saveDraftText(state: DraftText): void {
  try {
    localStorage.setItem(TEXT_KEY, JSON.stringify(state));
  } catch { /* quota exceeded — ignore */ }
}

export async function saveDraftFile(kind: string, file: File): Promise<void> {
  try {
    const db = await openDB();
    const data = await file.arrayBuffer();
    await idbPut(db, { kind, name: file.name, type: file.type, data });
  } catch { /* storage unavailable — ignore */ }
}

export async function deleteDraftFile(kind: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(FILE_STORE, "readwrite");
      tx.objectStore(FILE_STORE).delete(kind);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* ignore */ }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export function loadDraftText(): DraftText | null {
  try {
    const raw = localStorage.getItem(TEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftText;
    // Expire drafts older than 24 hours
    if (Date.now() - (parsed.savedAt ?? 0) > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(TEXT_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function loadDraftFiles(): Promise<DraftFile[]> {
  try {
    const db = await openDB();
    const records = await idbGetAll(db);
    return records.map((r) => {
      const file = new File([r.data], r.name, { type: r.type });
      return { kind: r.kind, file, preview: URL.createObjectURL(file) };
    });
  } catch {
    return [];
  }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export async function clearDraft(): Promise<void> {
  try {
    localStorage.removeItem(TEXT_KEY);
    const db = await openDB();
    await idbClear(db);
  } catch { /* ignore */ }
}

export function hasDraft(): boolean {
  try {
    return !!localStorage.getItem(TEXT_KEY);
  } catch {
    return false;
  }
}
