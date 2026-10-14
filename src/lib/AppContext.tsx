/* AppContext - global state */
import React, { createContext, useContext, useReducer, useEffect, useRef, useState, ReactNode } from 'react';
import { Task, TodoList, CompanionStory, CompanionType, Quest, QuestCategory, CalendarFeed, CalendarEvent, CalendarProvider } from './types';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { useAuth } from './auth';
import { TrainingData, syncTrainingList } from './training';
import { Loop, syncLoopsList, setLoopActionCompleted, parseLoopTaskId } from './loops';
import { 
  STORAGE_KEY,
  getStoredData, 
  saveData, 
  createTask, 
  createList,
  createCompanionStory,
  generateId,
  AppData,
  ScheduleSettings,
} from './storage';

interface AppState extends AppData {}

type Action =
  | { type: 'LOAD_DATA'; payload: AppData }
  | { type: 'SET_TRAINING'; payload: TrainingData }
  | { type: 'SET_LOOPS'; payload: Loop[] }
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
  | { type: 'ADD_SUBTASK'; payload: { listId: string; taskId: string; text: string } }
  | { type: 'TOGGLE_SUBTASK'; payload: { listId: string; taskId: string; subtaskId: string } }
  | { type: 'UPDATE_SUBTASK_TEXT'; payload: { listId: string; taskId: string; subtaskId: string; text: string } }
  | { type: 'DELETE_SUBTASK'; payload: { listId: string; taskId: string; subtaskId: string } }
  | { type: 'MOVE_TASK_BETWEEN_LISTS'; payload: { fromListId: string; toListId: string; taskId: string; newIndex: number } }
  | { type: 'SET_COMPANION_STORY'; payload: { content: string; imageUrl?: string } }
  | { type: 'CLEAR_COMPANION_STORY' }
  | { type: 'REVEAL_COMPANION_STORY_LINES'; payload: { lines: number } }
  | { type: 'MARK_STORY_READ' }
  | { type: 'SET_STORY_SAVE_FOR_LATER'; payload: { saveForLater: boolean } }
  | { type: 'CLAIM_BANKED_STORY_LINES'; payload?: { lines?: number } }

  | { type: 'SET_COMPANION_TYPE'; payload: { companionType: CompanionType } }
  | { type: 'UPDATE_SCHEDULE_SETTINGS'; payload: ScheduleSettings }
  | { type: 'ADD_QUEST'; payload: { title: string; description?: string; category: QuestCategory } }
  | { type: 'COMPLETE_QUEST'; payload: { questId: string } }
  | { type: 'RESET_QUEST'; payload: { questId: string } }
  | { type: 'DELETE_QUEST'; payload: { questId: string } }
  | { type: 'SET_QUEST_BOARD_POSITION'; payload: { position: number } }
  | { type: 'ADD_CALENDAR_FEED'; payload: { id?: string; name: string; provider: CalendarProvider; url?: string } }
  | { type: 'REMOVE_CALENDAR_FEED'; payload: { feedId: string } }
  | { type: 'TOGGLE_CALENDAR_FEED'; payload: { feedId: string } }
  | { type: 'SET_CALENDAR_EVENTS'; payload: { feedId: string; events: CalendarEvent[] } };

const initialState: AppState = {
  lists: [],
  focusedTaskIds: [],
  companionStory: null,
  selectedCompanion: 'scholar',
  scheduleSettings: { startTime: '09:00', endTime: '17:00' },
  quests: [],
  questBoardPosition: 0,
  calendarFeeds: [],
  calendarEvents: [],
};

const BASE_LINES_PER_TASK = 5;

function getStoryLinesForTask(durationMinutes?: number): number {
  const bonus = durationMinutes ? Math.floor(durationMinutes / 15) : 0;
  return BASE_LINES_PER_TASK + bonus;
}

/** Applies an earned reward: reveals it now, or banks it when "save for later" is on. */
function grantStoryLines(story: CompanionStory | null, lines: number): CompanionStory | null {
  if (!story) return story;
  const remaining = story.totalLines - story.revealedLines - (story.bankedLines ?? 0);
  if (remaining <= 0) return story;
  const earned = Math.min(lines, remaining);
  if (story.saveForLater) {
    return { ...story, bankedLines: (story.bankedLines ?? 0) + earned };
  }
  return { ...story, revealedLines: story.revealedLines + earned };
}


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
      if (wasCompleting) {
        const completedTask = updatedLists
          .flatMap(l => l.tasks)
          .find(t => t.id === action.payload.taskId);
        updatedStory = grantStoryLines(updatedStory, getStoryLinesForTask(completedTask?.duration));
      }


      const loops = parseLoopTaskId(action.payload.taskId)
        ? setLoopActionCompleted(state.loops ?? [], action.payload.taskId, wasCompleting)
        : state.loops;
      return { ...state, lists: updatedLists, companionStory: updatedStory, loops };
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
      const completedTask = updatedLists.flatMap(l => l.tasks).find(t => t.id === taskId);
      const updatedStory = grantStoryLines(
        state.companionStory,
        getStoryLinesForTask(completedTask?.duration)
      );

      
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

    case 'SET_STORY_SAVE_FOR_LATER':
      if (!state.companionStory) return state;
      return {
        ...state,
        companionStory: {
          ...state.companionStory,
          saveForLater: action.payload.saveForLater,
        },
      };

    case 'CLAIM_BANKED_STORY_LINES': {
      const story = state.companionStory;
      if (!story || (story.bankedLines ?? 0) <= 0) return state;
      const claim = Math.min(action.payload?.lines ?? story.bankedLines, story.bankedLines);
      return {
        ...state,
        companionStory: {
          ...story,
          revealedLines: Math.min(story.revealedLines + claim, story.totalLines),
          bankedLines: story.bankedLines - claim,
        },
      };
    }



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

    case 'ADD_QUEST':
      return {
        ...state,
        quests: [...state.quests, {
          id: generateId(),
          title: action.payload.title,
          description: action.payload.description,
          category: action.payload.category,
          completionCount: 0,
          isComplete: false,
          createdAt: Date.now(),
        }],
      };

    case 'COMPLETE_QUEST': {
      const updatedStory = grantStoryLines(state.companionStory, BASE_LINES_PER_TASK);

      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.questId
            ? { ...q, isComplete: true, completionCount: q.completionCount + 1, lastCompleted: Date.now() }
            : q
        ),
        companionStory: updatedStory,
      };
    }

    case 'RESET_QUEST':
      return {
        ...state,
        quests: state.quests.map(q =>
          q.id === action.payload.questId ? { ...q, isComplete: false } : q
        ),
      };

    case 'DELETE_QUEST':
      return {
        ...state,
        quests: state.quests.filter(q => q.id !== action.payload.questId),
      };

    case 'ADD_CALENDAR_FEED': {
      const feed: CalendarFeed = {
        id: action.payload.id || generateId(),
        name: action.payload.name,
        provider: action.payload.provider,
        url: action.payload.url,
        enabled: true,
        createdAt: Date.now(),
      };
      return { ...state, calendarFeeds: [...(state.calendarFeeds || []), feed] };
    }

    case 'REMOVE_CALENDAR_FEED':
      return {
        ...state,
        calendarFeeds: (state.calendarFeeds || []).filter(f => f.id !== action.payload.feedId),
        calendarEvents: (state.calendarEvents || []).filter(e => e.feedId !== action.payload.feedId),
      };

    case 'TOGGLE_CALENDAR_FEED':
      return {
        ...state,
        calendarFeeds: (state.calendarFeeds || []).map(f =>
          f.id === action.payload.feedId ? { ...f, enabled: !f.enabled } : f
        ),
      };

    case 'SET_CALENDAR_EVENTS':
      return {
        ...state,
        calendarFeeds: (state.calendarFeeds || []).map(f =>
          f.id === action.payload.feedId ? { ...f, lastSyncedAt: Date.now() } : f
        ),
        calendarEvents: [
          ...(state.calendarEvents || []).filter(e => e.feedId !== action.payload.feedId),
          ...action.payload.events,
        ],
      };

    case 'SET_QUEST_BOARD_POSITION':
      return {
        ...state,
        questBoardPosition: action.payload.position,
      };

    case 'ADD_SUBTASK': {
      const { listId, taskId, text } = action.payload;
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: [
                          ...(task.subtasks || []),
                          { id: generateId(), text, completed: false, createdAt: Date.now() },
                        ],
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case 'TOGGLE_SUBTASK': {
      const { listId, taskId, subtaskId } = action.payload;
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: (task.subtasks || []).map(s =>
                          s.id === subtaskId ? { ...s, completed: !s.completed } : s
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case 'UPDATE_SUBTASK_TEXT': {
      const { listId, taskId, subtaskId, text } = action.payload;
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === taskId
                    ? {
                        ...task,
                        subtasks: (task.subtasks || []).map(s =>
                          s.id === subtaskId ? { ...s, text } : s
                        ),
                      }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case 'DELETE_SUBTASK': {
      const { listId, taskId, subtaskId } = action.payload;
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === listId
            ? {
                ...list,
                tasks: list.tasks.map(task =>
                  task.id === taskId
                    ? { ...task, subtasks: (task.subtasks || []).filter(s => s.id !== subtaskId) }
                    : task
                ),
              }
            : list
        ),
      };
    }

    case 'SET_LOOPS':
      return { ...state, loops: action.payload, lists: syncLoopsList(state.lists, action.payload) };

    case 'SET_TRAINING':
      return { ...state, training: action.payload, lists: syncTrainingList(state.lists, action.payload) };

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
  const { user } = useAuth();
  const [cloudReady, setCloudReady] = useState(false);
  const saveTimer = useRef<number | undefined>(undefined);

  // Load: local cache first, then the account copy (or upload local data on first sign-in)
  useEffect(() => {
    dispatch({ type: 'LOAD_DATA', payload: getStoredData() });
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.from('app_state').select('data').eq('user_id', user.id).maybeSingle();
      if (cancelled) return;
      if (error) { console.error('Cloud load failed', error); setCloudReady(true); return; }
      if (data?.data && Object.keys(data.data as object).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        dispatch({ type: 'LOAD_DATA', payload: getStoredData() });
      } else {
        await supabase.from('app_state').upsert({ user_id: user.id, data: getStoredData() as unknown as Json });
      }
      setCloudReady(true);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if (state.lists.length > 0 || state.focusedTaskIds.length > 0 || state.companionStory) {
      saveData(state);
    }
    if (!user || !cloudReady) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      supabase.from('app_state')
        .upsert({ user_id: user.id, data: state as unknown as Json, updated_at: new Date().toISOString() })
        .then(({ error }) => { if (error) console.error('Cloud save failed', error); });
    }, 1000);
  }, [state, user, cloudReady]);

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
