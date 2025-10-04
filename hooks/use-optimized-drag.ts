import { useCallback, useRef } from 'react';
import useStore from '@/lib/store';
import { Position } from '@/lib/types';

/**
 * Hook optimisé pour les performances de drag & drop
 * Implémente throttling et optimisations diverses
 */
export const useOptimizedDrag = () => {
  const { moveElement } = useStore();
  const animationFrameRef = useRef<number>();
  const lastMoveTimeRef = useRef<number>(0);
  const pendingMoveRef = useRef<{ id: string; position: Position } | null>(null);

  // Throttle les mises à jour de position avec requestAnimationFrame
  const throttledMoveElement = useCallback((id: string, position: Position) => {
    const now = Date.now();
    
    // Stocke la dernière position demandée
    pendingMoveRef.current = { id, position };
    
    // Si pas d'animation en cours et suffisamment de temps écoulé
    if (!animationFrameRef.current && now - lastMoveTimeRef.current > 16) { // ~60fps
      lastMoveTimeRef.current = now;
      moveElement(id, position);
    } else if (!animationFrameRef.current) {
      // Planifie la prochaine mise à jour
      animationFrameRef.current = requestAnimationFrame(() => {
        animationFrameRef.current = undefined;
        if (pendingMoveRef.current) {
          const { id: pendingId, position: pendingPosition } = pendingMoveRef.current;
          moveElement(pendingId, pendingPosition);
          pendingMoveRef.current = null;
          lastMoveTimeRef.current = Date.now();
        }
      });
    }
  }, [moveElement]);

  // Nettoyage à la fin du drag
  const cleanupDrag = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    
    // Applique la dernière position si nécessaire
    if (pendingMoveRef.current) {
      const { id, position } = pendingMoveRef.current;
      moveElement(id, position);
      pendingMoveRef.current = null;
    }
  }, [moveElement]);

  return {
    throttledMoveElement,
    cleanupDrag
  };
};
