'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
// Temporary fallback while dependencies are being installed
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeHighlight from 'rehype-highlight';

// Simple Markdown renderer fallback
const SimpleMarkdownRenderer = ({ children, className }: { children: string; className?: string }) => {
  const renderMarkdown = (text: string) => {
    const html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-semibold mb-2 mt-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold mb-2 mt-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-semibold mb-2 mt-3">$1</h1>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs my-2"><code>$1</code></pre>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 mb-1"><input type="checkbox" disabled class="w-3 h-3"><span>$1</span></div>')
      .replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 mb-1"><input type="checkbox" disabled checked class="w-3 h-3"><span class="line-through text-gray-500">$1</span></div>')
      .replace(/^- (.*$)/gim, '<li class="mb-1 list-disc ml-4">$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>');

    return html;
  };

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
    />
  );
};
import { 
  Edit3, 
  Save, 
  X, 
  Tag, 
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Palette,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Type,
  CornerDownRight
} from 'lucide-react';
import { NoteElement } from '@/lib/types';
import useStore from '@/lib/store';
import { useDraggable } from '@dnd-kit/core';

const NOTE_COLORS = [
  { name: 'default', class: '', color: '#f3f4f6' },
  { name: 'red', class: 'border-l-red-500 bg-red-50', color: '#fef2f2' },
  { name: 'orange', class: 'border-l-orange-500 bg-orange-50', color: '#fff7ed' },
  { name: 'yellow', class: 'border-l-yellow-500 bg-yellow-50', color: '#fefce8' },
  { name: 'green', class: 'border-l-green-500 bg-green-50', color: '#f0fdf4' },
  { name: 'blue', class: 'border-l-blue-500 bg-blue-50', color: '#eff6ff' },
  { name: 'indigo', class: 'border-l-indigo-500 bg-indigo-50', color: '#eef2ff' },
  { name: 'purple', class: 'border-l-purple-500 bg-purple-50', color: '#faf5ff' },
  { name: 'pink', class: 'border-l-pink-500 bg-pink-50', color: '#fdf2f8' },
];

const NOTE_TEMPLATES = [
  { name: 'Vide', content: '' },
  { name: 'Liste', content: '# Ma liste\n\n- [ ] Élément 1\n- [ ] Élément 2\n- [ ] Élément 3' },
  { name: 'Idée', content: '# 💡 Idée\n\n**Description:**\n\n**Pourquoi c\'est important:**\n\n**Prochaines étapes:**' },
  { name: 'Réunion', content: '# 📅 Réunion - [Date]\n\n**Participants:**\n\n**Objectifs:**\n\n**Notes:**\n\n**Actions:**' },
  { name: 'Code', content: '# 💻 Snippet\n\n```javascript\n// Code ici\n```\n\n**Description:**' },
];

interface NoteCardProps {
  note: NoteElement;
  isSelected: boolean;
  onSelect: () => void;
}

export default function NoteCard({ note, isSelected, onSelect }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [contentDimensions, setContentDimensions] = useState<{width: number, height: number} | null>(null);
  
  const { updateElement, deleteElement, resizeElement } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: note.id,
  });

  const style = {
    transform: `translate3d(${note.position.x}px, ${note.position.y}px, 0) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  // Auto-save functionality
  const handleContentChange = useCallback((newContent: string) => {
    setEditContent(newContent);
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save
    const timeoutId = setTimeout(() => {
      if (newContent !== note.content && newContent.trim()) {
        updateElement(note.id, { content: newContent.trim() });
      }
    }, 1000); // Auto-save after 1 second of inactivity
    
    setAutoSaveTimeout(timeoutId);
  }, [note.id, note.content, updateElement, autoSaveTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  // Fonction pour calculer les dimensions optimales basées sur le contenu
  const calculateOptimalDimensions = useCallback(() => {
    if (!contentRef.current) return null;
    
    const content = note.content || editContent;
    const lines = content.split('\n').length;
    const longestLine = Math.max(...content.split('\n').map(line => line.length));
    
    // Calcul de la largeur basée sur la longueur de ligne la plus longue
    const minWidth = 250;
    const maxWidth = 500;
    const charWidth = 8; // approximation
    const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, longestLine * charWidth + 100));
    
    // Calcul de la hauteur basée sur le nombre de lignes et les éléments UI
    const baseHeight = 140; // hauteur de base pour le header et footer
    const lineHeight = 20;
    const calculatedHeight = Math.min(600, Math.max(200, baseHeight + (lines * lineHeight)));
    
    // Ajustements pour les tags et autres éléments
    const tagsHeight = note.tags.length > 0 ? 30 : 0;
    const finalHeight = calculatedHeight + tagsHeight;
    
    return {
      width: calculatedWidth,
      height: finalHeight
    };
  }, [note.content, note.tags.length, editContent]);

  // Effect pour recalculer les dimensions quand le contenu change
  useEffect(() => {
    if (!isResizing && !note.size) { // Seulement si pas de taille manuelle définie
      const optimalDimensions = calculateOptimalDimensions();
      if (optimalDimensions && (contentDimensions?.width !== optimalDimensions.width || contentDimensions?.height !== optimalDimensions.height)) {
        setContentDimensions(optimalDimensions);
      }
    }
  }, [note.content, note.tags.length, isResizing, calculateOptimalDimensions, contentDimensions, note.size]);

  const handleSave = () => {
    if (editContent.trim()) {
      updateElement(note.id, { content: editContent.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
  };

  const handleColorChange = (colorName: string) => {
    updateElement(note.id, { color: colorName === 'default' ? undefined : colorName });
    setShowColorPicker(false);
  };

  const handleTemplateSelect = (template: typeof NOTE_TEMPLATES[0]) => {
    setEditContent(template.content);
    setShowTemplates(false);
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy content:', err);
    }
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !note.tags.includes(newTag.trim())) {
      updateElement(note.id, { 
        tags: [...note.tags, newTag.trim()] 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateElement(note.id, { 
      tags: note.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleDelete = () => {
    deleteElement(note.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault();
      togglePreview();
    }
  };

  const getCurrentColorClass = () => {
    const colorConfig = NOTE_COLORS.find(c => c.name === note.color) || NOTE_COLORS[0];
    return colorConfig.class;
  };

  // Resize functionality
  const handleResizeStart = useCallback((direction: 'se' | 's' | 'e', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = note.size?.width || (isExpanded ? 350 : 250);
    const startHeight = note.size?.height || 200;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (direction === 'se' || direction === 'e') {
        newWidth = Math.max(200, Math.min(800, startWidth + (e.clientX - startX)));
      }
      
      if (direction === 'se' || direction === 's') {
        newHeight = Math.max(150, Math.min(600, startHeight + (e.clientY - startY)));
      }

      resizeElement(note.id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [note.id, note.size, isExpanded, resizeElement]);

  // Get current size or calculated optimal size
  const currentWidth = note.size?.width || contentDimensions?.width || (isExpanded ? 350 : 280);
  const currentHeight = note.size?.height || contentDimensions?.height || 220;

  return (
    <Card 
      ref={(node) => {
        setNodeRef(node);
        cardRef.current = node;
      }}
      style={{
        ...style,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
      }}
      className={`
        absolute cursor-move transition-fluid hover-lift group resizable-element adaptive-sizing
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 transition-bouncy animate-smooth-bounce z-10 selected' : ''}
        ${isDragging ? 'dragging-active z-50' : 'not-dragging hover:shadow-lg'}
        ${isResizing ? 'resizing' : ''}
        ${getCurrentColorClass()}
        transition-all duration-200
      `}
      onClick={onSelect}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical 
              className="h-4 w-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors micro-bounce" 
              {...attributes}
              {...listeners}
            />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-600">📝 Note</span>
              {note.content.includes('```') && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  <Type className="h-2 w-2 mr-1" />
                  Code
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Toolbar - visible on hover or when editing */}
            <div className={`flex items-center gap-1 transition-opacity ${
              isEditing || isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              {!isEditing && (
                <>
                  {/* Copy button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    title="Copier le contenu"
                  >
                    {isCopied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  
                  {/* Preview toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview();
                    }}
                    title={isPreviewMode ? 'Mode édition' : 'Aperçu Markdown'}
                  >
                    {isPreviewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  
                  {/* Expand/Collapse */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    title={isExpanded ? 'Réduire' : 'Agrandir'}
                  >
                    {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                  </Button>
                  
                  {/* Color picker */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(!showColorPicker);
                      }}
                      title="Changer la couleur"
                    >
                      <Palette className="h-3 w-3" />
                    </Button>
                    
                    {showColorPicker && (
                      <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                        <div className="color-picker-grid">
                          {NOTE_COLORS.map((color) => (
                            <div
                              key={color.name}
                              className={`color-option ${note.color === color.name ? 'selected' : ''}`}
                              style={{ backgroundColor: color.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleColorChange(color.name);
                              }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Templates */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTemplates(!showTemplates);
                      }}
                      title="Templates"
                    >
                      <Type className="h-3 w-3" />
                    </Button>
                    
                    {showTemplates && (
                      <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[150px]">
                        <div className="p-1">
                          {NOTE_TEMPLATES.map((template) => (
                            <Button
                              key={template.name}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTemplateSelect(template);
                              }}
                            >
                              {template.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    title="Éditer"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  
                  {/* Tags */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTagInput(!showTagInput);
                    }}
                    title="Gérer les tags"
                  >
                    <Tag className="h-3 w-3" />
                  </Button>
                  
                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
                        handleDelete();
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
              
              {isEditing && (
                <>
                  {/* Preview toggle while editing */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePreview();
                    }}
                    title={isPreviewMode ? 'Mode édition' : 'Aperçu Markdown (Ctrl+Tab)'}
                  >
                    {isPreviewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                    }}
                    title="Sauvegarder (Ctrl+Enter)"
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
                    title="Annuler (Escape)"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Content Area */}
        <div ref={contentRef}>
        {isEditing && !isPreviewMode ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleKeyPress}
              className="resize-none transition-all"
              style={{
                height: `${Math.max(80, currentHeight - 180)}px`,
              }}
              placeholder="Tapez votre note ici... (Markdown supporté)

Raccourcis:
- Ctrl+Enter: Sauvegarder
- Ctrl+Tab: Aperçu
- Escape: Annuler"
              onClick={(e) => e.stopPropagation()}
            />
            {autoSaveTimeout && (
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <div className="animate-pulse w-2 h-2 bg-yellow-400 rounded-full" />
                Sauvegarde automatique...
              </div>
            )}
          </div>
        ) : (
          <div 
            className="transition-all overflow-hidden"
            style={{
              height: `${Math.max(100, currentHeight - 160)}px`,
            }}
          >
            {note.content ? (
              isPreviewMode ? (
                <SimpleMarkdownRenderer className="markdown-content">
                  {editContent || note.content}
                </SimpleMarkdownRenderer>
              ) : (
                <SimpleMarkdownRenderer className="markdown-content">
                  {note.content}
                </SimpleMarkdownRenderer>
              )
            ) : (
              <div className="text-gray-400 italic text-sm">
                Note vide... Cliquez pour éditer
              </div>
            )}
          </div>
        )}
        </div>

        {/* Tag Input */}
        {showTagInput && (
          <div className="flex gap-2 animate-fade-in">
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
            <Button size="sm" onClick={handleAddTag} title="Ajouter le tag">
              <Tag className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(tag);
                }}
                title="Cliquez pour supprimer"
              >
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
        
        {/* Footer info */}
        {(isSelected || isEditing) && (
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span>
                Créé: {new Date(note.createdAt).toLocaleDateString('fr-FR')}
              </span>
              {note.updatedAt !== note.createdAt && (
                <span>
                  Modifié: {new Date(note.updatedAt).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Resize handles */}
      <div 
        className="resize-handle se-resize" 
        onMouseDown={(e) => handleResizeStart('se', e)}
        title="Redimensionner"
      >
        <CornerDownRight className="h-3 w-3 text-white" />
      </div>
      <div 
        className="resize-handle s-resize" 
        onMouseDown={(e) => handleResizeStart('s', e)}
        title="Redimensionner la hauteur"
      />
      <div 
        className="resize-handle e-resize" 
        onMouseDown={(e) => handleResizeStart('e', e)}
        title="Redimensionner la largeur"
      />
    </Card>
  );
}
