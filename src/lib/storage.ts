import { Task, TodoList, StoryContent } from './types';

const STORAGE_KEY = 'fantasy-todo-data';

export interface AppData {
  lists: TodoList[];
  focusedTaskIds: string[];
}

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getStoredData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return {
    lists: [],
    focusedTaskIds: [],
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
  story: null,
  storyRevealedLines: 0,
});

export const createList = (name: string): TodoList => ({
  id: generateId(),
  name,
  tasks: [],
  isCollapsed: false,
  createdAt: Date.now(),
});

export const createStory = (content: string, imageUrl?: string): StoryContent => ({
  content,
  imageUrl,
  totalLines: content.split('\n').filter(line => line.trim()).length,
});
