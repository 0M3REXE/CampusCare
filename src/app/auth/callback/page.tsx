import { Suspense } from 'react';
import AuthCallbackClient from './AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md px-4 sm:px-6 py-16"><h1 className="text-2xl font-semibold">Signing you in…</h1></div>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
