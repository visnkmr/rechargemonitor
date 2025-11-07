import PouchDB from 'pouchdb';

interface SyncDocument {
  _id: string;
  _rev?: string;
  data: any;
  timestamp: number;
  deviceId: string;
}

class SyncService {
  private db: PouchDB.Database<SyncDocument>;
  private remoteDb: PouchDB.Database<SyncDocument> | null = null;
  private syncHandler: any = null;
  private deviceId: string;

  constructor() {
    this.db = new PouchDB<SyncDocument>('rechargemonitor-sync');
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
  }

  async initializeSync(remoteUrl?: string): Promise<void> {
    if (remoteUrl) {
      try {
        this.remoteDb = new PouchDB<SyncDocument>(remoteUrl);
        await this.startSync();
      } catch (error) {
        console.error('Failed to initialize remote sync:', error);
      }
    }
  }

  private async startSync(): Promise<void> {
    if (!this.remoteDb) return;

    this.syncHandler = this.db.sync(this.remoteDb, {
      live: true,
      retry: true
    });

    this.syncHandler.on('change', (info: any) => {
      console.log('Sync change:', info);
    });

    this.syncHandler.on('paused', (err: any) => {
      console.log('Sync paused:', err);
    });

    this.syncHandler.on('active', () => {
      console.log('Sync active');
    });

    this.syncHandler.on('complete', (info: any) => {
      console.log('Sync complete:', info);
    });

    this.syncHandler.on('error', (err: any) => {
      console.error('Sync error:', err);
    });
  }

  async upsertLocalStorage(key: string, value: any): Promise<void> {
    const doc: SyncDocument = {
      _id: `localStorage:${key}`,
      data: value,
      timestamp: Date.now(),
      deviceId: this.deviceId
    };

    try {
      const existing = await this.db.get(doc._id).catch(() => null);
      if (existing) {
        doc._rev = existing._rev;
      }
      await this.db.put(doc);
    } catch (error) {
      console.error(`Failed to sync localStorage key ${key}:`, error);
    }
  }

  async getFromLocalStorage(key: string): Promise<any> {
    try {
      const doc = await this.db.get(`localStorage:${key}`);
      return doc.data;
    } catch (error) {
      return null;
    }
  }

  async syncAllFromLocalStorage(): Promise<void> {
    const keysToSync = [
      'recharges',
      'sip-calculations',
      'fd-calculations',
      'loan-calculations',
      'bills',
      'expenses',
      'xirr-calculations',
      'mf-watchlist',
      'mf-purchases'
    ];

    for (const key of keysToSync) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsedValue = JSON.parse(value);
          await this.upsertLocalStorage(key, parsedValue);
        } catch (error) {
          console.error(`Failed to parse and sync ${key}:`, error);
        }
      }
    }
  }

  async syncAllToLocalStorage(): Promise<void> {
    const keysToSync = [
      'recharges',
      'sip-calculations',
      'fd-calculations',
      'loan-calculations',
      'bills',
      'expenses',
      'xirr-calculations',
      'mf-watchlist',
      'mf-purchases'
    ];

    for (const key of keysToSync) {
      try {
        const value = await this.getFromLocalStorage(key);
        if (value !== null) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      } catch (error) {
        console.error(`Failed to sync ${key} to localStorage:`, error);
      }
    }
  }

  async stopSync(): Promise<void> {
    if (this.syncHandler) {
      await this.syncHandler.cancel();
      this.syncHandler = null;
    }
  }

  setupLocalStorageInterceptor(): void {
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = async (key: string, value: string) => {
      const result = originalSetItem(key, value);
      
      const keysToSync = [
        'recharges',
        'sip-calculations',
        'fd-calculations',
        'loan-calculations',
        'bills',
        'expenses',
        'xirr-calculations',
        'mf-watchlist',
        'mf-purchases'
      ];

      if (keysToSync.includes(key)) {
        try {
          const parsedValue = JSON.parse(value);
          await this.upsertLocalStorage(key, parsedValue);
        } catch (error) {
          console.error(`Failed to sync localStorage key ${key}:`, error);
        }
      }
      
      return result;
    };

    localStorage.removeItem = async (key: string) => {
      const result = originalRemoveItem(key);
      
      const keysToSync = [
        'recharges',
        'sip-calculations',
        'fd-calculations',
        'loan-calculations',
        'bills',
        'expenses',
        'xirr-calculations',
        'mf-watchlist',
        'mf-purchases'
      ];

      if (keysToSync.includes(key)) {
        try {
          const doc = await this.db.get(`localStorage:${key}`).catch(() => null);
          if (doc) {
            await this.db.remove(doc);
          }
        } catch (error) {
          console.error(`Failed to remove synced key ${key}:`, error);
        }
      }
      
      return result;
    };
  }
}

export const syncService = new SyncService();