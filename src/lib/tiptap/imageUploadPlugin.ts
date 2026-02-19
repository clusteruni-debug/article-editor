import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export type ImageUploadFn = (file: File) => Promise<string>;

export const ImageUploadExtension = (uploadFn: ImageUploadFn) =>
  Extension.create({
    name: 'imageUpload',

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey('imageUpload'),
          props: {
            handlePaste: (view, event) => {
              const items = event.clipboardData?.items;
              if (!items) return false;

              for (const item of Array.from(items)) {
                if (item.type.startsWith('image/')) {
                  event.preventDefault();
                  const file = item.getAsFile();
                  if (!file) return false;

                  // 이미지 업로드 후 에디터에 삽입
                  uploadFn(file)
                    .then((url) => {
                      const { schema } = view.state;
                      const node = schema.nodes.image.create({ src: url });
                      const transaction = view.state.tr.replaceSelectionWith(node);
                      view.dispatch(transaction);
                    })
                    .catch((error) => {
                      console.error('이미지 업로드 실패:', error);
                    });

                  return true;
                }
              }
              return false;
            },

            handleDrop: (view, event, _slice, moved) => {
              if (moved) return false;

              const files = event.dataTransfer?.files;
              if (!files?.length) return false;

              for (const file of Array.from(files)) {
                if (file.type.startsWith('image/')) {
                  event.preventDefault();

                  const coordinates = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY,
                  });

                  uploadFn(file)
                    .then((url) => {
                      const { schema, tr } = view.state;
                      const node = schema.nodes.image.create({ src: url });

                      if (coordinates) {
                        const transaction = tr.insert(coordinates.pos, node);
                        view.dispatch(transaction);
                      }
                    })
                    .catch((error) => {
                      console.error('이미지 업로드 실패:', error);
                    });

                  return true;
                }
              }
              return false;
            },
          },
        }),
      ];
    },
  });
