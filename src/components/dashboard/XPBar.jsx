import React from 'react';
import { Progress } from '@/components/ui/progress';
import { calculateLevel } from '@/lib/gamification';
import { Zap } from 'lucide-react';

export default function XPBar({ xp }) {
  const { level, title, next } = calculateLevel(xp);
  const prevXP = level === 1 ? 0 : [0, 100, 300, 600, 1000, 1500, 2500][level - 1];
  const progress = next ? Math.round(((xp - prevXP) / (next - prevXP)) * 100) : 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Lvl {level} · {title}</p>
          <p className="text-xs font-semibold">{xp} XP</p>
        </div>
      </div>
      <div className="flex-1">
        <Progress value={progress} className="h-2" />
        {next && <p className="text-xs text-muted-foreground mt-0.5 text-right">{next - xp} XP to next level</p>}
      </div>
    </div>
  );
}