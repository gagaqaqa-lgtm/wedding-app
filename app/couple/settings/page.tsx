'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export default function CoupleSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: パスワード変更処理
    alert('パスワードを変更しました');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">設定</h1>

        {/* パスワード変更 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">パスワード変更</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                現在のパスワード
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={cn(
                  "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900"
                )}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                新しいパスワード
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={cn(
                  "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900"
                )}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                新しいパスワード（確認）
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "w-full h-12 px-4 text-base rounded-xl border-2 transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500",
                  "border-gray-300 focus:border-emerald-500",
                  "text-gray-900"
                )}
              />
            </div>

            <button
              type="submit"
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-white text-base",
                "bg-gradient-to-r from-emerald-500 to-teal-600",
                "hover:from-emerald-600 hover:to-teal-700",
                "active:scale-95 transition-all duration-200",
                "shadow-lg hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              )}
            >
              パスワードを変更する
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}