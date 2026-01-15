'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 会場ログインページにリダイレクト
    router.replace('/dashboard/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-gray-600 font-sans">リダイレクト中...</p>
      </div>
    </div>
  );
}
