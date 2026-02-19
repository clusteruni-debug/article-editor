import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class: 'article-image',
    },
  }),
  Placeholder.configure({
    placeholder: '이야기를 시작하세요...',
    emptyEditorClass: 'is-editor-empty',
  }),
  Underline,
];
