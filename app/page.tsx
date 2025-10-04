'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useStore from '@/lib/store';
import { importSessionFromJSON } from '@/lib/session';
import { Plus, Upload, FileText, CheckSquare, Link, Folder } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createSession, loadSession, currentSession } = useStore();

  // La session est automatiquement chargée depuis localStorage via Zustand persist

  useEffect(() => {
    // Rediriger vers le workspace s'il y a une session active
    if (currentSession) {
      router.push('/workspace');
    }
  }, [currentSession, router]);

  const handleCreateSession = () => {
    const sessionName = `Session ${new Date().toLocaleDateString('fr-FR')}`;
    createSession(sessionName);
    router.push('/workspace');
  };

  const handleImportSession = async (file: File) => {
    try {
      const session = await importSessionFromJSON(file);
      loadSession(session);
      router.push('/workspace');
    } catch (error) {
      alert(`Erreur lors de l'import: ${error instanceof Error ? error.message : 'Format invalide'}`);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportSession(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Problem Notes
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Organisez vos idées, tâches et liens pour résoudre efficacement vos problèmes
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Notes</div>
            <div className="text-xs text-muted-foreground">Markdown</div>
          </Card>
          <Card className="text-center p-4">
            <CheckSquare className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Tâches</div>
            <div className="text-xs text-muted-foreground">À cocher</div>
          </Card>
          <Card className="text-center p-4">
            <Link className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Liens</div>
            <div className="text-xs text-muted-foreground">Web</div>
          </Card>
          <Card className="text-center p-4">
            <Folder className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-sm font-medium">Groupes</div>
            <div className="text-xs text-muted-foreground">Organisation</div>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Commencer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCreateSession}
                className="w-full h-14 text-lg"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Session
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    ou
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-12"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                Importer Session (JSON)
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground text-center space-y-2">
                <div>✨ <strong>Drag & Drop</strong> pour organiser vos éléments</div>
                <div>💾 <strong>Sauvegarde automatique</strong> dans votre navigateur</div>
                <div>📤 <strong>Export/Import JSON</strong> pour sauvegarder vos sessions</div>
                <div>🔍 <strong>Recherche en temps réel</strong> dans vos notes</div>
                <div>🎨 <strong>Interface moderne</strong> et responsive</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}