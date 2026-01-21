import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Upload, 
  Download, 
  FileText,
  FileType,
  File
} from 'lucide-react';

interface EditorToolbarProps {
  onImportDocx: (file: File) => void;
  onExportHtml: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
}

export default function EditorToolbar({
  onImportDocx,
  onExportHtml,
  onExportTxt,
  onExportPdf,
  onExportDocx
}: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      onImportDocx(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border-b border-border bg-card px-4 py-2 flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import .docx
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onExportPdf}>
            <File className="h-4 w-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportDocx}>
            <FileText className="h-4 w-4 mr-2" />
            Export as DOCX
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportHtml}>
            <FileText className="h-4 w-4 mr-2" />
            Export as HTML
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportTxt}>
            <FileType className="h-4 w-4 mr-2" />
            Export as TXT
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
