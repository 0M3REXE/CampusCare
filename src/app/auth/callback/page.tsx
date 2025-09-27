import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md px-4 sm:px-6 py-16">
        <div className="space-y-4">
          <Skeleton variant="text" width="40%" className="h-8 mb-2" />
          <SkeletonText lines={1} />
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div className="space-y-2">
            <Skeleton variant="button" width="100%" />
            <SkeletonText lines={2} />
          </div>
        </div>
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}
