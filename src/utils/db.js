// IndexedDB wrapper for local, secure user data storage
// Provides database operations for calculation logs, habit goals, and user settings

const DB_NAME = 'EcoMetricsDB';
const DB_VERSION = 1;

/**
 * Initializes and returns a promise for the IndexedDB instance.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open local storage database.'));
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // History store for tracking past calculations
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' });
      }
      
      // Goals store for active challenges
      if (!db.objectStoreNames.contains('goals')) {
        db.createObjectStore('goals', { keyPath: 'id' });
      }
      
      // Settings store for local state preferences
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

/**
 * Execute a transaction on a specific store.
 * @param {string} storeName 
 * @param {string} mode - 'readonly' or 'readwrite'
 * @param {function} callback 
 * @returns {Promise<any>}
 */
async function withStore(storeName, mode, callback) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = callback(store);

    transaction.oncomplete = () => {
      resolve(request.result);
    };

    transaction.onerror = () => {
      reject(transaction.error || new Error('Transaction failed.'));
    };
  });
}

export const db = {
  // --- History Calculation Logs ---
  
  async saveCalculation(calculation) {
    const id = calculation.id || Date.now().toString();
    const data = { ...calculation, id, timestamp: calculation.timestamp || Date.now() };
    await withStore('history', 'readwrite', (store) => store.put(data));
    return data;
  },

  async getHistory() {
    try {
      const items = await withStore('history', 'readonly', (store) => store.getAll());
      // Sort descending by timestamp
      return items.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  },

  async deleteCalculation(id) {
    return withStore('history', 'readwrite', (store) => store.delete(id));
  },

  // --- Reduction Goals & Challenges ---

  async saveGoal(goal) {
    if (!goal.id) {
      throw new Error('Goal must contain a unique string id.');
    }
    return withStore('goals', 'readwrite', (store) => store.put(goal));
  },

  async getGoals() {
    try {
      return await withStore('goals', 'readonly', (store) => store.getAll());
    } catch {
      return [];
    }
  },

  async deleteGoal(id) {
    return withStore('goals', 'readwrite', (store) => store.delete(id));
  },

  // --- Local Settings & Prefs ---

  async saveSetting(key, value) {
    return withStore('settings', 'readwrite', (store) => store.put({ key, value }));
  },

  async getSetting(key) {
    try {
      const record = await withStore('settings', 'readonly', (store) => store.get(key));
      return record ? record.value : null;
    } catch {
      return null;
    }
  },

  // --- System Wipes ---

  async clearAllData() {
    const dbInstance = await openDB();
    const stores = ['history', 'goals', 'settings'];
    const transaction = dbInstance.transaction(stores, 'readwrite');
    
    stores.forEach((storeName) => {
      transaction.objectStore(storeName).clear();
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  }
};
