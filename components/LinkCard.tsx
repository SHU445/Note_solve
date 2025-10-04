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
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { LinkElement } from '@/lib/types';
import useStore from '@/lib/store';
import { useDraggable } from '@dnd-kit/core';

interface LinkCardProps {
  link: LinkElement;
  isSelected: boolean;
  onSelect: () => void;
}

export default function LinkCard({ link, isSelected, onSelect }: LinkCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editTitle, setEditTitle] = useState(link.title || '');
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [contentDimensions, setContentDimensions] = useState<{width: number, height: number} | null>(null);
  
  const { updateElement, deleteElement } = useStore();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: link.id,
  });

  const style = {
    transform: `translate3d(${link.position.x}px, ${link.position.y}px, 0) ${transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : ''}`,
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden' as const,
    perspective: 1000,
  };

  useEffect(() => {
    if (isEditing && urlInputRef.current) {
      urlInputRef.current.focus();
    }
  }, [isEditing]);

  // Fonction pour calculer les dimensions optimales basées sur le contenu
  const calculateOptimalDimensions = useCallback(() => {
    const title = link.title || '';
    const url = link.url || '';
    const description = link.description || '';
    
    // Calcul de la largeur basée sur le contenu le plus long
    const longestContent = Math.max(title.length, url.length, description.length);
    const minWidth = 250;
    const maxWidth = 450;
    const calculatedWidth = Math.min(maxWidth, Math.max(minWidth, longestContent * 6 + 80));
    
    // Calcul de la hauteur basée sur le contenu
    const baseHeight = 120; // header
    const titleHeight = title ? 25 : 20;
    const urlHeight = 20;
    const descriptionHeight = description ? 30 : 0;
    const tagsHeight = link.tags.length > 0 ? 35 : 0;
    const inputHeight = showTagInput ? 40 : 0;
    
    const finalHeight = baseHeight + titleHeight + urlHeight + descriptionHeight + tagsHeight + inputHeight;
    
    return {
      width: calculatedWidth,
      height: Math.min(350, finalHeight)
    };
  }, [link.title, link.url, link.description, link.tags.length, showTagInput]);

  // Effect pour recalculer les dimensions quand le contenu change
  useEffect(() => {
    const optimalDimensions = calculateOptimalDimensions();
    if (optimalDimensions && (contentDimensions?.width !== optimalDimensions.width || contentDimensions?.height !== optimalDimensions.height)) {
      setContentDimensions(optimalDimensions);
    }
  }, [link.title, link.url, link.description, link.tags.length, showTagInput, calculateOptimalDimensions, contentDimensions]);

  const handleSave = () => {
    if (editUrl.trim()) {
      let validUrl = editUrl.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      updateElement(link.id, { 
        url: validUrl,
        title: editTitle.trim() || getDomainFromUrl(validUrl)
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditUrl(link.url);
    setEditTitle(link.title || '');
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !link.tags.includes(newTag.trim())) {
      updateElement(link.id, { 
        tags: [...link.tags, newTag.trim()] 
      });
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateElement(link.id, { 
      tags: link.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleDelete = () => {
    deleteElement(link.id);
  };

  const handleOpenLink = () => {
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url.startsWith('http') ? url : 'https://' + url);
      return true;
    } catch {
      return false;
    }
  };

  const currentWidth = contentDimensions?.width || 300;
  const currentHeight = contentDimensions?.height || 180;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

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
        border-l-4 border-l-blue-500
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
            <span className="text-sm font-medium text-gray-600">🔗 Lien</span>
          </div>
          <div className="flex items-center gap-1">
            {!isEditing && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLink();
                  }}
                  title="Ouvrir le lien"
                >
                  <ExternalLink className="h-3 w-3" />
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
                  disabled={!isValidUrl(editUrl)}
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
      
      <CardContent className="space-y-3">
        <div ref={contentRef}>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <Input
                ref={urlInputRef}
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="https://example.com"
                className={`text-sm ${!isValidUrl(editUrl) && editUrl ? 'border-red-300' : ''}`}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Titre du lien (optionnel)"
              className="text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <div 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer truncate"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLink();
              }}
              title={link.title || link.url}
            >
              {link.title || getDomainFromUrl(link.url)}
            </div>
            <div className="text-xs text-gray-500 truncate" title={link.url}>
              {link.url}
            </div>
            {link.description && (
              <div className="text-xs text-gray-600 line-clamp-2">
                {link.description}
              </div>
            )}
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

        {link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {link.tags.map((tag) => (
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
