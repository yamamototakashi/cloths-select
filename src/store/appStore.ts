import { create } from 'zustand';
import {
  addWearLog as dbAddWearLog,
  archiveItem as dbArchiveItem,
  cacheWeather,
  deleteItem as dbDeleteItem,
  getProfile,
  getSettings,
  listItems,
  listWearLogs,
  loadCachedWeather,
  patchSettings,
  putItem,
  saveProfile,
} from '../db/db';
import { buildSeedItems } from '../data/seed';
import type {
  AppSettings,
  ClothingItem,
  UserProfile,
  WearLog,
  WeatherSnapshot,
} from '../types';

export interface AppState {
  hydrated: boolean;
  profile?: UserProfile;
  items: ClothingItem[];
  wearLogs: WearLog[];
  settings: AppSettings;
  weather?: WeatherSnapshot;
  weatherLoading: boolean;
  weatherError?: string;

  hydrate(): Promise<void>;
  completeSetup(profile: UserProfile, options?: { seedDemo?: boolean }): Promise<void>;
  updateProfile(patch: Partial<UserProfile>): Promise<void>;
  addItem(item: ClothingItem): Promise<void>;
  updateItem(item: ClothingItem): Promise<void>;
  archiveItem(id: string, archived: boolean): Promise<void>;
  deleteItem(id: string): Promise<void>;
  duplicateItem(id: string): Promise<void>;
  logWorn(itemIds: string[], note?: string, date?: string): Promise<void>;
  setWeather(snapshot: WeatherSnapshot): Promise<void>;
  setWeatherLoading(loading: boolean): void;
  setWeatherError(err?: string): void;
  loadCachedWeatherIfAny(): Promise<void>;
  refreshItems(): Promise<void>;
  refreshWearLogs(): Promise<void>;
}

function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function newId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

export const useApp = create<AppState>((set, get) => ({
  hydrated: false,
  items: [],
  wearLogs: [],
  settings: {},
  weatherLoading: false,

  async hydrate() {
    const [profile, items, wearLogs, settings] = await Promise.all([
      getProfile(),
      listItems(),
      listWearLogs(),
      getSettings(),
    ]);
    set({
      hydrated: true,
      profile,
      items,
      wearLogs,
      settings,
    });
  },

  async completeSetup(profile, options) {
    const merged: UserProfile = { ...profile, setupCompleted: true };
    await saveProfile(merged);
    if (options?.seedDemo) {
      const existingCount = (await listItems(true)).length;
      if (existingCount === 0) {
        const seeds = buildSeedItems();
        for (const s of seeds) await putItem(s);
        await patchSettings({ seedInjected: true });
      }
    }
    await get().refreshItems();
    const settings = await getSettings();
    set({ profile: merged, settings });
  },

  async updateProfile(patch) {
    const current = get().profile;
    if (!current) return;
    const next: UserProfile = { ...current, ...patch };
    await saveProfile(next);
    set({ profile: next });
  },

  async addItem(item) {
    const stamped: ClothingItem = {
      ...item,
      id: item.id || newId('item'),
      createdAt: item.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await putItem(stamped);
    await get().refreshItems();
  },

  async updateItem(item) {
    const stamped: ClothingItem = { ...item, updatedAt: Date.now() };
    await putItem(stamped);
    await get().refreshItems();
  },

  async archiveItem(id, archived) {
    await dbArchiveItem(id, archived);
    await get().refreshItems();
  },

  async deleteItem(id) {
    await dbDeleteItem(id);
    await get().refreshItems();
  },

  async duplicateItem(id) {
    const src = get().items.find((i) => i.id === id);
    if (!src) return;
    const copy: ClothingItem = {
      ...src,
      id: newId('item'),
      name: `${src.name}（コピー）`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      archivedAt: undefined,
    };
    await putItem(copy);
    await get().refreshItems();
  },

  async logWorn(itemIds, note, date) {
    const log: WearLog = {
      id: newId('wear'),
      date: date ?? todayStr(),
      itemIds,
      note,
      createdAt: Date.now(),
    };
    await dbAddWearLog(log);
    await get().refreshWearLogs();
  },

  async setWeather(snapshot) {
    await cacheWeather(snapshot);
    await patchSettings({ lastWeather: snapshot });
    const settings = await getSettings();
    set({ weather: snapshot, settings, weatherLoading: false, weatherError: undefined });
  },

  setWeatherLoading(loading) {
    set({ weatherLoading: loading });
  },

  setWeatherError(err) {
    set({ weatherError: err, weatherLoading: false });
  },

  async loadCachedWeatherIfAny() {
    const cached = await loadCachedWeather();
    if (cached) set({ weather: { ...cached, source: 'cache' } });
  },

  async refreshItems() {
    const items = await listItems();
    set({ items });
  },
  async refreshWearLogs() {
    const wearLogs = await listWearLogs();
    set({ wearLogs });
  },
}));
