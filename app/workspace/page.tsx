'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
// import { snapCenterToCursor } from '@dnd-kit/modifiers';
import useStore from '@/lib/store';
import { Element, NoteElement, TaskElement, LinkElement, GroupElement, Position } from '@/lib/types';
import SessionControls from '@/components/SessionControls';
import NoteCard from '@/components/NoteCard';
import TaskCard from '@/components/TaskCard';
import LinkCard from '@/components/LinkCard';
import GroupContainer from '@/components/GroupContainer';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useOptimizedDrag } from '@/hooks/use-optimized-drag';

export default function WorkspacePage() {
  const router = useRouter();
  const [, setActiveId] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<Element | null>(null);

  const {
    currentSession,
    searchQuery,
    selectedElementId,
    isDarkMode,
    addElement,
    moveElement,
    setSelectedElement
  } = useStore();

  const { throttledMoveElement, cleanupDrag } = useOptimizedDrag();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Distance minimale pour activation ultra-rapide
        tolerance: 5,
        delay: 0,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // Léger délai pour éviter les activations accidentelles sur mobile
        tolerance: 8,
      },
    })
  );

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  useEffect(() => {
    if (!currentSession) {
      router.push('/');
    }
  }, [currentSession, router]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleAddElement = (type: Element['type']) => {
    const newPosition: Position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100
    };

    const baseElement = {
      content: '',
      tags: [],
      position: newPosition,
      color: undefined
    };

    switch (type) {
      case 'note':
        addElement({
          ...baseElement,
          type: 'note' as const,
          content: '# Nouvelle note\n\nCommencez à taper ici...\n\n**Astuce :** Cette note supporte le Markdown ! \n\n- [ ] Vous pouvez créer des listes\n- [x] Avec des cases à cocher\n- **Texte en gras**\n- *Texte en italique*\n\n```javascript\n// Et même du code !\nconsole.log("Hello World!");\n```'
        });
        break;
      case 'task':
        addElement({
          ...baseElement,
          type: 'task' as const,
          content: 'Nouvelle tâche...',
          done: false,
          subtasks: []
        });
        break;
      case 'link':
        addElement({
          ...baseElement,
          type: 'link' as const,
          content: 'Nouveau lien',
          url: 'https://example.com',
          title: 'Example'
        });
        break;
      case 'group':
        addElement({
          ...baseElement,
          type: 'group' as const,
          content: 'Nouveau groupe',
          children: [],
          collapsed: false
        });
        break;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const element = currentSession?.elements.find(el => el.id === active.id);
    setActiveElement(element || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (active && delta && currentSession) {
      const element = currentSession.elements.find(el => el.id === active.id);
      if (element) {
        const newPosition: Position = {
          x: element.position.x + delta.x,
          y: element.position.y + delta.y
        };
        // Use throttled move for final position
        throttledMoveElement(element.id, newPosition);
      }
    }

    // Cleanup optimizations
    cleanupDrag();
    setActiveId(null);
    setActiveElement(null);
  };

  const getFilteredElements = (): Element[] => {
    if (!currentSession) return [];
    
    if (!searchQuery) return currentSession.elements;

    return currentSession.elements.filter(element => {
      const contentMatch = element.content.toLowerCase().includes(searchQuery.toLowerCase());
      const tagsMatch = element.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      // For links, also search in URL and title
      if (element.type === 'link') {
        const linkElement = element as LinkElement;
        const urlMatch = linkElement.url.toLowerCase().includes(searchQuery.toLowerCase());
        const titleMatch = linkElement.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        return contentMatch || tagsMatch || urlMatch || titleMatch;
      }
      
      return contentMatch || tagsMatch;
    });
  };

  const renderElement = (element: Element) => {
    const isSelected = selectedElementId === element.id;
    const onSelect = () => setSelectedElement(element.id);

    switch (element.type) {
      case 'note':
        return (
          <NoteCard
            key={element.id}
            note={element as NoteElement}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case 'task':
        return (
          <TaskCard
            key={element.id}
            task={element as TaskElement}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case 'link':
        return (
          <LinkCard
            key={element.id}
            link={element as LinkElement}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      case 'group':
        const groupElement = element as GroupElement;
        const childElements = currentSession?.elements.filter(el => 
          groupElement.children.includes(el.id)
        ) || [];
        return (
          <GroupContainer
            key={element.id}
            group={groupElement}
            childElements={childElements}
            isSelected={isSelected}
            onSelect={onSelect}
          />
        );
      default:
        return null;
    }
  };

  // Render optimized version for drag overlay
  const renderDragOverlay = (element: Element) => {
    const baseClass = "drag-overlay pointer-events-none select-none";
    
    switch (element.type) {
      case 'note':
        return (
          <div className={`${baseClass} p-4 bg-white rounded-lg shadow-2xl min-w-[250px] max-w-[400px] border`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">📝 Note</span>
            </div>
            <div className="text-sm text-gray-800 line-clamp-3">
              {(element as NoteElement).content}
            </div>
          </div>
        );
      case 'task':
        return (
          <div className={`${baseClass} p-4 bg-white rounded-lg shadow-2xl min-w-[250px] max-w-[400px] border`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">✅ Tâche</span>
            </div>
            <div className="text-sm text-gray-800">
              {(element as TaskElement).content}
            </div>
          </div>
        );
      case 'link':
        return (
          <div className={`${baseClass} p-4 bg-white rounded-lg shadow-2xl min-w-[250px] max-w-[400px] border`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">🔗 Lien</span>
            </div>
            <div className="text-sm text-gray-800 truncate">
              {(element as LinkElement).url}
            </div>
          </div>
        );
      case 'group':
        return (
          <div className={`${baseClass} p-4 bg-purple-50 rounded-lg shadow-2xl min-w-[300px] max-w-[500px] border border-purple-200`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-purple-600">📁 Groupe</span>
            </div>
            <div className="text-sm text-gray-800">
              {(element as GroupElement).content}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActiveElement = () => {
    if (!activeElement) return null;
    
    // Use the optimized drag overlay render
    return renderDragOverlay(activeElement);
  };

  if (!currentSession) {
    return null; // Will redirect in useEffect
  }

  const filteredElements = getFilteredElements();

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <SessionControls onAddElement={handleAddElement} />

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          // modifiers={[snapCenterToCursor]}
        >
          {/* Canvas */}
          <div
            className="absolute inset-0 overflow-auto workspace-grid"
            onClick={() => setSelectedElement(null)}
          >
            <div className="relative min-w-[2000px] min-h-[2000px] p-8">
              {filteredElements.map(element => renderElement(element))}
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {renderActiveElement()}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {filteredElements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 max-w-md">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'Aucun résultat trouvé' : 'Workspace vide'}
              </h3>
              <p className="text-sm mb-4">
                {searchQuery 
                  ? 'Essayez avec des mots-clés différents'
                  : 'Créez votre premier élément pour commencer'
                }
              </p>
              {!searchQuery && (
                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-semibold mb-2">Raccourcis clavier :</p>
                  <div className="grid grid-cols-2 gap-1 text-left">
                    <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+N</kbd> Note</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+T</kbd> Tâche</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+L</kbd> Lien</span>
                    <span><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">/</kbd> Recherche</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {searchQuery && filteredElements.length > 0 && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {filteredElements.length} résultat{filteredElements.length > 1 ? 's' : ''} 
              pour &quot;{searchQuery}&quot;
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
