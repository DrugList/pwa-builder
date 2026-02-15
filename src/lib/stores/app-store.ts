import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface App {
  id: string;
  name: string;
  description?: string;
  icon: string;
  iconType: string;
  appType: string;
  config: Record<string, unknown>;
  isPublished: boolean;
  shareCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
  lastSync?: string;
  appId: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'date' | 'select' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  isPublished: boolean;
  submitText: string;
  successMsg: string;
  appId: string;
}

export interface FormEntry {
  id: string;
  data: Record<string, unknown>;
  formId: string;
  createdAt: string;
}

export interface DataItem {
  id: string;
  data: Record<string, unknown>;
  isFavorite: boolean;
  displayOrder: number;
  appId: string;
  dataSourceId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Apps
  apps: App[];
  currentApp: App | null;
  setApps: (apps: App[]) => void;
  addApp: (app: App) => void;
  updateApp: (id: string, updates: Partial<App>) => void;
  deleteApp: (id: string) => void;
  setCurrentApp: (app: App | null) => void;
  
  // Data Items
  dataItems: DataItem[];
  setDataItems: (items: DataItem[]) => void;
  addDataItem: (item: DataItem) => void;
  updateDataItem: (id: string, updates: Partial<DataItem>) => void;
  deleteDataItem: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Forms
  forms: Form[];
  currentForm: Form | null;
  setForms: (forms: Form[]) => void;
  addForm: (form: Form) => void;
  updateForm: (id: string, updates: Partial<Form>) => void;
  deleteForm: (id: string) => void;
  setCurrentForm: (form: Form | null) => void;
  
  // Form Entries
  formEntries: FormEntry[];
  setFormEntries: (entries: FormEntry[]) => void;
  addFormEntry: (entry: FormEntry) => void;
  
  // Data Sources
  dataSources: DataSource[];
  setDataSources: (sources: DataSource[]) => void;
  addDataSource: (source: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  deleteDataSource: (id: string) => void;
  
  // UI State
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastRefresh: Date | null;
  setLastRefresh: (date: Date) => void;
  
  // Dialogs
  createAppOpen: boolean;
  setCreateAppOpen: (open: boolean) => void;
  editAppOpen: boolean;
  setEditAppOpen: (open: boolean) => void;
  shareAppOpen: boolean;
  setShareAppOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),
      
      // Apps
      apps: [],
      currentApp: null,
      setApps: (apps) => set({ apps }),
      addApp: (app) => set((state) => ({ apps: [...state.apps, app] })),
      updateApp: (id, updates) => set((state) => ({
        apps: state.apps.map((app) => (app.id === id ? { ...app, ...updates } : app)),
      })),
      deleteApp: (id) => set((state) => ({
        apps: state.apps.filter((app) => app.id !== id),
      })),
      setCurrentApp: (app) => set({ currentApp: app }),
      
      // Data Items
      dataItems: [],
      setDataItems: (items) => set({ dataItems: items }),
      addDataItem: (item) => set((state) => ({ dataItems: [...state.dataItems, item] })),
      updateDataItem: (id, updates) => set((state) => ({
        dataItems: state.dataItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      })),
      deleteDataItem: (id) => set((state) => ({
        dataItems: state.dataItems.filter((item) => item.id !== id),
      })),
      toggleFavorite: (id) => set((state) => ({
        dataItems: state.dataItems.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        ),
      })),
      
      // Forms
      forms: [],
      currentForm: null,
      setForms: (forms) => set({ forms }),
      addForm: (form) => set((state) => ({ forms: [...state.forms, form] })),
      updateForm: (id, updates) => set((state) => ({
        forms: state.forms.map((form) => (form.id === id ? { ...form, ...updates } : form)),
      })),
      deleteForm: (id) => set((state) => ({
        forms: state.forms.filter((form) => form.id !== id),
      })),
      setCurrentForm: (form) => set({ currentForm: form }),
      
      // Form Entries
      formEntries: [],
      setFormEntries: (entries) => set({ formEntries: entries }),
      addFormEntry: (entry) => set((state) => ({ formEntries: [...state.formEntries, entry] })),
      
      // Data Sources
      dataSources: [],
      setDataSources: (sources) => set({ dataSources: sources }),
      addDataSource: (source) => set((state) => ({ dataSources: [...state.dataSources, source] })),
      updateDataSource: (id, updates) => set((state) => ({
        dataSources: state.dataSources.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      })),
      deleteDataSource: (id) => set((state) => ({
        dataSources: state.dataSources.filter((s) => s.id !== id),
      })),
      
      // UI State
      viewMode: 'card',
      setViewMode: (mode) => set({ viewMode: mode }),
      showFavorites: false,
      setShowFavorites: (show) => set({ showFavorites: show }),
      isOffline: false,
      setIsOffline: (offline) => set({ isOffline: offline }),
      lastRefresh: null,
      setLastRefresh: (date) => set({ lastRefresh: date }),
      
      // Dialogs
      createAppOpen: false,
      setCreateAppOpen: (open) => set({ createAppOpen: open }),
      editAppOpen: false,
      setEditAppOpen: (open) => set({ editAppOpen: open }),
      shareAppOpen: false,
      setShareAppOpen: (open) => set({ shareAppOpen: open }),
    }),
    {
      name: 'pwa-builder-storage',
      partialize: (state) => ({
        theme: state.theme,
        viewMode: state.viewMode,
        showFavorites: state.showFavorites,
      }),
    }
  )
);
