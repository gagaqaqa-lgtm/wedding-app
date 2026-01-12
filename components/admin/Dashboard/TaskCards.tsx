'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, AlertTriangle, Grid3x3, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { TaskMetrics } from '@/lib/types/admin';

interface TaskCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  color: string;
  href: string;
  description?: string;
}

function TaskCard({ title, count, icon: Icon, color, href, description }: TaskCardProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl border-2 border-stone-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-sm text-stone-600 font-sans font-medium">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-sans ${count > 0 ? 'text-red-600' : 'text-stone-400'}`}>
              {count}
            </span>
            <span className="text-sm text-stone-400 font-sans">件</span>
          </div>
          {description && (
            <p className="text-xs text-stone-500 font-sans mt-2">{description}</p>
          )}
        </div>

        {count > 0 && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <span className="text-xs text-blue-600 font-sans font-medium flex items-center gap-1">
              確認する
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

interface TaskCardsProps {
  metrics: TaskMetrics;
}

export function TaskCards({ metrics }: TaskCardsProps) {
  const cards: Omit<TaskCardProps, 'count'>[] = [
    {
      title: '未確定ゲスト',
      icon: Users,
      color: 'bg-orange-500',
      href: '/admin/guests?filter=pending',
      description: 'ゲスト情報が未確定',
    },
    {
      title: '未回答アンケート',
      icon: MessageSquare,
      color: 'bg-blue-500',
      href: '/admin/guests?filter=unanswered',
      description: 'アンケート未回答',
    },
    {
      title: 'アレルギー未確認',
      icon: AlertTriangle,
      color: 'bg-red-500',
      href: '/admin/allergies?filter=unconfirmed',
      description: 'アレルギー情報未確認',
    },
    {
      title: '配席確定待ち',
      icon: Grid3x3,
      color: 'bg-purple-500',
      href: '/admin/seating',
      description: '配席の最終確定が必要',
    },
  ];

  const counts = [
    metrics.pendingGuests,
    metrics.unansweredSurveys,
    metrics.unconfirmedAllergies,
    metrics.pendingSeating,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TaskCard {...card} count={counts[index]} />
        </motion.div>
      ))}
    </div>
  );
}
