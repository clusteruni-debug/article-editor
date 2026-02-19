export type StatsPlatform = 'twitter' | 'blog' | 'instagram' | 'thread' | 'newsletter';

export const STATS_PLATFORM_LABELS: Record<StatsPlatform, { name: string; icon: string }> = {
  twitter: { name: 'X (Twitter)', icon: '𝕏' },
  blog: { name: '블로그', icon: '📝' },
  instagram: { name: '인스타그램', icon: '📸' },
  thread: { name: 'Threads', icon: '🧵' },
  newsletter: { name: '뉴스레터', icon: '📧' },
};

export interface ArticleStats {
  id: string;
  article_id: string;
  platform: StatsPlatform;
  platform_post_url?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  impressions: number;
  reach: number;
  engagement_rate?: number;
  recorded_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleStatsInsert {
  article_id: string;
  platform: StatsPlatform;
  platform_post_url?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
  engagement_rate?: number;
  recorded_at?: string;
  notes?: string;
}

export interface ArticleStatsUpdate {
  platform_post_url?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  impressions?: number;
  reach?: number;
  engagement_rate?: number;
  notes?: string;
}

// 집계된 통계
export interface AggregatedStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  byPlatform: Record<StatsPlatform, {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  }>;
  byTag: Record<string, {
    articleCount: number;
    totalViews: number;
    avgEngagement: number;
  }>;
}

export interface StatsWithArticle extends ArticleStats {
  article?: {
    id: string;
    title: string;
    tags: string[];
  };
}
