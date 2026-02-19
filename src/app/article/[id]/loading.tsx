import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ArticleLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
