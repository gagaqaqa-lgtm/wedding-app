'use client';

export default function GalleryPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-stone-50 overflow-y-auto px-4 py-8 pb-8">
      <div className="text-center p-6 max-w-full w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 break-words whitespace-normal max-w-full">
          ギャラリー
        </h1>
        <p className="text-sm sm:text-base text-gray-600 break-words whitespace-normal max-w-full">
          ギャラリーページ - 正常表示確認
        </p>
      </div>
    </div>
  );
}
