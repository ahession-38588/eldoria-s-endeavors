import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Task, TodoList } from './types';
import { 
  getStoredData, 
  saveData, 
  createTask, 
  createList, 
  generateId,
  AppData 
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
  | { type: 'ADD_STORY_TO_TASK'; payload: { listId: string; taskId: string; content: string; imageUrl?: string } }
  | { type: 'REVEAL_STORY_LINES'; payload: { listId: string; taskId: string; lines: number } }
  | { type: 'MOVE_TO_FOCUS'; payload: { taskId: string } }
  | { type: 'REMOVE_FROM_FOCUS'; payload: { taskId: string } }
  | { type: 'COMPLETE_FOCUSED_TASK'; payload: { taskId: string } };

const initialState: AppState = {
  lists: [],
  focusedTaskIds: [],
};

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
      let revealLines = 0;
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            tasks: list.tasks.map(task => {
              if (task.id === action.payload.taskId) {
                const willComplete = !task.completed;
                if (willComplete && task.story) {
                  revealLines = Math.min(3, task.story.totalLines - task.storyRevealedLines);
                }
                return {
                  ...task,
                  completed: willComplete,
                  storyRevealedLines: willComplete && task.story
                    ? Math.min(task.storyRevealedLines + 3, task.story.totalLines)
                    : task.storyRevealedLines,
                };
              }
              return task;
            }),
          };
        }
        return list;
      });
      return { ...state, lists: updatedLists };
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

    case 'ADD_STORY_TO_TASK':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === action.payload.taskId
                    ? {
                        ...task,
                        story: {
                          content: action.payload.content,
                          imageUrl: action.payload.imageUrl,
                          totalLines: action.payload.content.split('\n').filter(line => line.trim()).length,
                        },
                      }
                    : task
                ),
              }
            : list
        ),
      };

    case 'REVEAL_STORY_LINES':
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload.listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === action.payload.taskId && task.story
                    ? {
                        ...task,
                        storyRevealedLines: Math.min(
                          task.storyRevealedLines + action.payload.lines,
                          task.story.totalLines
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
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
                return {
                  ...task,
                  completed: true,
                  storyRevealedLines: task.story
                    ? Math.min(task.storyRevealedLines + 3, task.story.totalLines)
                    : 0,
                };
              }
              return task;
            }),
          };
        }
        return list;
      });
      
      return {
        ...state,
        lists: updatedLists,
        focusedTaskIds: state.focusedTaskIds.filter(id => id !== taskId),
      };
    }

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
    if (state.lists.length > 0 || state.focusedTaskIds.length > 0) {
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
