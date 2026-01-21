import { forwardRef, useRef, useMemo, useImperativeHandle } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// Register custom fonts
const Font = Quill.import('formats/font') as any;
Font.whitelist = [
  false, // Default font
  'calibri', 'times-new-roman', 'arial', 'verdana', 'georgia', 
  'comic-sans', 'segoe-ui', 'tahoma', 'trebuchet', 'courier-new',
  'sans-serif', 'serif', 'monospace'
];
Quill.register(Font, true);

// Register custom sizes (1-50px)
const Size = Quill.import('formats/size') as any;
const sizes = [false, ...Array.from({ length: 50 }, (_, i) => `${i + 1}px`)];
Size.whitelist = sizes;
Quill.register(Size, true);

export interface QuillEditorRef {
  getEditor: () => any;
  insertTable: (rows: number, cols: number) => void;
  insertImage: (url: string) => void;
  insertLink: (url: string, text: string) => void;
  insertShape: (shape: string) => void;
}

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  zoom?: number;
}

const QuillEditor = forwardRef<QuillEditorRef, QuillEditorProps>(
  ({ value, onChange, zoom = 100 }, ref) => {
    const quillRef = useRef<ReactQuill>(null);

    useImperativeHandle(ref, () => ({
      getEditor: () => quillRef.current?.getEditor(),
      insertTable: (rows: number, cols: number) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        
        const range = quill.getSelection(true);
        let tableHtml = '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;"><tbody>';
        for (let i = 0; i < rows; i++) {
          tableHtml += '<tr>';
          for (let j = 0; j < cols; j++) {
            tableHtml += '<td style="border: 1px solid #ccc; padding: 8px; min-width: 50px;">&nbsp;</td>';
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';
        
        quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml);
      },
      insertImage: (url: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', url);
        quill.setSelection(range.index + 1, 0);
      },
      insertLink: (url: string, text: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        
        const range = quill.getSelection(true);
        if (range.length > 0) {
          quill.format('link', url);
        } else {
          quill.insertText(range.index, text || url, 'link', url);
          quill.setSelection(range.index + (text || url).length, 0);
        }
      },
      insertShape: (shape: string) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        
        const range = quill.getSelection(true);
        let shapeHtml = '';
        
        switch (shape) {
          case 'rectangle':
            shapeHtml = '<div style="width: 100px; height: 60px; border: 2px solid #333; background: #f0f0f0; display: inline-block; margin: 5px;"></div>';
            break;
          case 'circle':
            shapeHtml = '<div style="width: 60px; height: 60px; border: 2px solid #333; background: #f0f0f0; border-radius: 50%; display: inline-block; margin: 5px;"></div>';
            break;
          case 'triangle':
            shapeHtml = '<div style="width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 70px solid #333; display: inline-block; margin: 5px;"></div>';
            break;
        }
        
        quill.clipboard.dangerouslyPasteHTML(range.index, shapeHtml + '<p><br></p>');
      }
    }));

    const modules = useMemo(() => ({
      toolbar: false, // Disable default toolbar - using ribbon toolbar instead
      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true
      }
    }), []);

    const formats = useMemo(() => [
      'font',
      'size',
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'bullet',
      'indent',
      'align',
      'link',
      'image',
      'blockquote',
      'code-block'
    ], []);

    return (
      <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%` }}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing your document..."
        />
      </div>
    );
  }
);

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;