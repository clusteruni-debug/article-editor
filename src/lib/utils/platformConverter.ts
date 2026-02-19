import { JSONContent } from '@tiptap/react';

export type PlatformType = 'twitter' | 'blog' | 'instagram' | 'thread';

export interface ConvertedContent {
  platform: PlatformType;
  title: string;
  content: string[];  // 배열로 (트위터 스레드 등)
  charCount: number;
  hashtags: string[];
}

// JSON Content에서 텍스트 추출
function extractText(node: JSONContent): string {
  let text = '';

  if (node.type === 'text' && node.text) {
    text += node.text;
  }

  if (node.content) {
    for (const child of node.content) {
      text += extractText(child);
    }
  }

  // 단락 끝에 줄바꿈 추가
  if (node.type === 'paragraph' || node.type === 'heading') {
    text += '\n\n';
  }

  if (node.type === 'bulletList' || node.type === 'orderedList') {
    text += '\n';
  }

  if (node.type === 'listItem') {
    text = '• ' + text.trim() + '\n';
  }

  return text;
}

// 텍스트를 특정 길이로 분할 (단어 단위)
function splitByLength(text: string, maxLength: number): string[] {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const words = paragraph.split(' ');

    for (const word of words) {
      const testChunk = currentChunk ? `${currentChunk} ${word}` : word;

      if (testChunk.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = word;
        } else {
          // 단어 자체가 너무 긴 경우
          chunks.push(word.slice(0, maxLength));
          currentChunk = word.slice(maxLength);
        }
      } else {
        currentChunk = testChunk;
      }
    }

    // 단락 끝에 줄바꿈 추가
    if (currentChunk && !currentChunk.endsWith('\n')) {
      currentChunk += '\n\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// 태그에서 해시태그 생성
function tagsToHashtags(tags: string[]): string[] {
  return tags.map(tag => `#${tag.replace(/\s+/g, '')}`);
}

// X (Twitter) 스레드 변환 - 280자 제한
export function convertToTwitterThread(
  title: string,
  content: JSONContent,
  tags: string[]
): ConvertedContent {
  const text = extractText(content).trim();
  const hashtags = tagsToHashtags(tags);
  const hashtagStr = hashtags.slice(0, 3).join(' ');

  // 첫 트윗: 제목 + 해시태그
  const firstTweet = `${title}\n\n${hashtagStr}\n\n🧵 스레드 👇`;

  // 본문을 260자 단위로 분할 (번호 공간 확보)
  const chunks = splitByLength(text, 260);

  // 번호 붙이기
  const threads = [firstTweet];
  chunks.forEach((chunk, i) => {
    threads.push(`${i + 1}/${chunks.length}\n\n${chunk}`);
  });

  // 마지막 트윗
  threads.push(`${chunks.length + 1}/${chunks.length + 1}\n\n이 글이 도움이 됐다면 RT & 좋아요 부탁드려요! 🙏\n\n${hashtagStr}`);

  return {
    platform: 'twitter',
    title,
    content: threads,
    charCount: threads.reduce((sum, t) => sum + t.length, 0),
    hashtags,
  };
}

// 블로그 변환 - Markdown 형식
export function convertToBlog(
  title: string,
  content: JSONContent,
  tags: string[]
): ConvertedContent {
  const hashtags = tagsToHashtags(tags);

  let markdown = `# ${title}\n\n`;
  markdown += `${hashtags.join(' ')}\n\n`;
  markdown += `---\n\n`;

  // JSON을 마크다운으로 변환
  function nodeToMarkdown(node: JSONContent, depth = 0): string {
    let md = '';

    if (node.type === 'heading') {
      const level = node.attrs?.level || 1;
      md += '#'.repeat(level + 1) + ' ';
    }

    if (node.type === 'bulletList') {
      if (node.content) {
        for (const item of node.content) {
          md += '- ' + nodeToMarkdown(item, depth + 1).trim() + '\n';
        }
      }
      return md + '\n';
    }

    if (node.type === 'orderedList') {
      if (node.content) {
        node.content.forEach((item, i) => {
          md += `${i + 1}. ` + nodeToMarkdown(item, depth + 1).trim() + '\n';
        });
      }
      return md + '\n';
    }

    if (node.type === 'blockquote') {
      if (node.content) {
        for (const child of node.content) {
          md += '> ' + nodeToMarkdown(child, depth).trim() + '\n';
        }
      }
      return md + '\n';
    }

    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') text = `**${text}**`;
          if (mark.type === 'italic') text = `*${text}*`;
          if (mark.type === 'strike') text = `~~${text}~~`;
        }
      }
      return text;
    }

    if (node.type === 'image') {
      return `![](${node.attrs?.src || ''})\n\n`;
    }

    if (node.content) {
      for (const child of node.content) {
        md += nodeToMarkdown(child, depth);
      }
    }

    if (node.type === 'paragraph' || node.type === 'heading') {
      md += '\n\n';
    }

    return md;
  }

  markdown += nodeToMarkdown(content);

  return {
    platform: 'blog',
    title,
    content: [markdown.trim()],
    charCount: markdown.length,
    hashtags,
  };
}

// 인스타그램 캡션 변환 - 2200자 제한
export function convertToInstagram(
  title: string,
  content: JSONContent,
  tags: string[]
): ConvertedContent {
  const text = extractText(content).trim();
  const hashtags = tagsToHashtags(tags);

  // 인스타 캡션 형식
  let caption = `✨ ${title} ✨\n\n`;
  caption += `━━━━━━━━━━━━━━━\n\n`;

  // 본문 (줄여서)
  const maxBodyLength = 1800 - title.length;
  const body = text.length > maxBodyLength
    ? text.slice(0, maxBodyLength) + '...\n\n(전문은 프로필 링크에서 확인하세요!)'
    : text;

  caption += body + '\n\n';
  caption += `━━━━━━━━━━━━━━━\n\n`;
  caption += `💬 여러분의 생각은 어떠신가요?\n`;
  caption += `댓글로 알려주세요! 👇\n\n`;
  caption += `.\n.\n.\n\n`;
  caption += hashtags.join(' ');

  return {
    platform: 'instagram',
    title,
    content: [caption],
    charCount: caption.length,
    hashtags,
  };
}

// Threads 변환 - 500자 제한
export function convertToThreads(
  title: string,
  content: JSONContent,
  tags: string[]
): ConvertedContent {
  const text = extractText(content).trim();
  const hashtags = tagsToHashtags(tags);
  const hashtagStr = hashtags.slice(0, 5).join(' ');

  // 첫 포스트: 제목
  const firstPost = `${title}\n\n👇 이어서`;

  // 본문을 450자 단위로 분할
  const chunks = splitByLength(text, 450);

  const threads = [firstPost];
  chunks.forEach((chunk) => {
    threads.push(chunk);
  });

  // 마지막 포스트
  threads.push(`💡 도움이 됐다면 공유해주세요!\n\n${hashtagStr}`);

  return {
    platform: 'thread',
    title,
    content: threads,
    charCount: threads.reduce((sum, t) => sum + t.length, 0),
    hashtags,
  };
}

// 모든 플랫폼으로 변환
export function convertToAllPlatforms(
  title: string,
  content: JSONContent,
  tags: string[]
): Record<PlatformType, ConvertedContent> {
  return {
    twitter: convertToTwitterThread(title, content, tags),
    blog: convertToBlog(title, content, tags),
    instagram: convertToInstagram(title, content, tags),
    thread: convertToThreads(title, content, tags),
  };
}

export const PLATFORM_INFO: Record<PlatformType, { name: string; icon: string; limit: string }> = {
  twitter: { name: 'X (Twitter)', icon: '𝕏', limit: '280자/트윗' },
  blog: { name: '블로그', icon: '📝', limit: '무제한' },
  instagram: { name: '인스타그램', icon: '📸', limit: '2,200자' },
  thread: { name: 'Threads', icon: '🧵', limit: '500자/포스트' },
};
