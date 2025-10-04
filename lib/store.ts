import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AppState, Session, Element, Position, Size, SubTask } from './types';

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      searchQuery: '',
      selectedElementId: null,
      isDarkMode: false,

      createSession: (name: string) => {
        const newSession: Session = {
          id: uuidv4(),
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          elements: []
        };
        set({ currentSession: newSession });
      },

      loadSession: (session: Session) => {
        set({ 
          currentSession: {
            ...session,
            updatedAt: new Date().toISOString()
          }
        });
      },

      exportSession: () => {
        const { currentSession } = get();
        return currentSession;
      },

      addElement: (elementData: Partial<Element>) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newElement = {
          ...elementData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as Element;

        const updatedSession = {
          ...currentSession,
          elements: [newElement, ...currentSession.elements],
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      updateElement: (id: string, updates: Partial<Element>) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.map(element =>
          element.id === id
            ? { ...element, ...updates, updatedAt: new Date().toISOString() }
            : element
        );

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      deleteElement: (id: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.filter(element => element.id !== id);
        
        // Remove from any groups that contain this element
        const cleanedElements = updatedElements.map(element => {
          if (element.type === 'group' && element.children.includes(id)) {
            return {
              ...element,
              children: element.children.filter(childId => childId !== id),
              updatedAt: new Date().toISOString()
            };
          }
          return element;
        });

        const updatedSession = {
          ...currentSession,
          elements: cleanedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      moveElement: (id: string, position: Position) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.map(element =>
          element.id === id
            ? { ...element, position, updatedAt: new Date().toISOString() }
            : element
        );

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      resizeElement: (id: string, size: Size) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.map(element =>
          element.id === id
            ? { ...element, size, updatedAt: new Date().toISOString() }
            : element
        );

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setSelectedElement: (id: string | null) => {
        set({ selectedElementId: id });
      },

      toggleDarkMode: () => {
        set(state => ({ isDarkMode: !state.isDarkMode }));
      },

      clearSession: () => {
        set({ 
          currentSession: null, 
          searchQuery: '', 
          selectedElementId: null 
        });
      },

      // SubTask actions
      addSubTask: (taskId: string, content: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const newSubTask: SubTask = {
          id: uuidv4(),
          content,
          done: false,
          createdAt: new Date().toISOString()
        };

        const updatedElements = currentSession.elements.map(element => {
          if (element.id === taskId && element.type === 'task') {
            return {
              ...element,
              subtasks: [...element.subtasks, newSubTask],
              updatedAt: new Date().toISOString()
            };
          }
          return element;
        });

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      updateSubTask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.map(element => {
          if (element.id === taskId && element.type === 'task') {
            const updatedSubtasks = element.subtasks.map(subtask =>
              subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
            );
            return {
              ...element,
              subtasks: updatedSubtasks,
              updatedAt: new Date().toISOString()
            };
          }
          return element;
        });

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      },

      deleteSubTask: (taskId: string, subtaskId: string) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const updatedElements = currentSession.elements.map(element => {
          if (element.id === taskId && element.type === 'task') {
            const updatedSubtasks = element.subtasks.filter(subtask => subtask.id !== subtaskId);
            return {
              ...element,
              subtasks: updatedSubtasks,
              updatedAt: new Date().toISOString()
            };
          }
          return element;
        });

        const updatedSession = {
          ...currentSession,
          elements: updatedElements,
          updatedAt: new Date().toISOString()
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ currentSession: updatedSession as any });
      }
    }),
    {
      name: 'problem-notes-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        isDarkMode: state.isDarkMode
      })
    }
  )
);

export default useStore;
