"use client";

import React from "react";

export default function ItemsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-700">アイテム管理</h2>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <p className="text-gray-500">
              アイテム管理機能は今後実装予定です
            </p>
            <p className="text-sm text-gray-400 mt-2">
              料理・引出物などのマスタ管理を行います
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
