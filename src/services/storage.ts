import { get, set, del } from 'idb-keyval';

// Define the full project data structure saved to DB
export interface StoredProjectData {
    tasks: TaskItem[];
    // Potential for future fields (settings, etc if we move them here)
    updatedAt: number;
}

// Re-defining TaskItem locally if it's not exported from a central type file yet.
// In a real app we'd have a types.ts, but adhering to the instruction to create just these files for now.
// We will assume a types file exists or define it here. 
// Given the instruction "Refer strictly to docs/data_models.md", we should probably put types in a shared file,
// but for this step I will include the interface here to be safe and self-contained, or create a types.ts.
// Best Antigravity practice: Create a types definition file first or inline it. 
// I'll create a src/types/index.ts to keep it clean, as relying on docs/ for runtime types isn't possible.

export interface TaskItem {
    id: string; // UUID
    task_name: string;
    timestamp_seconds: number;
    description: string;
    screenshot_base64: string;
    sub_steps?: string[];
}

const PROJECT_KEY = 'cubit_connect_project_v1';

export const storageService = {
    /**
     * Loads the entire project state from IndexedDB.
     * Returns empty task list if nothing found.
     */
    async getProject(): Promise<StoredProjectData> {
        try {
            const data = await get<StoredProjectData>(PROJECT_KEY);
            return data || { tasks: [], updatedAt: Date.now() };
        } catch (error) {
            console.error('Failed to load project from IndexedDB:', error);
            // Fail gracefully with empty state rather than crashing
            return { tasks: [], updatedAt: Date.now() };
        }
    },

    /**
     * Saves the entire project state.
     * Note: This includes the base64 images, which is why we use IDB not LocalStorage.
     */
    async saveProject(tasks: TaskItem[]): Promise<void> {
        try {
            const payload: StoredProjectData = {
                tasks,
                updatedAt: Date.now(),
            };
            await set(PROJECT_KEY, payload);
        } catch (error) {
            console.error('Failed to save project to IndexedDB:', error);
            throw error; // Let the UI know save failed
        }
    },

    /**
     * Clears all project data.
     * Used for the "Hard Reset" feature.
     */
    async clearProject(): Promise<void> {
        try {
            await del(PROJECT_KEY);
        } catch (error) {
            console.error('Failed to clear project:', error);
        }
    }
};
