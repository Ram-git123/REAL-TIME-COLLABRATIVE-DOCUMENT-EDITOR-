import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Camera, 
  Clock, 
  RotateCcw,
  Loader2,
  Trash2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Snapshot {
  id: string;
  title: string;
  content: string;
  snapshot_name: string | null;
  created_at: string;
}

interface SnapshotPanelProps {
  documentId: string;
  currentContent: string;
  currentTitle: string;
  onRestore: (content: string, title: string) => void;
  onClose: () => void;
}

export default function SnapshotPanel({
  documentId,
  currentContent,
  currentTitle,
  onRestore,
  onClose
}: SnapshotPanelProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchSnapshots();
  }, [documentId]);

  const fetchSnapshots = async () => {
    try {
      const { data, error } = await supabase
        .from('document_snapshots')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSnapshots(data || []);
    } catch (error) {
      console.error('Error fetching snapshots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSnapshot = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('document_snapshots')
        .insert({
          document_id: documentId,
          title: currentTitle,
          content: currentContent,
          snapshot_name: snapshotName || null,
          created_by: user.id
        });

      if (error) throw error;
      
      setSnapshotName('');
      fetchSnapshots();
      
      toast({
        title: 'Snapshot created',
        description: 'Your document snapshot has been saved'
      });
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast({
        title: 'Error',
        description: 'Failed to create snapshot',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteSnapshot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_snapshots')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSnapshots(snaps => snaps.filter(s => s.id !== id));
      toast({
        title: 'Snapshot deleted',
        description: 'The snapshot has been removed'
      });
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete snapshot',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border flex flex-col z-50">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Version History</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border space-y-3">
        <Input
          placeholder="Snapshot name (optional)"
          value={snapshotName}
          onChange={(e) => setSnapshotName(e.target.value)}
        />
        <Button 
          className="w-full" 
          onClick={createSnapshot}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          Take Snapshot
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No snapshots yet</p>
            <p className="text-sm">Take a snapshot to save this version</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {snapshots.map((snapshot) => (
              <div
                key={snapshot.id}
                className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm text-foreground line-clamp-1">
                    {snapshot.snapshot_name || snapshot.title}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRestore(snapshot.content, snapshot.title)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete snapshot?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteSnapshot(snapshot.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(snapshot.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
