import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  Download, 
  FileText,
  FileType,
  File,
  Clipboard,
  
  Scissors,
  Image,
  Table2,
  Link2,
  Shapes,
  Palette,
  LayoutGrid,
  Columns,
  Ruler,
  BookOpen,
  ListOrdered,
  Quote,
  FileCheck,
  Eye,
  Maximize2,
  Undo,
  Redo,
  Save,
  Grid3X3,
  ChevronDown,
  Minus,
  Plus,
  Square,
  Circle,
  Triangle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Printer,
  Copy,
  SpellCheck,
  Bold,
  Italic,
  Underline,
  Strikethrough
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Font options - using 'default' instead of empty string for Select component
const FONTS = [
  { value: 'default', label: 'Default' },
  { value: 'calibri', label: 'Calibri' },
  { value: 'times-new-roman', label: 'Times New Roman' },
  { value: 'arial', label: 'Arial' },
  { value: 'verdana', label: 'Verdana' },
  { value: 'georgia', label: 'Georgia' },
  { value: 'comic-sans', label: 'Comic Sans' },
  { value: 'segoe-ui', label: 'Segoe UI' },
  { value: 'tahoma', label: 'Tahoma' },
  { value: 'trebuchet', label: 'Trebuchet MS' },
  { value: 'courier-new', label: 'Courier New' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'monospace', label: 'Monospace' },
];

// Font sizes 1-50px
const FONT_SIZES = Array.from({ length: 50 }, (_, i) => ({
  value: `${i + 1}px`,
  label: `${i + 1}`,
}));

interface RibbonToolbarProps {
  onImportDocx: (file: File) => void;
  onExportHtml: () => void;
  onExportTxt: () => void;
  onExportPdf: () => void;
  onExportDocx: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onInsertTable?: (rows: number, cols: number) => void;
  onInsertImage?: (url: string) => void;
  onInsertLink?: (url: string, text: string) => void;
  onInsertShape?: (shape: string) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  onPrint?: () => void;
  onFullScreen?: () => void;
  getEditor?: () => any;
}

export default function RibbonToolbar({
  onImportDocx,
  onExportHtml,
  onExportTxt,
  onExportPdf,
  onExportDocx,
  onUndo,
  onRedo,
  onSave,
  onInsertTable,
  onInsertImage,
  onInsertLink,
  onInsertShape,
  zoom = 100,
  onZoomChange,
  onPrint,
  onFullScreen,
  getEditor
}: RibbonToolbarProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  // Font controls state
  const [currentFont, setCurrentFont] = useState('default');
  const [currentSize, setCurrentSize] = useState('16px');

  // Apply font to selected text
  const handleFontChange = (font: string) => {
    setCurrentFont(font);
    const editor = getEditor?.();
    if (editor) {
      editor.format('font', font === 'default' ? false : font);
    }
  };

  // Apply size to selected text
  const handleSizeChange = (size: string) => {
    setCurrentSize(size);
    const editor = getEditor?.();
    if (editor) {
      editor.format('size', size);
    }
  };

  // Formatting handlers
  const handleBold = () => {
    const editor = getEditor?.();
    if (editor) {
      const format = editor.getFormat();
      editor.format('bold', !format.bold);
    }
  };

  const handleItalic = () => {
    const editor = getEditor?.();
    if (editor) {
      const format = editor.getFormat();
      editor.format('italic', !format.italic);
    }
  };

  const handleUnderline = () => {
    const editor = getEditor?.();
    if (editor) {
      const format = editor.getFormat();
      editor.format('underline', !format.underline);
    }
  };

  const handleStrikethrough = () => {
    const editor = getEditor?.();
    if (editor) {
      const format = editor.getFormat();
      editor.format('strike', !format.strike);
    }
  };

  const handleAlign = (align: string) => {
    const editor = getEditor?.();
    if (editor) {
      editor.format('align', align === 'left' ? false : align);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      onImportDocx(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onInsertImage?.(dataUrl);
      };
      reader.readAsDataURL(file);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleInsertTable = () => {
    onInsertTable?.(tableRows, tableCols);
    setShowTableDialog(false);
    setTableRows(3);
    setTableCols(3);
  };

  const handleInsertImage = () => {
    if (imageUrl) {
      onInsertImage?.(imageUrl);
      setShowImageDialog(false);
      setImageUrl('');
    }
  };

  const handleInsertLink = () => {
    if (linkUrl) {
      onInsertLink?.(linkUrl, linkText);
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(200, Math.max(25, zoom + delta));
    onZoomChange?.(newZoom);
  };

  const handleCopy = async () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        await navigator.clipboard.writeText(selection.toString());
        toast({ title: 'Copied to clipboard' });
      }
    } catch (err) {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleCut = async () => {
    try {
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        await navigator.clipboard.writeText(selection.toString());
        document.execCommand('delete');
        toast({ title: 'Cut to clipboard' });
      }
    } catch (err) {
      toast({ title: 'Failed to cut', variant: 'destructive' });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.execCommand('insertText', false, text);
      toast({ title: 'Pasted from clipboard' });
    } catch (err) {
      toast({ title: 'Failed to paste', variant: 'destructive' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSpellCheck = () => {
    toast({ title: 'Spell check enabled', description: 'Browser spell check is active' });
  };

  return (
    <div className="border-b border-border bg-card">
      {/* Quick Access Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 bg-muted/30">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onSave} title="Save">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onUndo} title="Undo">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onRedo} title="Redo">
          <Redo className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4 mx-1" />
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handlePrint} title="Print">
          <Printer className="h-4 w-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent rounded-none border-b border-border/50 overflow-x-auto">
          <TabsTrigger 
            value="home" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            Home
          </TabsTrigger>
          <TabsTrigger 
            value="insert" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            Insert
          </TabsTrigger>
          <TabsTrigger 
            value="design" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            Design
          </TabsTrigger>
          <TabsTrigger 
            value="layout" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            Layout
          </TabsTrigger>
          <TabsTrigger 
            value="references" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            References
          </TabsTrigger>
          <TabsTrigger 
            value="review" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            Review
          </TabsTrigger>
          <TabsTrigger 
            value="view" 
            className="px-5 py-2.5 rounded-none data-[state=active]:bg-primary/10 data-[state=active]:border-b-2 data-[state=active]:border-primary font-medium"
          >
            View
          </TabsTrigger>
        </TabsList>

        {/* Home Tab */}
        <TabsContent value="home" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            {/* Clipboard Group */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted" onClick={handlePaste}>
                  <Clipboard className="h-6 w-6" />
                  <span className="text-xs">Paste</span>
                </Button>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 hover:bg-muted" onClick={handleCut}>
                    <Scissors className="h-3.5 w-3.5" />
                    Cut
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 hover:bg-muted" onClick={handleCopy}>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">Clipboard</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            {/* Font Group */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                {/* Font Family Dropdown */}
                <Select value={currentFont} onValueChange={handleFontChange}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border shadow-lg z-[100] max-h-[300px]">
                    <ScrollArea className="h-[280px]">
                      {FONTS.map((font) => (
                        <SelectItem 
                          key={font.value} 
                          value={font.value}
                          className="text-xs cursor-pointer"
                          style={{ fontFamily: font.value !== 'default' ? font.value.replace(/-/g, ' ') : 'inherit' }}
                        >
                          {font.label}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>

                {/* Font Size Dropdown */}
                <Select value={currentSize} onValueChange={handleSizeChange}>
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border shadow-lg z-[100] max-h-[300px]">
                    <ScrollArea className="h-[280px]">
                      {FONT_SIZES.map((size) => (
                        <SelectItem 
                          key={size.value} 
                          value={size.value}
                          className="text-xs cursor-pointer"
                        >
                          {size.label}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>

                {/* Format buttons */}
                <div className="flex items-center gap-0.5 ml-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleBold} title="Bold">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleItalic} title="Italic">
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleUnderline} title="Underline">
                    <Underline className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleStrikethrough} title="Strikethrough">
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                </div>

                {/* Alignment buttons */}
                <div className="flex items-center gap-0.5 ml-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAlign('left')} title="Align Left">
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAlign('center')} title="Align Center">
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAlign('right')} title="Align Right">
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleAlign('justify')} title="Justify">
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground">Font</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            {/* File Operations Group */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-14 flex-col gap-1 px-4 hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Import</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Download className="h-6 w-6" />
                      <span className="text-xs">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50 min-w-[160px]">
                    <DropdownMenuItem onClick={onExportPdf} className="gap-2 cursor-pointer">
                      <File className="h-4 w-4" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportDocx} className="gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Export as DOCX
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onExportHtml} className="gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      Export as HTML
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onExportTxt} className="gap-2 cursor-pointer">
                      <FileType className="h-4 w-4" />
                      Export as TXT
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted" onClick={handlePrint}>
                  <Printer className="h-6 w-6" />
                  <span className="text-xs">Print</span>
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">File</span>
            </div>
          </div>
        </TabsContent>

        {/* Insert Tab */}
        <TabsContent value="insert" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Table2 className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Table <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => onInsertTable?.(2, 2)} className="gap-2 cursor-pointer">
                      <Grid3X3 className="h-4 w-4" />
                      2 × 2 Table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInsertTable?.(3, 3)} className="gap-2 cursor-pointer">
                      <Grid3X3 className="h-4 w-4" />
                      3 × 3 Table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInsertTable?.(4, 4)} className="gap-2 cursor-pointer">
                      <Grid3X3 className="h-4 w-4" />
                      4 × 4 Table
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInsertTable?.(5, 5)} className="gap-2 cursor-pointer">
                      <Grid3X3 className="h-4 w-4" />
                      5 × 5 Table
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowTableDialog(true)} className="gap-2 cursor-pointer">
                      <Table2 className="h-4 w-4" />
                      Custom Table...
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Image className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Picture <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => imageInputRef.current?.click()} className="gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      Upload from Device
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowImageDialog(true)} className="gap-2 cursor-pointer">
                      <Link2 className="h-4 w-4" />
                      From URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Shapes className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Shapes <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem onClick={() => onInsertShape?.('rectangle')} className="gap-2 cursor-pointer">
                      <Square className="h-4 w-4" />
                      Rectangle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInsertShape?.('circle')} className="gap-2 cursor-pointer">
                      <Circle className="h-4 w-4" />
                      Circle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onInsertShape?.('triangle')} className="gap-2 cursor-pointer">
                      <Triangle className="h-4 w-4" />
                      Triangle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span className="text-[10px] text-muted-foreground">Illustrations</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            <div className="flex flex-col items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-14 flex-col gap-1 px-4 hover:bg-muted"
                onClick={() => setShowLinkDialog(true)}
              >
                <Link2 className="h-6 w-6" />
                <span className="text-xs">Link</span>
              </Button>
              <span className="text-[10px] text-muted-foreground">Links</span>
            </div>
          </div>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Palette className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Colors <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <div className="p-2 text-xs text-muted-foreground">
                      Use Quill toolbar color pickers below
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <FileText className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Fonts <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <div className="p-2 text-xs text-muted-foreground">
                      Use Quill toolbar font picker below
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span className="text-[10px] text-muted-foreground">Document Formatting</span>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Ruler className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Margins <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">Normal (1")</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Narrow (0.5")</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Wide (1.5")</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <LayoutGrid className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Orientation <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">Portrait</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Landscape</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Columns className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Columns <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">One</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Two</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Three</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span className="text-[10px] text-muted-foreground">Page Setup</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <AlignLeft className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Align <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <AlignLeft className="h-4 w-4" /> Left
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <AlignCenter className="h-4 w-4" /> Center
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <AlignRight className="h-4 w-4" /> Right
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <AlignJustify className="h-4 w-4" /> Justify
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span className="text-[10px] text-muted-foreground">Paragraph</span>
            </div>
          </div>
        </TabsContent>

        {/* References Tab */}
        <TabsContent value="references" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <BookOpen className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        TOC <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">Automatic Table</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Manual Table</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <ListOrdered className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Footnotes <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">Insert Footnote</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Insert Endnote</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted">
                      <Quote className="h-6 w-6" />
                      <span className="text-xs flex items-center gap-0.5">
                        Citations <ChevronDown className="h-3 w-3" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-card border border-border shadow-lg z-50">
                    <DropdownMenuItem className="gap-2 cursor-pointer">Insert Citation</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">Manage Sources</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <span className="text-[10px] text-muted-foreground">References</span>
            </div>
          </div>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted" onClick={handleSpellCheck}>
                  <SpellCheck className="h-6 w-6" />
                  <span className="text-xs">Spelling</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted" onClick={handleSpellCheck}>
                  <FileCheck className="h-6 w-6" />
                  <span className="text-xs">Grammar</span>
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">Proofing</span>
            </div>
          </div>
        </TabsContent>

        {/* View Tab */}
        <TabsContent value="view" className="m-0 p-3">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted opacity-50" disabled>
                  <Eye className="h-6 w-6" />
                  <span className="text-xs">Read Mode</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-14 flex-col gap-1 px-4 hover:bg-muted" onClick={handleFullScreen}>
                  <Maximize2 className="h-6 w-6" />
                  <span className="text-xs">Full Screen</span>
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">Views</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-muted"
                  onClick={() => handleZoom(-10)}
                  disabled={zoom <= 25}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 min-w-[140px]">
                  <Slider
                    value={[zoom]}
                    onValueChange={([value]) => onZoomChange?.(value)}
                    min={25}
                    max={200}
                    step={5}
                    className="w-20"
                  />
                  <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 w-9 p-0 hover:bg-muted"
                  onClick={() => handleZoom(10)}
                  disabled={zoom >= 200}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">Zoom</span>
            </div>

            <Separator orientation="vertical" className="h-16" />

            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  onClick={() => onZoomChange?.(50)}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  onClick={() => onZoomChange?.(100)}
                >
                  100%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 px-3 text-xs"
                  onClick={() => onZoomChange?.(150)}
                >
                  150%
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">Presets</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Table Dialog */}
      <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rows" className="text-right">Rows</Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={20}
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cols" className="text-right">Columns</Label>
              <Input
                id="cols"
                type="number"
                min={1}
                max={10}
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTableDialog(false)}>Cancel</Button>
            <Button onClick={handleInsertTable}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image URL Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Image from URL</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>Cancel</Button>
            <Button onClick={handleInsertImage} disabled={!imageUrl}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="linkText">Display Text (optional)</Label>
              <Input
                id="linkText"
                type="text"
                placeholder="Click here"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>Cancel</Button>
            <Button onClick={handleInsertLink} disabled={!linkUrl}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}