import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import EditorHeader from '@/components/editor/EditorHeader';
import RibbonToolbar from '@/components/editor/RibbonToolbar';
import QuillEditor, { QuillEditorRef } from '@/components/editor/QuillEditor';
import SnapshotPanel from '@/components/editor/SnapshotPanel';

interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
}

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const quillRef = useRef<QuillEditorRef>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  // Real-time subscription for document updates
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`document-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'documents',
          filter: `id=eq.${id}`
        },
        (payload) => {
          // Only update if content changed from another session
          const newDoc = payload.new as Document;
          if (newDoc.content !== document?.content) {
            setDocument(prev => prev ? { ...prev, ...newDoc } : null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, document?.content]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data.owner_id !== user?.id) {
        toast({
          title: 'Access denied',
          description: 'You do not have permission to view this document',
          variant: 'destructive'
        });
        navigate('/dashboard');
        return;
      }
      
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast({
        title: 'Error',
        description: 'Failed to load document',
        variant: 'destructive'
      });
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDocument = useCallback(async (title: string, content: string) => {
    if (!id || !user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ title, content })
        .eq('id', id);

      if (error) throw error;
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [id, user]);

  const handleContentChange = useCallback((content: string) => {
    if (!document) return;
    
    setDocument(prev => prev ? { ...prev, content } : null);
    
    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(document.title, content);
    }, 1000);
  }, [document, saveDocument]);

  const handleTitleChange = useCallback((title: string) => {
    if (!document) return;
    
    setDocument(prev => prev ? { ...prev, title } : null);
    
    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(title, document.content);
    }, 1000);
  }, [document, saveDocument]);

  const handleImportDocx = async (file: File) => {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      
      if (quillRef.current) {
        const quill = quillRef.current.getEditor();
        quill.clipboard.dangerouslyPasteHTML(result.value);
        handleContentChange(quill.root.innerHTML);
      }
      
      toast({
        title: 'Document imported',
        description: 'Your Word document has been imported successfully'
      });
    } catch (error) {
      console.error('Error importing docx:', error);
      toast({
        title: 'Import failed',
        description: 'Failed to import the Word document',
        variant: 'destructive'
      });
    }
  };

  const handleExportHtml = () => {
    if (!document) return;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
  <style>
    body { font-family: 'Times New Roman', Times, serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
  </style>
</head>
<body>
${document.content}
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTxt = () => {
    if (!document || !quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const text = quill.getText();
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!document) return;
    
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = window.document.createElement('div');
      element.innerHTML = document.content;
      element.style.fontFamily = 'Times New Roman, Times, serif';
      element.style.padding = '20px';
      
      const opt = {
        margin: 1,
        filename: `${document.title}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: 'PDF exported',
        description: 'Your document has been exported as PDF'
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export the document as PDF',
        variant: 'destructive'
      });
    }
  };

  const handleExportDocx = async () => {
    if (!document) return;
    
    try {
      const { asBlob } = await import('html-docx-js-typescript');
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${document.title}</title>
</head>
<body>
${document.content}
</body>
</html>`;
      
      const blob = await asBlob(htmlContent) as Blob;
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.title}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'DOCX exported',
        description: 'Your document has been exported as DOCX'
      });
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export the document as DOCX',
        variant: 'destructive'
      });
    }
  };

  const handleInsertTable = (rows: number, cols: number) => {
    quillRef.current?.insertTable(rows, cols);
    toast({
      title: 'Table inserted',
      description: `A ${rows}×${cols} table has been added`
    });
  };

  const handleInsertImage = (url: string) => {
    quillRef.current?.insertImage(url);
    toast({
      title: 'Image inserted',
      description: 'The image has been added to your document'
    });
  };

  const handleInsertLink = (url: string, text: string) => {
    quillRef.current?.insertLink(url, text);
    toast({
      title: 'Link inserted',
      description: 'The link has been added to your document'
    });
  };

  const handleInsertShape = (shape: string) => {
    quillRef.current?.insertShape(shape);
    toast({
      title: 'Shape inserted',
      description: `A ${shape} shape has been added`
    });
  };

  const handleRestoreSnapshot = (content: string, title: string) => {
    setDocument(prev => prev ? { ...prev, content, title } : null);
    
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.clipboard.dangerouslyPasteHTML(content);
    }
    
    saveDocument(title, content);
    setShowSnapshots(false);
    
    toast({
      title: 'Snapshot restored',
      description: 'The document has been restored to the selected snapshot'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EditorHeader
        title={document.title}
        onTitleChange={handleTitleChange}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onBack={() => navigate('/dashboard')}
        onToggleSnapshots={() => setShowSnapshots(!showSnapshots)}
      />
      
      <div className="flex-1 flex">
        <div className={`flex-1 flex flex-col transition-all ${showSnapshots ? 'mr-80' : ''}`}>
          <RibbonToolbar
            onImportDocx={handleImportDocx}
            onExportHtml={handleExportHtml}
            onExportTxt={handleExportTxt}
            onExportPdf={handleExportPdf}
            onExportDocx={handleExportDocx}
            onUndo={() => quillRef.current?.getEditor()?.history?.undo()}
            onRedo={() => quillRef.current?.getEditor()?.history?.redo()}
            onSave={() => document && saveDocument(document.title, document.content)}
            onInsertTable={handleInsertTable}
            onInsertImage={handleInsertImage}
            onInsertLink={handleInsertLink}
            onInsertShape={handleInsertShape}
            zoom={zoom}
            onZoomChange={setZoom}
            getEditor={() => quillRef.current?.getEditor()}
          />
          
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto paper-canvas">
              <QuillEditor
                ref={quillRef}
                value={document.content}
                onChange={handleContentChange}
                zoom={zoom}
              />
            </div>
          </div>
        </div>
        
        {showSnapshots && (
          <SnapshotPanel
            documentId={document.id}
            currentContent={document.content}
            currentTitle={document.title}
            onRestore={handleRestoreSnapshot}
            onClose={() => setShowSnapshots(false)}
          />
        )}
      </div>
    </div>
  );
}