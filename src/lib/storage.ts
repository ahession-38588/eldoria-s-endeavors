import { Task, TodoList, CompanionStory, CompanionType, Quest, QuestCategory } from './types';

const STORAGE_KEY = 'fantasy-todo-data';

export interface ScheduleSettings {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface AppData {
  lists: TodoList[];
  focusedTaskIds: string[];
  companionStory: CompanionStory | null;
  selectedCompanion: CompanionType;
  scheduleSettings?: ScheduleSettings;
  quests: Quest[];
  questBoardPosition: number;
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
        selectedCompanion: data.selectedCompanion || 'scholar',
        scheduleSettings: data.scheduleSettings || { startTime: '09:00', endTime: '17:00' },
        quests: data.quests || [],
        questBoardPosition: data.questBoardPosition || 0,
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return {
    lists: [],
    focusedTaskIds: [],
    companionStory: null,
    selectedCompanion: 'scholar',
    scheduleSettings: { startTime: '09:00', endTime: '17:00' },
    quests: [],
    questBoardPosition: 0,
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const createTask = (text: string, duration?: number): Task => ({
  id: generateId(),
  text,
  completed: false,
  createdAt: Date.now(),
  duration,
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
