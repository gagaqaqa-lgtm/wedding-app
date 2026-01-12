'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GalleryRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // クエリパラメータを保持してリダイレクト
    const tableId = searchParams.get('table');
    const redirectUrl = tableId ? `/guest/gallery?table=${tableId}` : '/guest/gallery';
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <p className="text-stone-600 font-serif">リダイレクト中...</p>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-600 font-serif">読み込み中...</p>
        </div>
      </div>
    }>
      <GalleryRedirectContent />
    </Suspense>
  );
}
