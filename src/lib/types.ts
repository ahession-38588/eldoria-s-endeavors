export type CompanionType = 'scholar' | 'cat' | 'robot' | 'spirit';

export interface StoryContent {
  content: string;
  imageUrl?: string;
  totalLines: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  duration?: number; // Duration in minutes
  scheduledTime?: string; // ISO string for scheduled start time
}

export interface TodoList {
  id: string;
  name: string;
  tasks: Task[];
  isCollapsed: boolean;
  createdAt: number;
}

export interface CompanionStory {
  content: string;
  imageUrl?: string;
  totalLines: number;
  revealedLines: number;
  lastReadLine: number; // Track which lines user has read
}
