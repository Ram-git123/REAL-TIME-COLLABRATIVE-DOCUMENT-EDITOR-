import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Cloud, 
  CloudOff, 
  FileText, 
  History,
  Loader2
} from 'lucide-react';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  onBack: () => void;
  onToggleSnapshots: () => void;
}

export default function EditorHeader({
  title,
  onTitleChange,
  isSaving,
  lastSaved,
  onBack,
  onToggleSnapshots
}: EditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    return lastSaved.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="border-b border-border bg-card px-4 py-3 flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold text-foreground hidden sm:inline">CrispScribe</span>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
            className="max-w-md text-center font-medium"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            className="text-lg font-medium text-foreground hover:text-primary transition-colors px-3 py-1 rounded-md hover:bg-secondary"
          >
            {title}
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Cloud className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Saved at {formatLastSaved()}</span>
            </>
          ) : (
            <>
              <CloudOff className="h-4 w-4" />
              <span className="hidden sm:inline">Not saved</span>
            </>
          )}
        </div>

        <Button variant="outline" size="sm" onClick={onToggleSnapshots}>
          <History className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Snapshots</span>
        </Button>
      </div>
    </header>
  );
}
