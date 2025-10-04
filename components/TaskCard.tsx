'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Edit3, 
  Save, 
  X, 
  Tag, 
  Trash2,
  GripVertical,
  AlertCircle,
  Circle,
  Zap,
  Plus,
  Minus
} from 'lucide-react';
import { TaskElement, SubTask } from '@/lib/types';
import useStore from '@/lib/store';
import { useDraggable } from '@dnd-kit/core';

interface TaskCardProps {
  task: TaskElement;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TaskCard({ task, isSelected, onSelect }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [newSubTaskContent, setNewSubTaskContent] = useState('');
  const [showNewSubTaskInput, setShowNewSubTaskInput] = useState(false);
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null);
  const [editSubTaskContent, setEditSubTaskContent] = useState('');
  const [contentDimensions, setContentDimensions] = useState<{width: number, height: number} | null>(null);
  
  const { updateElement, deleteElement, addSubTask, updateSubTask, deleteSubTask } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const newSubTaskRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: `translate3d(${task.position.x}px, ${task.position.y}px, 0) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
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

  useEffect(() => {
    if (showNewSubTaskInput && newSubTaskRef.current) {
      newSubTaskRef.current.focus();
    }
  }, [showNewSubTaskInput]);

  // Fonction pour calculer les dimensions optimales basées sur le contenu et les sous-tâches
  const calculateOptimalDimensions = useCallback(() => {
    const content = task.content;
    const contentLength = content.length;
    const hasLongContent = contentLength > 50;
    
    // Calcul de la largeur basée sur la longueur du contenu
    const minWidth = 280;
    const maxWidth = 450;
    const calculatedWidth = hasLongContent ? Math.min(maxWidth, minWidth + Math.min(170, contentLength * 2)) : minWidth;
    
    // Calcul de la hauteur basée sur le contenu et les éléments UI
    const baseHeight = 120; // hauteur de base pour le header
    const contentHeight = hasLongContent ? 60 : 40; // hauteur du contenu principal
    const tagsHeight = task.tags.length > 0 ? 35 : 0;
    const inputHeight = showTagInput ? 40 : 0;
    const subtasksHeight = task.subtasks.length * 35; // 35px par sous-tâche
    const newSubTaskHeight = showNewSubTaskInput ? 40 : 0;
    const addButtonHeight = 35; // hauteur du bouton d'ajout de sous-tâche
    
    const finalHeight = baseHeight + contentHeight + tagsHeight + inputHeight + subtasksHeight + newSubTaskHeight + addButtonHeight;
    
    return {
      width: calculatedWidth,
      height: Math.min(500, finalHeight)
    };
  }, [task.content, task.tags.length, task.subtasks.length, showTagInput, showNewSubTaskInput]);

  // Effect pour recalculer les dimensions quand le contenu change
  useEffect(() => {
    const optimalDimensions = calculateOptimalDimensions();
    if (optimalDimensions && (contentDimensions?.width !== optimalDimensions.width || contentDimensions?.height !== optimalDimensions.height)) {
      setContentDimensions(optimalDimensions);
    }
  }, [task.content, task.tags.length, task.subtasks.length, showTagInput, showNewSubTaskInput, calculateOptimalDimensions, contentDimensions]);

  const handleSave = () => {
    if (editContent.trim()) {
      updateElement(task.id, { content: editContent.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(task.content);
    setIsEditing(false);
  };

  const handleToggleDone = () => {
    updateElement(task.id, { done: !task.done });
  };

  const handlePriorityChange = () => {
    const priorities: (TaskElement['priority'])[] = [undefined, 'low', 'medium', 'high'];
    const currentIndex = priorities.indexOf(task.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    updateElement(task.id, { priority: priorities[nextIndex] });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !task.tags.includes(newTag.trim())) {
      updateElement(task.id, { 
        tags: [...task.tags, newTag.trim()] 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateElement(task.id, { 
      tags: task.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleDelete = () => {
    deleteElement(task.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Gestion des sous-tâches
  const handleAddSubTask = () => {
    if (newSubTaskContent.trim()) {
      addSubTask(task.id, newSubTaskContent.trim());
      setNewSubTaskContent('');
      setShowNewSubTaskInput(false);
    }
  };

  const handleSubTaskToggle = (subtask: SubTask) => {
    updateSubTask(task.id, subtask.id, { done: !subtask.done });
  };

  const handleEditSubTask = (subtask: SubTask) => {
    setEditingSubTaskId(subtask.id);
    setEditSubTaskContent(subtask.content);
  };

  const handleSaveSubTask = () => {
    if (editingSubTaskId && editSubTaskContent.trim()) {
      updateSubTask(task.id, editingSubTaskId, { content: editSubTaskContent.trim() });
      setEditingSubTaskId(null);
      setEditSubTaskContent('');
    }
  };

  const handleCancelEditSubTask = () => {
    setEditingSubTaskId(null);
    setEditSubTaskContent('');
  };

  const handleDeleteSubTask = (subtaskId: string) => {
    deleteSubTask(task.id, subtaskId);
  };

  const handleNewSubTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubTask();
    } else if (e.key === 'Escape') {
      setShowNewSubTaskInput(false);
      setNewSubTaskContent('');
    }
  };

  const handleSubTaskKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveSubTask();
    } else if (e.key === 'Escape') {
      handleCancelEditSubTask();
    }
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Circle className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return '';
    }
  };

  // Calculer le pourcentage de sous-tâches complétées
  const completedSubTasks = task.subtasks.filter(subtask => subtask.done).length;
  const totalSubTasks = task.subtasks.length;
  const completionPercentage = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  const currentWidth = contentDimensions?.width || 320;
  const currentHeight = contentDimensions?.height || 200;

  return (
    <Card 
      ref={setNodeRef}
      style={{
        ...style,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
      }}
      className={`
        absolute cursor-move transition-fluid hover-lift adaptive-sizing
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 transition-bouncy animate-smooth-bounce' : ''}
        ${isDragging ? 'dragging-active z-50' : 'not-dragging hover:shadow-lg'}
        ${task.done ? 'opacity-60' : ''}
        ${getPriorityColor() ? `border-l-4 ${getPriorityColor()}` : ''}
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
            <span className="text-sm font-medium text-gray-600">✅ Tâche</span>
            {getPriorityIcon()}
            {totalSubTasks > 0 && (
              <Badge variant="outline" className="text-xs">
                {completedSubTasks}/{totalSubTasks} ({completionPercentage}%)
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePriorityChange();
                  }}
                  title="Changer la priorité"
                >
                  <Circle className="h-3 w-3" />
                </Button>
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
      
      <CardContent className="space-y-3 overflow-y-auto">
        <div ref={contentRef}>
          {/* Tâche principale */}
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.done}
              onCheckedChange={handleToggleDone}
              className="mt-1"
              onClick={(e) => e.stopPropagation()}
            />
            
            {isEditing ? (
              <Input
                ref={inputRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1"
                placeholder="Description de la tâche..."
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className={`flex-1 text-sm leading-relaxed ${task.done ? 'line-through text-gray-500' : ''}`}>
                {task.content || 'Tâche sans description...'}
              </div>
            )}
          </div>

          {/* Sous-tâches */}
          {task.subtasks.length > 0 && (
            <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-3">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 group">
                  <Checkbox
                    checked={subtask.done}
                    onCheckedChange={() => handleSubTaskToggle(subtask)}
                    className="h-3 w-3"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {editingSubTaskId === subtask.id ? (
                    <div className="flex-1 flex gap-1">
                      <Input
                        value={editSubTaskContent}
                        onChange={(e) => setEditSubTaskContent(e.target.value)}
                        onKeyDown={handleSubTaskKeyPress}
                        className="flex-1 h-6 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveSubTask();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Save className="h-2 w-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditSubTask();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span 
                        className={`flex-1 text-xs cursor-pointer ${subtask.done ? 'line-through text-gray-500' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSubTask(subtask);
                        }}
                      >
                        {subtask.content}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubTask(subtask.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                      >
                        <Minus className="h-2 w-2" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Ajouter une nouvelle sous-tâche */}
          <div className="ml-6">
            {showNewSubTaskInput ? (
              <div className="flex gap-2">
                <Input
                  ref={newSubTaskRef}
                  value={newSubTaskContent}
                  onChange={(e) => setNewSubTaskContent(e.target.value)}
                  onKeyDown={handleNewSubTaskKeyPress}
                  placeholder="Nouvelle sous-tâche..."
                  className="flex-1 h-6 text-xs"
                  onClick={(e) => e.stopPropagation()}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddSubTask();
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Save className="h-2 w-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewSubTaskInput(false);
                    setNewSubTaskContent('');
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-2 w-2" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewSubTaskInput(true);
                }}
                className="h-6 text-xs text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-3 w-3 mr-1" />
                Ajouter une sous-tâche
              </Button>
            )}
          </div>

          {/* Champ d'ajout de tag */}
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

          {/* Affichage des tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag) => (
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
        </div>
      </CardContent>
    </Card>
  );
}