
import { useEditor, EditorContent, type Content } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, ListOrdered, ListUnordered
} from 'lucide-react';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const RichTextEditor = ({ value, onChange, readOnly = false }: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline
    ],
    content: value || '<p></p>',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Ensure component is mounted before editor initialization
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value || '<p></p>');
    }
  }, [editor, value]);

  if (!editor || !isMounted) {
    return (
      <div className="border rounded-md min-h-[150px] p-4 bg-muted/20">
        <div className="animate-pulse h-4 w-3/4 bg-muted mb-2 rounded"></div>
        <div className="animate-pulse h-4 w-1/2 bg-muted mb-2 rounded"></div>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem
              size="sm"
              value="bold"
              aria-label="تخين"
              pressed={editor.isActive('bold')}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="italic"
              aria-label="مائل"
              pressed={editor.isActive('italic')}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="underline"
              aria-label="تسطير"
              pressed={editor.isActive('underline')}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="strike"
              aria-label="خط وسطي"
              pressed={editor.isActive('strike')}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="border-r mx-1 h-6"></div>
          
          <ToggleGroup type="single" className="justify-start">
            <ToggleGroupItem
              size="sm"
              value="left"
              aria-label="محاذاة لليسار"
              pressed={editor.isActive({ textAlign: 'left' })}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="center"
              aria-label="توسيط"
              pressed={editor.isActive({ textAlign: 'center' })}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="right"
              aria-label="محاذاة لليمين"
              pressed={editor.isActive({ textAlign: 'right' })}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="border-r mx-1 h-6"></div>
          
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem
              size="sm"
              value="bulletList"
              aria-label="قائمة نقطية"
              pressed={editor.isActive('bulletList')}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <ListUnordered className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="orderedList"
              aria-label="قائمة رقمية"
              pressed={editor.isActive('orderedList')}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        dir="auto"
        className="prose prose-sm max-w-none p-4 focus:outline-none min-h-[150px]"
      />
    </div>
  );
};

export default RichTextEditor;
