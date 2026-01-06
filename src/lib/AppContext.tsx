import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TodoList, CompanionStory, CompanionType } from './types';
import { 
  getStoredData, 
  saveData, 
  createTask, 
  createList,
  createCompanionStory,
  AppData,
  ScheduleSettings,
} from './storage';

interface AppState extends AppData {}

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'ADD_LIST'; payload: { name: string } }
  | { type: 'DELETE_LIST'; payload: { listId: string } }
  | { type: 'TOGGLE_LIST_COLLAPSE'; payload: { listId: string } }
  | { type: 'RENAME_LIST'; payload: { listId: string; name: string } }
  | { type: 'ADD_TASK'; payload: { listId: string; text: string } }
  | { type: 'DELETE_TASK'; payload: { listId: string; taskId: string } }
  | { type: 'TOGGLE_TASK'; payload: { listId: string; taskId: string } }
  | { type: 'UPDATE_TASK_TEXT'; payload: { listId: string; taskId: string; text: string } }
  | { type: 'UPDATE_TASK_DURATION'; payload: { taskId: string; duration: number | undefined } }
  | { type: 'SCHEDULE_TASK'; payload: { taskId: string; scheduledTime: string; duration: number } }
  | { type: 'UNSCHEDULE_TASK'; payload: { taskId: string } }
  | { type: 'MOVE_TO_FOCUS'; payload: { taskId: string } }
  | { type: 'REMOVE_FROM_FOCUS'; payload: { taskId: string } }
  | { type: 'COMPLETE_FOCUSED_TASK'; payload: { taskId: string } }
  | { type: 'REORDER_TASK'; payload: { listId: string; oldIndex: number; newIndex: number } }
  | { type: 'MOVE_TASK_BETWEEN_LISTS'; payload: { fromListId: string; toListId: string; taskId: string; newIndex: number } }
  | { type: 'SET_COMPANION_STORY'; payload: { content: string; imageUrl?: string } }
  | { type: 'CLEAR_COMPANION_STORY' }
  | { type: 'REVEAL_COMPANION_STORY_LINES'; payload: { lines: number } }
  | { type: 'MARK_STORY_READ' }
  | { type: 'SET_COMPANION_TYPE'; payload: { companionType: CompanionType } }
  | { type: 'UPDATE_SCHEDULE_SETTINGS'; payload: ScheduleSettings };

const initialState: AppState = {
  lists: [],
  focusedTaskIds: [],
  companionStory: null,
  selectedCompanion: 'scholar',
  scheduleSettings: { startTime: '09:00', endTime: '17:00' },
};

const LINES_PER_TASK = 3;

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...action.payload };

    case 'ADD_LIST':
      return {
        ...state,
        lists: [...state.lists, createList(action.payload.name)],
      };

    case 'DELETE_LIST':
      return {
        ...state,
        lists: state.lists.filter(list => list.id !== action.payload.listId),
        focusedTaskIds: state.focusedTaskIds.filter(
          id => !state.lists.find(l => l.id === action.payload.listId)?.tasks.some(t => t.id === id)
        ),
      };

    case 'TOGGLE_LIST_COLLAPSE':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, isCollapsed: !list.isCollapsed }
            : list
        ),
      };

    case 'RENAME_LIST':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, name: action.payload.name }
            : list
        ),
      };

    case 'ADD_TASK':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, tasks: [...list.tasks, createTask(action.payload.text)] }
            : list
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? { ...list, tasks: list.tasks.filter(task => task.id !== action.payload.taskId) }
            : list
        ),
        focusedTaskIds: state.focusedTaskIds.filter(id => id !== action.payload.taskId),
      };

    case 'TOGGLE_TASK': {
      let wasCompleting = false;
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => {
              if (task.id === action.payload.taskId) {
                wasCompleting = !task.completed;
                return { ...task, completed: !task.completed };
              }
              return task;
            }),
          };
        }
        return list;
      });

      // Reveal story lines when completing a task
      let updatedStory = state.companionStory;
      if (wasCompleting && updatedStory && updatedStory.revealedLines < updatedStory.totalLines) {
        updatedStory = {
          ...updatedStory,
          revealedLines: Math.min(updatedStory.revealedLines + LINES_PER_TASK, updatedStory.totalLines),
        };
      }

      return { ...state, lists: updatedLists, companionStory: updatedStory };
    }

    case 'UPDATE_TASK_TEXT':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === action.payload.taskId
                    ? { ...task, text: action.payload.text }
                    : task
                ),
              }
            : list
        ),
      };

    case 'UPDATE_TASK_DURATION':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, duration: action.payload.duration }
              : task
          ),
        })),
      };

    case 'SCHEDULE_TASK':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, scheduledTime: action.payload.scheduledTime, duration: action.payload.duration }
              : task
          ),
        })),
        focusedTaskIds: state.focusedTaskIds.includes(action.payload.taskId)
          ? state.focusedTaskIds
          : [...state.focusedTaskIds, action.payload.taskId],
      };

    case 'UNSCHEDULE_TASK':
      return {
        ...state,
        lists: state.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(task =>
            task.id === action.payload.taskId
              ? { ...task, scheduledTime: undefined }
              : task
          ),
        })),
      };

    case 'MOVE_TO_FOCUS':
      if (state.focusedTaskIds.includes(action.payload.taskId)) {
        return state;
      }
      return {
        ...state,
        focusedTaskIds: [...state.focusedTaskIds, action.payload.taskId],
      };

    case 'REMOVE_FROM_FOCUS':
      return {
        ...state,
        focusedTaskIds: state.focusedTaskIds.filter(id => id !== action.payload.taskId),
      };

    case 'COMPLETE_FOCUSED_TASK': {
      const taskId = action.payload.taskId;
      let listId: string | null = null;
      
      for (const list of state.lists) {
        if (list.tasks.some(t => t.id === taskId)) {
          listId = list.id;
          break;
        }
      }
      
      if (!listId) return state;
      
      const updatedLists = state.lists.map(list => {
        if (list.id === listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => {
              if (task.id === taskId) {
                return { ...task, completed: true };
              }
              return task;
            }),
          };
        }
        return list;
      });

      // Reveal story lines when completing a focused task
      let updatedStory = state.companionStory;
      if (updatedStory && updatedStory.revealedLines < updatedStory.totalLines) {
        updatedStory = {
          ...updatedStory,
          revealedLines: Math.min(updatedStory.revealedLines + LINES_PER_TASK, updatedStory.totalLines),
        };
      }
      
      return {
        ...state,
        lists: updatedLists,
        companionStory: updatedStory,
        focusedTaskIds: state.focusedTaskIds.filter(id => id !== taskId),
      };
    }

    case 'REORDER_TASK': {
      const { listId, oldIndex, newIndex } = action.payload;
      return {
        ...state,
        lists: state.lists.map(list => {
          if (list.id === listId) {
            const newTasks = [...list.tasks];
            const [movedTask] = newTasks.splice(oldIndex, 1);
            newTasks.splice(newIndex, 0, movedTask);
            return { ...list, tasks: newTasks };
          }
          return list;
        }),
      };
    }

    case 'MOVE_TASK_BETWEEN_LISTS': {
      const { fromListId, toListId, taskId, newIndex } = action.payload;
      let movedTask: Task | null = null;
      
      const listsWithoutTask = state.lists.map(list => {
        if (list.id === fromListId) {
          const taskIndex = list.tasks.findIndex(t => t.id === taskId);
          if (taskIndex !== -1) {
            movedTask = list.tasks[taskIndex];
            return { ...list, tasks: list.tasks.filter(t => t.id !== taskId) };
          }
        }
        return list;
      });
      
      if (!movedTask) return state;
      
      const finalLists = listsWithoutTask.map(list => {
        if (list.id === toListId) {
          const newTasks = [...list.tasks];
          newTasks.splice(newIndex, 0, movedTask!);
          return { ...list, tasks: newTasks };
        }
        return list;
      });
      
      return { ...state, lists: finalLists };
    }

    case 'SET_COMPANION_STORY':
      return {
        ...state,
        companionStory: createCompanionStory(action.payload.content, action.payload.imageUrl),
      };

    case 'CLEAR_COMPANION_STORY':
      return {
        ...state,
        companionStory: null,
      };

    case 'REVEAL_COMPANION_STORY_LINES':
      if (!state.companionStory) return state;
      return {
        ...state,
        companionStory: {
          ...state.companionStory,
          revealedLines: Math.min(
            state.companionStory.revealedLines + action.payload.lines,
            state.companionStory.totalLines
          ),
        },
      };

    case 'MARK_STORY_READ':
      if (!state.companionStory) return state;
      return {
        ...state,
        companionStory: {
          ...state.companionStory,
          lastReadLine: state.companionStory.revealedLines,
        },
      };

    case 'SET_COMPANION_TYPE':
      return {
        ...state,
        selectedCompanion: action.payload.companionType,
      };

    case 'UPDATE_SCHEDULE_SETTINGS':
      return {
        ...state,
        scheduleSettings: action.payload,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getTaskById: (taskId: string) => { task: Task; listId: string } | null;
  getFocusedTasks: () => { task: Task; listId: string }[];
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const data = getStoredData();
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  useEffect(() => {
    if (state.lists.length > 0 || state.focusedTaskIds.length > 0 || state.companionStory) {
      saveData(state);
    }
  }, [state]);

  const getTaskById = (taskId: string): { task: Task; listId: string } | null => {
    for (const list of state.lists) {
      const task = list.tasks.find(t => t.id === taskId);
      if (task) {
        return { task, listId: list.id };
      }
    }
    return null;
  };

  const getFocusedTasks = (): { task: Task; listId: string }[] => {
    return state.focusedTaskIds
      .map(id => getTaskById(id))
      .filter((item): item is { task: Task; listId: string } => item !== null);
  };

  return (
    <AppContext.Provider value={{ state, dispatch, getTaskById, getFocusedTasks }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
