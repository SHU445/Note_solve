'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Edit3, 
  Save, 
  X, 
  Tag, 
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen
} from 'lucide-react';
import { GroupElement, Element } from '@/lib/types';
import useStore from '@/lib/store';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface GroupContainerProps {
  group: GroupElement;
  childElements: Element[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function GroupContainer({ group, childElements, isSelected, onSelect }: GroupContainerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(group.content);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [contentDimensions, setContentDimensions] = useState<{width: number, height: number} | null>(null);
  
  const { updateElement, deleteElement } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: group.id,
  });

  const {
    setNodeRef: setDropNodeRef,
    isOver
  } = useDroppable({
    id: `group-${group.id}`,
  });

  const style = {
    transform: `translate3d(${group.position.x}px, ${group.position.y}px, 0) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  // Fonction pour calculer les dimensions optimales basées sur le contenu
  const calculateOptimalDimensions = useCallback(() => {
    const title = group.content || '';
    const childrenCount = childElements.length;
    
    // Calcul de la largeur basée sur le titre et le nombre d'enfants
    const minWidth = 300;
    const maxWidth = 500;
    const titleWidth = title.length * 8 + 150;
    const childrenWidth = childrenCount > 0 ? Math.min(350, 300 + (childrenCount * 20)) : minWidth;
    const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, Math.max(titleWidth, childrenWidth)));
    
    // Calcul de la hauteur basée sur le contenu et les éléments
    const baseHeight = group.collapsed ? 60 : 150; // hauteur de base selon l'état
    const titleHeight = isEditing ? 40 : 0;
    const tagsHeight = group.tags.length > 0 ? 35 : 0;
    const inputHeight = showTagInput ? 40 : 0;
    const childrenIndicatorHeight = !group.collapsed ? 80 : 0; // zone de drop
    
    const finalHeight = baseHeight + titleHeight + tagsHeight + inputHeight + childrenIndicatorHeight;
    
    return {
      width: calculatedWidth,
      height: Math.min(400, finalHeight)
    };
  }, [group.content, group.collapsed, group.tags.length, childElements.length, isEditing, showTagInput]);

  // Effect pour recalculer les dimensions quand le contenu change
  useEffect(() => {
    const optimalDimensions = calculateOptimalDimensions();
    if (optimalDimensions && (contentDimensions?.width !== optimalDimensions.width || contentDimensions?.height !== optimalDimensions.height)) {
      setContentDimensions(optimalDimensions);
    }
  }, [group.content, group.collapsed, group.tags.length, childElements.length, isEditing, showTagInput, calculateOptimalDimensions, contentDimensions]);

  const handleSave = () => {
    if (editContent.trim()) {
      updateElement(group.id, { content: editContent.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(group.content);
    setIsEditing(false);
  };

  const handleToggleCollapsed = () => {
    updateElement(group.id, { collapsed: !group.collapsed });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !group.tags.includes(newTag.trim())) {
      updateElement(group.id, { 
        tags: [...group.tags, newTag.trim()] 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateElement(group.id, { 
      tags: group.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleDelete = () => {
    // First, remove all children from the group
    childElements.forEach(child => {
      updateElement(child.id, { 
        position: { 
          x: group.position.x + Math.random() * 100, 
          y: group.position.y + Math.random() * 100 
        }
      });
    });
    
    // Then delete the group
    deleteElement(group.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Combine refs
  const setRefs = (element: HTMLDivElement | null) => {
    setDragNodeRef(element);
    setDropNodeRef(element);
  };

  const currentWidth = contentDimensions?.width || 350;
  const currentHeight = contentDimensions?.height || (group.collapsed ? 80 : 200);

  return (
    <Card 
      ref={setRefs}
      style={{
        ...style,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
      }}
      className={`
        absolute cursor-move transition-fluid hover-lift adaptive-sizing
        ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 transition-bouncy animate-smooth-bounce' : ''}
        ${isDragging ? 'dragging-active z-50' : 'not-dragging hover:shadow-lg'}
        ${isOver ? 'ring-2 ring-blue-300 bg-blue-50 animate-drag-enter' : 'animate-drag-leave'}
        border-l-4 border-l-purple-500
        transition-all duration-200
      `}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical 
              className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors micro-bounce" 
              {...attributes}
              {...listeners}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleCollapsed();
              }}
              className="p-0 h-auto"
            >
              {group.collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            {group.collapsed ? (
              <Folder className="h-4 w-4 text-purple-600" />
            ) : (
              <FolderOpen className="h-4 w-4 text-purple-600" />
            )}
            <span className="text-sm font-medium text-gray-600">📂 Groupe</span>
            <Badge variant="outline" className="text-xs">
              {group.children.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTagInput(!showTagInput);
                  }}
                >
                  <Tag className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      
      {!group.collapsed && (
        <CardContent className="space-y-3">
          <div ref={contentRef}>
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nom du groupe..."
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="text-sm font-medium">
              {group.content || 'Groupe sans nom...'}
            </div>
          )}

          {showTagInput && (
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    handleAddTag();
                  } else if (e.key === 'Escape') {
                    setShowTagInput(false);
                    setNewTag('');
                  }
                }}
                placeholder="Nouveau tag"
                className="text-xs"
                onClick={(e) => e.stopPropagation()}
              />
              <Button size="sm" onClick={handleAddTag}>
                <Tag className="h-3 w-3" />
              </Button>
            </div>
          )}

          {group.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {group.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-red-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tag);
                  }}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}

          <div className="border-2 border-dashed border-gray-200 rounded-lg min-h-[80px] p-3 bg-gray-50/50">
            {childElements.length > 0 ? (
              <div className="text-xs text-gray-500">
                {childElements.length} élément{childElements.length > 1 ? 's' : ''} dans ce groupe
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center">
                Glissez des éléments ici pour les grouper
              </div>
            )}
          </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
