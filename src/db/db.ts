import Dexie, { type Table } from 'dexie';
import type {
  AppSettings,
  ClothingItem,
  UserProfile,
  WearLog,
  WeatherSnapshot,
} from '../types';

type SettingsRow = AppSettings & { id: 'app' };
type WeatherCacheRow = { id: string; snapshot: WeatherSnapshot };

export class ClosetDatabase extends Dexie {
  items!: Table<ClothingItem, string>;
  profile!: Table<UserProfile, 'me'>;
  wearLogs!: Table<WearLog, string>;
  settings!: Table<SettingsRow, 'app'>;
  weatherCache!: Table<WeatherCacheRow, string>;

  constructor() {
    super('closet-weather');
    this.version(1).stores({
      items: 'id, category, favorite, updatedAt, archivedAt',
      profile: 'id',
      wearLogs: 'id, date, createdAt',
      settings: 'id',
      weatherCache: 'id',
    });
  }
}

export const db = new ClosetDatabase();

export async function getProfile(): Promise<UserProfile | undefined> {
  return db.profile.get('me');
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await db.profile.put({ ...profile, id: 'me' });
}

export async function getSettings(): Promise<AppSettings> {
  const row = await db.settings.get('app');
  if (!row) return {};
  const { id: _id, ...rest } = row;
  return rest;
}

export async function patchSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const next: AppSettings = { ...current, ...patch };
  await db.settings.put({ id: 'app', ...next });
  return next;
}

export async function listItems(includeArchived = false): Promise<ClothingItem[]> {
  const rows = await db.items.toArray();
  const filtered = includeArchived ? rows : rows.filter((r) => !r.archivedAt);
  return filtered.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function putItem(item: ClothingItem): Promise<void> {
  await db.items.put(item);
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}

export async function archiveItem(id: string, archived: boolean): Promise<void> {
  const item = await db.items.get(id);
  if (!item) return;
  item.archivedAt = archived ? Date.now() : undefined;
  item.updatedAt = Date.now();
  await db.items.put(item);
}

export async function addWearLog(log: WearLog): Promise<void> {
  await db.wearLogs.put(log);
}

export async function listWearLogs(limit = 200): Promise<WearLog[]> {
  const rows = await db.wearLogs.orderBy('createdAt').reverse().limit(limit).toArray();
  return rows;
}

export async function clearWearLogs(): Promise<void> {
  await db.wearLogs.clear();
}

export async function cacheWeather(snapshot: WeatherSnapshot): Promise<void> {
  await db.weatherCache.put({ id: 'last', snapshot });
}

export async function loadCachedWeather(): Promise<WeatherSnapshot | undefined> {
  const row = await db.weatherCache.get('last');
  return row?.snapshot;
}

export async function exportAll(): Promise<string> {
  const [items, profile, wearLogs, settings] = await Promise.all([
    db.items.toArray(),
    db.profile.get('me'),
    db.wearLogs.toArray(),
    db.settings.get('app'),
  ]);
  // Blobs are not JSON serializable; replace with null reference flag for MVP export.
  const serializableItems = items.map((item) => ({
    ...item,
    imageBlob: undefined,
    hasImage: Boolean(item.imageBlob),
  }));
  return JSON.stringify(
    { version: 1, items: serializableItems, profile, wearLogs, settings },
    null,
    2,
  );
}

export async function importAll(json: string): Promise<void> {
  const data = JSON.parse(json) as {
    items?: ClothingItem[];
    profile?: UserProfile;
    wearLogs?: WearLog[];
    settings?: AppSettings;
  };
  await db.transaction('rw', db.items, db.profile, db.wearLogs, db.settings, async () => {
    if (data.items) {
      await db.items.clear();
      await db.items.bulkPut(data.items.map((i) => ({ ...i, imageBlob: undefined })));
    }
    if (data.profile) await db.profile.put({ ...data.profile, id: 'me' });
    if (data.wearLogs) {
      await db.wearLogs.clear();
      await db.wearLogs.bulkPut(data.wearLogs);
    }
    if (data.settings) await db.settings.put({ id: 'app', ...data.settings });
  });
}

export async function wipeAll(): Promise<void> {
  await db.transaction(
    'rw',
    [db.items, db.profile, db.wearLogs, db.settings, db.weatherCache],
    async () => {
      await db.items.clear();
      await db.profile.clear();
      await db.wearLogs.clear();
      await db.settings.clear();
      await db.weatherCache.clear();
    },
  );
}
