import { useEffect, useCallback } from 'react';
import useStore from '@/lib/store';

export function useKeyboardShortcuts() {
  const { addElement, setSearchQuery } = useStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore shortcuts when user is typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLElement && event.target.isContentEditable
    ) {
      return;
    }

    // Ctrl/Cmd shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key.toLowerCase()) {
        case 'n':
          event.preventDefault();
          // Create new note at cursor position or center
          addElement({
            type: 'note' as const,
            content: '# Nouvelle note\n\nCommencez à taper ici...',
            tags: [],
            position: {
              x: Math.random() * 300 + 200,
              y: Math.random() * 200 + 150
            },
            color: undefined
          });
          break;
        
        case 't':
          event.preventDefault();
          // Create new task
          addElement({
            type: 'task' as const,
            content: 'Nouvelle tâche...',
            tags: [],
            position: {
              x: Math.random() * 300 + 200,
              y: Math.random() * 200 + 150
            },
            color: undefined,
            done: false
          });
          break;
          
        case 'l':
          event.preventDefault();
          // Create new link
          addElement({
            type: 'link' as const,
            content: 'Nouveau lien',
            url: 'https://example.com',
            title: 'Example',
            tags: [],
            position: {
              x: Math.random() * 300 + 200,
              y: Math.random() * 200 + 150
            },
            color: undefined
          });
          break;
          
        case 'k':
          event.preventDefault();
          // Focus search - we'll need to trigger this via the store or context
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
          }
          break;
          
        default:
          break;
      }
    }

    // Single key shortcuts (only when not in input fields)
    switch (event.key.toLowerCase()) {
      case 'escape':
        // Clear search and selection
        setSearchQuery('');
        break;
        
      case '/':
        event.preventDefault();
        // Focus search
        const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        break;
        
      default:
        break;
    }
  }, [addElement, setSearchQuery]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
}
