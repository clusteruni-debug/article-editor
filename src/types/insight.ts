export type ActionType = 'execute' | 'idea' | 'observe' | 'reference';
export type InsightStatus = 'unread' | 'idea' | 'drafted' | 'published';
export type Platform = 'twitter' | 'blog' | 'instagram' | 'thread' | 'newsletter';

export const ACTION_TYPE_LABELS: Record<ActionType, { emoji: string; label: string }> = {
  execute: { emoji: '🔥', label: '실행' },
  idea: { emoji: '💡', label: '아이디어' },
  observe: { emoji: '👀', label: '관찰' },
  reference: { emoji: '📌', label: '참고만' },
};

export const STATUS_LABELS: Record<InsightStatus, { label: string; color: string }> = {
  unread: { label: '미확인', color: 'gray' },
  idea: { label: '아이디어', color: 'blue' },
  drafted: { label: '작성중', color: 'yellow' },
  published: { label: '발행완료', color: 'green' },
};

// 기본 추천 태그 (사용자가 태그 기능을 인지할 수 있도록)
export const DEFAULT_TAGS = [
  '크립토', '생산성', '투자', '커리어', 'AI', '마케팅', '트렌드', '개발',
];

export const PLATFORM_LABELS: Record<Platform, string> = {
  twitter: 'X (Twitter)',
  blog: '블로그',
  instagram: '인스타그램',
  thread: '스레드',
  newsletter: '뉴스레터',
};

export interface Insight {
  id: string;
  keyword: string;
  summary?: string;
  source?: string;
  source_id?: string;
  link?: string;
  insight_date: string;
  action_type: ActionType;
  status: InsightStatus;
  linked_article_id?: string;
  platforms_published: Platform[];
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsightInsert {
  keyword: string;
  summary?: string;
  source?: string;
  source_id?: string;
  link?: string;
  insight_date?: string;
  action_type?: ActionType;
  status?: InsightStatus;
  linked_article_id?: string;
  platforms_published?: Platform[];
  tags?: string[];
  notes?: string;
}

export interface InsightUpdate {
  keyword?: string;
  summary?: string;
  source?: string;
  source_id?: string;
  link?: string;
  insight_date?: string;
  action_type?: ActionType;
  status?: InsightStatus;
  linked_article_id?: string;
  platforms_published?: Platform[];
  tags?: string[];
  notes?: string;
}

export interface InsightWithArticle extends Insight {
  article?: {
    id: string;
    title: string;
    status: 'draft' | 'published';
  };
}
