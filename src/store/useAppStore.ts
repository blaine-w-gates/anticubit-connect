import { create } from 'zustand';
import { storageService, TaskItem } from '@/services/storage';

interface ProjectState {
    hasVideoHandle: boolean;
    isProcessing: boolean;
    tasks: TaskItem[];
    apiKey: string | null;

    // Actions
    setApiKey: (key: string) => void;
    setVideoHandleState: (hasHandle: boolean) => void;
    loadProject: () => Promise<void>;
    saveTask: (task: TaskItem) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<TaskItem>) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    resetProject: () => Promise<void>;
    fullLogout: () => Promise<void>;
    importTasks: (tasks: TaskItem[]) => Promise<void>;
    setProcessing: (isProcessing: boolean) => void;
}

const STORAGE_KEY_API = 'cubit_api_key';

export const useAppStore = create<ProjectState>((set, get) => ({
    // Initial State
    hasVideoHandle: false, // Default: Force re-selection on reload
    isProcessing: false,
    tasks: [],
    apiKey: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_API) : null,

    // Actions
    setApiKey: (key: string) => {
        localStorage.setItem(STORAGE_KEY_API, key);
        set({ apiKey: key });
    },

    setVideoHandleState: (hasHandle: boolean) => {
        set({ hasVideoHandle: hasHandle });
    },

    loadProject: async () => {
        const data = await storageService.getProject();
        set({ tasks: data.tasks });

        // Antigravity Protocol: Check if we have tasks. 
        // If we have tasks but hasVideoHandle is false (default), 
        // the UI will know to show the "Re-hydrate" screen.
    },

    saveTask: async (task: TaskItem) => {
        const currentTasks = get().tasks;
        const newTasks = [...currentTasks, task];

        // Update local state immediately (Optimistic UI)
        set({ tasks: newTasks });

        // Persist to IDB
        await storageService.saveProject(newTasks);
    },

    updateTask: async (taskId: string, updates: Partial<TaskItem>) => {
        const currentTasks = get().tasks;
        const newTasks = currentTasks.map(t =>
            t.id === taskId ? { ...t, ...updates } : t
        );

        set({ tasks: newTasks });
        await storageService.saveProject(newTasks);
    },

    deleteTask: async (taskId: string) => {
        const currentTasks = get().tasks;
        const newTasks = currentTasks.filter(t => t.id !== taskId);

        set({ tasks: newTasks });
        await storageService.saveProject(newTasks);
    },

    resetProject: async () => {
        // Smart Reset: Clear data but KEEP API Key
        await storageService.clearProject();
        set({ tasks: [], hasVideoHandle: false });
    },

    fullLogout: async () => {
        // Factory Reset
        await storageService.clearProject();
        localStorage.removeItem(STORAGE_KEY_API);
        set({ tasks: [], hasVideoHandle: false, apiKey: null });
    },

    importTasks: async (newTasks: TaskItem[]) => {
        set({ tasks: newTasks });
        await storageService.saveProject(newTasks);
    },

    setProcessing: (isProcessing: boolean) => {
        set({ isProcessing });
    }
}));
