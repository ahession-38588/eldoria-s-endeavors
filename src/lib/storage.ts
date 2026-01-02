import { Task, TodoList, CompanionStory } from './types';

const STORAGE_KEY = 'fantasy-todo-data';

export interface AppData {
  lists: TodoList[];
  focusedTaskIds: string[];
  companionStory: CompanionStory | null;
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getStoredData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Migration: remove old task-based story fields and ensure companionStory exists
      if (data.lists) {
        data.lists = data.lists.map((list: TodoList) => ({
          ...list,
          tasks: list.tasks.map((task: Task & { story?: unknown; storyRevealedLines?: unknown }) => {
            const { story, storyRevealedLines, ...cleanTask } = task as Task & { story?: unknown; storyRevealedLines?: unknown };
            return cleanTask;
          }),
        }));
      }
      // Migration: ensure companionStory has lastReadLine
      let companionStory = data.companionStory || null;
      if (companionStory && companionStory.lastReadLine === undefined) {
        companionStory = { ...companionStory, lastReadLine: 0 };
      }
      
      return {
        lists: data.lists || [],
        focusedTaskIds: data.focusedTaskIds || [],
        companionStory,
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return {
    lists: [],
    focusedTaskIds: [],
    companionStory: null,
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const createTask = (text: string): Task => ({
  id: generateId(),
  text,
  completed: false,
  createdAt: Date.now(),
});

export const createList = (name: string): TodoList => ({
  id: generateId(),
  name,
  tasks: [],
  isCollapsed: false,
  createdAt: Date.now(),
});

export const createCompanionStory = (content: string, imageUrl?: string): CompanionStory => ({
  content,
  imageUrl,
  totalLines: content.split('\n').filter(line => line.trim()).length,
  revealedLines: 0,
  lastReadLine: 0,
});
