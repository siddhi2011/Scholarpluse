import React from 'react';
import { BADGES } from '@/lib/gamification';
import { cn } from '@/lib/utils';

export default function BadgeGrid({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {BADGES.map(badge => {
        const earned = badge.condition(stats);
        return (
          <div key={badge.id} className={cn(
            "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
            earned ? "bg-primary/10 cursor-default" : "opacity-30 grayscale"
          )} title={badge.description}>
            <span className="text-2xl">{badge.emoji}</span>
            <span className="text-xs font-medium text-center leading-tight">{badge.label}</span>
          </div>
        );
      })}
    </div>
  );
}