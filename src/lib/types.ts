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
  story: StoryContent | null;
  storyRevealedLines: number;
}

export interface TodoList {
  id: string;
  name: string;
  tasks: Task[];
  isCollapsed: boolean;
  createdAt: number;
}
