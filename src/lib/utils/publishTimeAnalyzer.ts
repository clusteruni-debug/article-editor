import { StatsPlatform } from '@/types/stats';

// 플랫폼별 일반적인 최적 발행 시간 (한국 시간 기준)
export const DEFAULT_BEST_TIMES: Record<StatsPlatform, { times: string[]; days: string[]; reason: string }> = {
  twitter: {
    times: ['08:00', '12:00', '18:00', '21:00'],
    days: ['화', '수', '목'],
    reason: '출퇴근 시간과 점심시간에 활동량이 높음',
  },
  blog: {
    times: ['09:00', '14:00', '20:00'],
    days: ['화', '수', '목'],
    reason: '오전 업무 시작 전, 점심 후, 저녁 여유 시간',
  },
  instagram: {
    times: ['07:00', '12:00', '19:00', '21:00'],
    days: ['월', '수', '금', '토'],
    reason: '아침 기상 후, 점심, 퇴근 후 피크타임',
  },
  thread: {
    times: ['08:00', '12:00', '20:00'],
    days: ['화', '수', '목', '일'],
    reason: '출근길, 점심, 저녁 휴식 시간',
  },
  newsletter: {
    times: ['06:00', '09:00', '14:00'],
    days: ['화', '목'],
    reason: '이메일 확인이 많은 평일 오전',
  },
};

// 요일 인덱스 변환
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export interface TimeRecommendation {
  platform: StatsPlatform;
  recommendedTimes: {
    time: string;
    day: string;
    score: number;  // 1-100
    reason: string;
  }[];
  bestTime: {
    time: string;
    day: string;
  };
  insights: string[];
}

export interface PublishTimeStats {
  platform: StatsPlatform;
  recorded_at: string;
  views: number;
  engagement_rate?: number;
}

// 성과 데이터 기반 시간 분석
export function analyzePublishTimes(
  statsData: PublishTimeStats[]
): Record<StatsPlatform, TimeRecommendation> {
  const result: Record<StatsPlatform, TimeRecommendation> = {} as Record<StatsPlatform, TimeRecommendation>;

  const platforms: StatsPlatform[] = ['twitter', 'blog', 'instagram', 'thread', 'newsletter'];

  for (const platform of platforms) {
    const platformStats = statsData.filter((s) => s.platform === platform);
    const defaultTimes = DEFAULT_BEST_TIMES[platform];

    if (platformStats.length < 3) {
      // 데이터가 부족하면 기본값 사용
      result[platform] = {
        platform,
        recommendedTimes: defaultTimes.times.map((time, i) => ({
          time,
          day: defaultTimes.days[i % defaultTimes.days.length],
          score: 80 - i * 5,
          reason: defaultTimes.reason,
        })),
        bestTime: {
          time: defaultTimes.times[0],
          day: defaultTimes.days[0],
        },
        insights: [
          `데이터가 부족하여 일반적인 추천을 표시합니다`,
          `${defaultTimes.reason}`,
          `더 많은 성과를 기록하면 맞춤 추천을 받을 수 있어요`,
        ],
      };
    } else {
      // 데이터 기반 분석
      const byDay: Record<string, { views: number; engagement: number; count: number }> = {};

      for (const stat of platformStats) {
        const date = new Date(stat.recorded_at);
        const dayName = DAY_NAMES[date.getDay()];

        if (!byDay[dayName]) {
          byDay[dayName] = { views: 0, engagement: 0, count: 0 };
        }

        byDay[dayName].views += stat.views;
        byDay[dayName].engagement += stat.engagement_rate || 0;
        byDay[dayName].count += 1;
      }

      // 평균 계산 및 정렬
      const dayPerformance = Object.entries(byDay)
        .map(([day, data]) => ({
          day,
          avgViews: data.views / data.count,
          avgEngagement: data.engagement / data.count,
          score: Math.round((data.views / data.count / 100) + (data.engagement / data.count) * 10),
        }))
        .sort((a, b) => b.score - a.score);

      const bestDays = dayPerformance.slice(0, 3).map((d) => d.day);
      const insights: string[] = [];

      if (dayPerformance.length > 0) {
        const best = dayPerformance[0];
        insights.push(`${best.day}요일에 가장 좋은 성과를 기록했어요`);
        insights.push(`평균 조회수: ${Math.round(best.avgViews).toLocaleString()}`);

        if (best.avgEngagement > 0) {
          insights.push(`평균 참여율: ${best.avgEngagement.toFixed(1)}%`);
        }
      }

      result[platform] = {
        platform,
        recommendedTimes: defaultTimes.times.map((time, i) => ({
          time,
          day: bestDays[i % bestDays.length] || defaultTimes.days[0],
          score: Math.max(50, 95 - i * 10),
          reason: `분석된 최적 시간`,
        })),
        bestTime: {
          time: defaultTimes.times[0],
          day: bestDays[0] || defaultTimes.days[0],
        },
        insights,
      };
    }
  }

  return result;
}

// 현재 시간 기준 다음 추천 시간 계산
export function getNextRecommendedTime(platform: StatsPlatform): {
  datetime: Date;
  formatted: string;
} {
  const now = new Date();
  const recommendations = DEFAULT_BEST_TIMES[platform];

  // 오늘 남은 추천 시간 확인
  for (const timeStr of recommendations.times) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate > now) {
      return {
        datetime: candidate,
        formatted: formatRecommendedTime(candidate),
      };
    }
  }

  // 오늘 추천 시간이 지났으면 내일 첫 시간
  const [hours, minutes] = recommendations.times[0].split(':').map(Number);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(hours, minutes, 0, 0);

  return {
    datetime: tomorrow,
    formatted: formatRecommendedTime(tomorrow),
  };
}

function formatRecommendedTime(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const isToday = new Date().toDateString() === date.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === date.toDateString();

  let prefix = `${dayName}요일`;
  if (isToday) prefix = '오늘';
  if (isTomorrow) prefix = '내일';

  return `${prefix} ${hours}:${minutes}`;
}
