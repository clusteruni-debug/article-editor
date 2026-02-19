import { JSONContent } from '@tiptap/react';

// JSON Content를 Markdown으로 변환
function jsonToMarkdown(content: JSONContent, level = 0): string {
  let markdown = '';

  if (content.type === 'doc' && content.content) {
    return content.content.map((node) => jsonToMarkdown(node, level)).join('\n\n');
  }

  if (content.type === 'paragraph') {
    if (content.content) {
      markdown = content.content.map((node) => jsonToMarkdown(node, level)).join('');
    }
    return markdown;
  }

  if (content.type === 'heading') {
    const hashes = '#'.repeat(content.attrs?.level || 1);
    const text = content.content?.map((node) => jsonToMarkdown(node, level)).join('') || '';
    return `${hashes} ${text}`;
  }

  if (content.type === 'bulletList' && content.content) {
    return content.content
      .map((item) => {
        const text = item.content?.map((node) => jsonToMarkdown(node, level)).join('') || '';
        return `- ${text}`;
      })
      .join('\n');
  }

  if (content.type === 'orderedList' && content.content) {
    return content.content
      .map((item, index) => {
        const text = item.content?.map((node) => jsonToMarkdown(node, level)).join('') || '';
        return `${index + 1}. ${text}`;
      })
      .join('\n');
  }

  if (content.type === 'listItem' && content.content) {
    return content.content.map((node) => jsonToMarkdown(node, level)).join('');
  }

  if (content.type === 'blockquote' && content.content) {
    const text = content.content.map((node) => jsonToMarkdown(node, level)).join('\n');
    return text.split('\n').map((line) => `> ${line}`).join('\n');
  }

  if (content.type === 'image') {
    const src = content.attrs?.src || '';
    const alt = content.attrs?.alt || '';
    return `![${alt}](${src})`;
  }

  if (content.type === 'text') {
    let text = content.text || '';

    if (content.marks) {
      for (const mark of content.marks) {
        if (mark.type === 'bold') text = `**${text}**`;
        if (mark.type === 'italic') text = `*${text}*`;
        if (mark.type === 'strike') text = `~~${text}~~`;
        if (mark.type === 'underline') text = `<u>${text}</u>`;
      }
    }

    return text;
  }

  return markdown;
}

// 파일 다운로드 유틸리티
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// JSON으로 내보내기
export function exportAsJSON(article: {
  title: string;
  content: JSONContent;
  tags?: string[];
}) {
  const data = {
    title: article.title,
    content: article.content,
    tags: article.tags || [],
    exportedAt: new Date().toISOString(),
  };

  const filename = `${article.title || 'untitled'}.json`;
  downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
}

// Markdown으로 내보내기
export function exportAsMarkdown(article: {
  title: string;
  content: JSONContent;
  tags?: string[];
}) {
  let markdown = '';

  // 제목
  if (article.title) {
    markdown += `# ${article.title}\n\n`;
  }

  // 태그
  if (article.tags && article.tags.length > 0) {
    markdown += `**Tags:** ${article.tags.map((t) => `#${t}`).join(' ')}\n\n---\n\n`;
  }

  // 본문
  markdown += jsonToMarkdown(article.content);

  const filename = `${article.title || 'untitled'}.md`;
  downloadFile(markdown, filename, 'text/markdown');
}

// HTML로 내보내기
export function exportAsHTML(article: {
  title: string;
  html: string;
  tags?: string[];
}) {
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title || 'Untitled'}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 680px; margin: 0 auto; padding: 40px 20px; line-height: 1.75; }
    h1 { font-family: -apple-system, sans-serif; font-size: 32px; margin-bottom: 16px; }
    h2 { font-family: -apple-system, sans-serif; font-size: 24px; margin-top: 40px; }
    h3 { font-family: -apple-system, sans-serif; font-size: 20px; margin-top: 32px; }
    img { max-width: 100%; border-radius: 8px; }
    blockquote { border-left: 3px solid #e1e8ed; padding-left: 20px; color: #657786; font-style: italic; }
    .tags { color: #657786; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>${article.title || ''}</h1>
  ${article.tags && article.tags.length > 0 ? `<p class="tags">${article.tags.map((t) => `#${t}`).join(' ')}</p>` : ''}
  ${article.html}
</body>
</html>`;

  const filename = `${article.title || 'untitled'}.html`;
  downloadFile(htmlContent, filename, 'text/html');
}
