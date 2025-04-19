
import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, ListOrdered, List
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const RichTextEditor = ({ value, onChange, readOnly = false }: RichTextEditorProps) => {
  const [isMounted, setIsMounted] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[150px]',
          'rtl:text-right ltr:text-left',
          readOnly && 'pointer-events-none'
        )
      }
    },
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    setIsMounted(true);
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value) {
      editor.commands.setContent(value);
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
    <div className={cn(
      "border rounded-md",
      readOnly && "bg-muted/10"
    )}>
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50" dir="ltr">
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem
              size="sm"
              value="bold"
              aria-label="Bold"
              data-state={editor.isActive('bold') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="italic"
              aria-label="Italic"
              data-state={editor.isActive('italic') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="underline"
              aria-label="Underline"
              data-state={editor.isActive('underline') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="strike"
              aria-label="Strike"
              data-state={editor.isActive('strike') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="border-r mx-1 h-6"></div>
          
          <ToggleGroup type="single" value={editor.isActive({ textAlign: 'center' }) ? 'center' : editor.isActive({ textAlign: 'right' }) ? 'right' : 'left'}>
            <ToggleGroupItem
              size="sm"
              value="right"
              aria-label="Align Right"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <AlignRight className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="center"
              aria-label="Align Center"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <AlignCenter className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="left"
              aria-label="Align Left"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <AlignLeft className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
          <div className="border-r mx-1 h-6"></div>
          
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem
              size="sm"
              value="bulletList"
              aria-label="Bullet List"
              data-state={editor.isActive('bulletList') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              size="sm"
              value="orderedList"
              aria-label="Ordered List"
              data-state={editor.isActive('orderedList') ? 'on' : 'off'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
      <div className="p-4">
        <EditorContent editor={editor} dir="auto" />
      </div>
    </div>
  );
};

export default RichTextEditor;
