import { Session } from './types';

export const exportSessionAsJSON = (session: Session): void => {
  const dataStr = JSON.stringify(session, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `${session.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
};

export const importSessionFromJSON = (file: File): Promise<Session> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const session: Session = JSON.parse(jsonString);
        
        // Validate the session structure
        if (!session.id || !session.name || !Array.isArray(session.elements)) {
          throw new Error('Format de fichier invalide');
        }
        
        // Validate each element has required properties
        session.elements.forEach((element, index) => {
          if (!element.id || !element.type || !element.position) {
            throw new Error(`Élément ${index + 1} invalide dans le fichier`);
          }
        });
        
        resolve(session);
      } catch (error) {
        reject(new Error('Erreur lors de la lecture du fichier JSON: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file);
  });
};

export const validateSession = (data: unknown): data is Session => {
  return (
    data !== null &&
    typeof data === 'object' &&
    'id' in data &&
    'name' in data &&
    'createdAt' in data &&
    'elements' in data &&
    typeof (data as Session).id === 'string' &&
    typeof (data as Session).name === 'string' &&
    typeof (data as Session).createdAt === 'string' &&
    Array.isArray((data as Session).elements)
  );
};

// Utility function to get preview of link content
export const getLinkPreview = async (url: string): Promise<{ title?: string; description?: string }> => {
  try {
    // Note: In a real application, you'd need a backend service or CORS proxy
    // For now, we'll extract basic info from the URL
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: urlObj.pathname
    };
  } catch {
    return {
      title: 'Lien',
      description: url
    };
  }
};
