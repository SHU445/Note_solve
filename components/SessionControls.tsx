'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Download, 
  Upload, 
  FileText, 
  Trash2,
  Calendar,
  Search,
  Moon,
  Sun,
  RefreshCw
} from 'lucide-react';
import useStore from '@/lib/store';
import { exportSessionAsJSON, importSessionFromJSON } from '@/lib/session';
import { Element } from '@/lib/types';

interface SessionControlsProps {
  onAddElement: (type: Element['type']) => void;
}

export default function SessionControls({ onAddElement }: SessionControlsProps) {
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentSession,
    searchQuery,
    isDarkMode,
    createSession,
    loadSession,
    exportSession,
    clearSession,
    setSearchQuery,
    toggleDarkMode
  } = useStore();

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      createSession(newSessionName.trim());
      setNewSessionName('');
      setIsCreatingSession(false);
    }
  };

  const handleExportSession = () => {
    const session = exportSession();
    if (session) {
      exportSessionAsJSON(session);
    }
  };

  const handleImportSession = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const session = await importSessionFromJSON(file);
        loadSession(session);
      } catch (error) {
        alert('Erreur lors de l\'importation: ' + (error as Error).message);
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearSession = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer la session actuelle ?')) {
      clearSession();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElementTypeCounts = () => {
    if (!currentSession) return { notes: 0, tasks: 0, links: 0, groups: 0 };
    
    return currentSession.elements.reduce((acc, element) => {
      acc[element.type + 's' as keyof typeof acc]++;
      return acc;
    }, { notes: 0, tasks: 0, links: 0, groups: 0 });
  };

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Problem Notes</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Session Info */}
      <div className="p-4 border-b border-gray-200">
        {currentSession ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {currentSession.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                Créé le {formatDate(currentSession.createdAt)}
              </div>
              
              {currentSession.updatedAt !== currentSession.createdAt && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <RefreshCw className="h-3 w-3" />
                  Modifié le {formatDate(currentSession.updatedAt)}
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {(() => {
                  const counts = getElementTypeCounts();
                  return (
                    <>
                      {counts.notes > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          📝 {counts.notes}
                        </Badge>
                      )}
                      {counts.tasks > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          ✅ {counts.tasks}
                        </Badge>
                      )}
                      {counts.links > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          🔗 {counts.links}
                        </Badge>
                      )}
                      {counts.groups > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          📂 {counts.groups}
                        </Badge>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSession}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exporter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSession}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">Aucune session active</p>
          </div>
        )}
      </div>

      {/* Session Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-2">
          {!isCreatingSession ? (
            <Button 
              onClick={() => setIsCreatingSession(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Session
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Nom de la session"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSession();
                  } else if (e.key === 'Escape') {
                    setIsCreatingSession(false);
                    setNewSessionName('');
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateSession}
                  disabled={!newSessionName.trim()}
                  size="sm"
                  className="flex-1"
                >
                  Créer
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsCreatingSession(false);
                    setNewSessionName('');
                  }}
                  size="sm"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <Button 
            variant="outline" 
            onClick={handleImportSession}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importer Session
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Add Elements */}
      {currentSession && (
        <div className="p-4 flex-1">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Ajouter un élément</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => onAddElement('note')}
              className="w-full justify-between group hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <span className="flex items-center gap-2">
                📝 Note
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs opacity-60 group-hover:opacity-100">
                Ctrl+N
              </kbd>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAddElement('task')}
              className="w-full justify-between group hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              <span className="flex items-center gap-2">
                ✅ Tâche
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs opacity-60 group-hover:opacity-100">
                Ctrl+T
              </kbd>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAddElement('link')}
              className="w-full justify-between group hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <span className="flex items-center gap-2">
                🔗 Lien
              </span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs opacity-60 group-hover:opacity-100">
                Ctrl+L
              </kbd>
            </Button>
            <Button
              variant="outline"
              onClick={() => onAddElement('group')}
              className="w-full justify-start hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              📂 Groupe
            </Button>
          </div>
          
          {/* Keyboard shortcuts info */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
              Raccourcis clavier
            </h4>
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Recherche</span>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">/</kbd>
              </div>
              <div className="flex justify-between">
                <span>Focus recherche</span>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between">
                <span>Effacer recherche</span>
                <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />
      
      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">
          Problem Notes v1.0
        </p>
      </div>
    </div>
  );
}
