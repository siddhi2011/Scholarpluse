import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, Heart, Star, ChevronUp, DollarSign, Clock, 
  ExternalLink, RotateCcw, CheckCheck, GraduationCap
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { getCategoryLabel, getEducationLabel } from '@/lib/educationLevels';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { toast } from 'sonner';

export default function SwipeMode({ scholarships, onSave }) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const current = scholarships[index];
  const next = scholarships[index + 1];

  const swipe = (direction, scholarship) => {
    setHistory(h => [...h, { index, scholarship, action: direction }]);
    setLastAction(direction);
    if (direction === 'right' || direction === 'super') {
      onSave?.(scholarship);
      if (direction === 'super') toast('⭐ Super Saved!', { description: scholarship.title });
      else toast.success('Saved! +10 XP 🎯');
    } else {
      toast(`Skipped ${scholarship.title}`, { duration: 1500 });
    }
    setIndex(i => i + 1);
    x.set(0);
  };

  const undo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setIndex(last.index);
    toast('Undone!');
  };

  const handleDragEnd = (_, info) => {
    if (!current) return;
    const { offset } = info;
    if (offset.x > 100) swipe('right', current);
    else if (offset.x < -100) swipe('left', current);
    else if (offset.y < -100) swipe('up', current);
    else x.set(0);
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
          <CheckCheck className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-2xl font-bold">You've seen them all!</h3>
        <p className="text-muted-foreground mt-2">Come back later for new scholarships</p>
        {history.length > 0 && (
          <Button onClick={undo} variant="outline" className="mt-4 gap-2">
            <RotateCcw className="h-4 w-4" /> Undo Last
          </Button>
        )}
      </div>
    );
  }

  const daysLeft = differenceInDays(new Date(current.deadline), new Date());

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Instructions */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><X className="h-3.5 w-3.5 text-destructive" /> Swipe Left to Skip</span>
        <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5 text-primary" /> Swipe Right to Save</span>
        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500" /> Swipe Up to Super Save</span>
      </div>

      {/* Card stack */}
      <div className="relative h-[480px] w-full max-w-md mx-auto">
        {/* Background card */}
        {next && (
          <div className="absolute inset-0 mx-4 my-2 bg-card rounded-2xl shadow-sm scale-95 opacity-60" />
        )}

        {/* Main draggable card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            className="absolute inset-0 swipe-card"
            style={{ x, rotate, opacity }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
          >
            {/* Like / Nope overlays */}
            <motion.div style={{ opacity: likeOpacity }}
              className="absolute top-8 left-8 z-10 border-4 border-emerald-400 text-emerald-400 font-black text-3xl px-3 py-1 rounded-xl rotate-[-15deg]">
              SAVE ❤️
            </motion.div>
            <motion.div style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-8 z-10 border-4 border-destructive text-destructive font-black text-3xl px-3 py-1 rounded-xl rotate-[15deg]">
              SKIP ✕
            </motion.div>

            <Card className="w-full h-full border-0 shadow-xl rounded-2xl overflow-hidden flex flex-col select-none">
              <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-accent" />
              <CardContent className="flex-1 p-6 flex flex-col">
                {/* Provider */}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{current.provider || 'Scholarship'}</p>
                
                {/* Title */}
                <h2 className="text-2xl font-bold mt-1 leading-tight line-clamp-3">{current.title}</h2>

                {/* Amount */}
                {current.amount && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">${current.amount.toLocaleString()}</span>
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed flex-1">
                  {current.description}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {current.category && <Badge variant="secondary">{getCategoryLabel(current.category)}</Badge>}
                  {current.essay_required && <Badge variant="outline" className="text-xs">Essay Required</Badge>}
                  {current.renewable && <Badge variant="outline" className="text-xs">Renewable</Badge>}
                  {current.education_level_min && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <GraduationCap className="h-3 w-3" />{getEducationLabel(current.education_level_min)}
                    </Badge>
                  )}
                </div>

                {/* Deadline */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    <Clock className="h-4 w-4" />{daysLeft} days left
                  </div>
                  <Link to={`/scholarships/${current.id}`} onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                      Details <ChevronUp className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4">
        <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-2 border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
          onClick={() => swipe('left', current)}>
          <X className="h-6 w-6 text-destructive" />
        </Button>
        {history.length > 0 && (
          <Button size="icon" variant="outline" className="h-10 w-10 rounded-full" onClick={undo}>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-2 border-yellow-400/40 hover:bg-yellow-50 hover:border-yellow-400"
          onClick={() => swipe('super', current)}>
          <Star className="h-6 w-6 text-yellow-500" />
        </Button>
        <Button size="icon" className="h-16 w-16 rounded-full shadow-lg shadow-primary/30"
          onClick={() => swipe('right', current)}>
          <Heart className="h-7 w-7" />
        </Button>
        <a href={current.apply_url} target="_blank" rel="noopener noreferrer">
          <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-2 border-accent/30 hover:bg-accent/10 hover:border-accent">
            <ExternalLink className="h-5 w-5 text-accent" />
          </Button>
        </a>
      </div>

      {/* Progress */}
      <p className="text-xs text-muted-foreground">{index + 1} of {scholarships.length}</p>
    </div>
  );
}