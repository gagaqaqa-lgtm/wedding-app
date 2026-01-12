'use client';

import Link from 'next/link';

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12 animate-[fadeIn_1s_ease-out]">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center mb-12">
          <h1 className="font-shippori text-4xl text-stone-800 mb-3 font-bold">Menu</h1>
          <div className="w-20 h-px bg-[#AB9A83] mx-auto"></div>
          <p className="font-sans text-stone-600 text-sm mt-3 tracking-widest">メニュー</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* WEBアルバムカード */}
          <Link
            href="/survey"
            className="group relative bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-stone-200 overflow-hidden"
          >
            {/* 背景パターン */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center group-hover:bg-[#AB9A83] transition-colors duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="font-shippori text-2xl text-stone-800 mb-2 text-center font-bold">WEBアルバム</h2>
              <p className="font-sans text-stone-600 text-sm text-center">を見る</p>
            </div>
          </Link>

          {/* LINE受け取りカード */}
          <a
            href="#"
            className="group relative bg-gradient-to-br from-[#06C755] to-[#05b048] rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            {/* 背景パターン */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
            
            <div className="relative z-10">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current text-white">
                    <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.542 6.916-4.076 9.448-6.972 1.725-1.91 2.536-3.878 2.536-5.771zm-15.891 3.232c-.145 0-.263-.117-.263-.262v-3.437h-1.393c-.145 0-.263-.117-.263-.262v-.523c0-.145.118-.262.263-.262h3.836c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262h-1.393v3.437c0 .145-.118.262-.263.262h-.787zm3.113 0c-.145 0-.262-.117-.262-.262v-4.485c0-.145.117-.262.262-.262h.787c.145 0 .263.117.263.262v4.485c0 .145-.118.262-.263.262h-.787zm6.136 0h-.787c-.145 0-.263-.117-.263-.262v-2.348l-1.611-2.12c-.033-.044-.047-.071-.047-.101 0-.082.067-.148.148-.148h.831c.123 0 .227.067.284.168l1.183 1.597 1.183-1.597c.057-.101.161-.168.284-.168h.831c.081 0 .148.066.148.148 0 .03-.014.057-.047.101l-1.611 2.12v2.348c0 .145-.118.262-.263.262zm3.424 0h-3.08c-.145 0-.263-.117-.263-.262v-4.485c0-.145.118-.262.263-.262h.787c.145 0 .263.117.263.262v3.7h1.767c.145 0 .263.117.263.262v.523c0 .145-.118.262-.263.262z"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="font-sans text-white/90 text-sm text-center leading-tight">手軽に保存・シェアするなら</p>
                <h2 className="font-shippori text-xl font-bold text-white text-center leading-tight">LINEでアルバムを受け取る</h2>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}