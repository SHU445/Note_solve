export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: 'note' | 'task' | 'link' | 'group';
  content: string;
  tags: string[];
  position: Position;
  size?: Size;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteElement extends BaseElement {
  type: 'note';
  content: string; // Markdown content
}

export interface SubTask {
  id: string;
  content: string;
  done: boolean;
  createdAt: string;
}

export interface TaskElement extends BaseElement {
  type: 'task';
  done: boolean;
  priority?: 'low' | 'medium' | 'high';
  subtasks: SubTask[];
}

export interface LinkElement extends BaseElement {
  type: 'link';
  url: string;
  title?: string;
  description?: string;
}

export interface GroupElement extends BaseElement {
  type: 'group';
  children: string[]; // IDs of child elements
  collapsed: boolean;
}

export type Element = NoteElement | TaskElement | LinkElement | GroupElement;

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  elements: Element[];
}

export interface AppState {
  currentSession: Session | null;
  searchQuery: string;
  selectedElementId: string | null;
  isDarkMode: boolean;
  
  // Actions
  createSession: (name: string) => void;
  loadSession: (session: Session) => void;
  exportSession: () => Session | null;
  addElement: (element: Partial<Element>) => void;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElement: (id: string) => void;
  moveElement: (id: string, position: Position) => void;
  resizeElement: (id: string, size: Size) => void;
  setSearchQuery: (query: string) => void;
  setSelectedElement: (id: string | null) => void;
  toggleDarkMode: () => void;
  clearSession: () => void;
  
  // SubTask actions
  addSubTask: (taskId: string, content: string) => void;
  updateSubTask: (taskId: string, subtaskId: string, updates: Partial<SubTask>) => void;
  deleteSubTask: (taskId: string, subtaskId: string) => void;
}
