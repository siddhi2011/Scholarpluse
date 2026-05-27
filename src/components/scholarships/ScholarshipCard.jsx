import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, DollarSign, ExternalLink, Bookmark, BookmarkCheck, 
  GraduationCap, PenLine, Star, Zap, Users, RefreshCw, ShieldCheck
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { getCategoryLabel, getEducationLabel, DIFFICULTY_LABELS } from '@/lib/educationLevels';

const CATEGORY_COLORS = {
  merit: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  need_based: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  stem: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  arts: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  diversity: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  athletic: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
  first_gen: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
  community_service: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
  business: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  medical: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
};

export default function ScholarshipCard({ scholarship, isSaved, onToggleSave, matchScore }) {
  const daysLeft = differenceInDays(new Date(scholarship.deadline), new Date());
  if (daysLeft < 0) return null;

  const isUrgent = daysLeft <= 7;
  const diffConfig = scholarship.difficulty ? DIFFICULTY_LABELS[scholarship.difficulty] : null;
  const catColor = CATEGORY_COLORS[scholarship.category] || 'bg-secondary text-secondary-foreground';

  return (
    <Card className="border-0 shadow-sm card-hover group overflow-hidden flex flex-col">
      {/* Urgency bar */}
      {isUrgent && <div className="h-1 bg-gradient-to-r from-destructive to-orange-400" />}
      
      <CardContent className="p-5 flex flex-col flex-1">
        {/* Top row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <Link to={`/scholarships/${scholarship.id}`}>
              <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                {scholarship.title}
              </h3>
            </Link>
            {scholarship.provider && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{scholarship.provider}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {scholarship.verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" title="Verified" />}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-primary"
              onClick={(e) => { e.preventDefault(); onToggleSave?.(scholarship); }}
            >
              {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary fill-primary" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Description */}
        {scholarship.description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{scholarship.description}</p>
        )}

        {/* Match score */}
        {matchScore != null && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all" style={{ width: `${matchScore}%` }} />
            </div>
            <span className="text-xs font-semibold text-primary">{matchScore}% match</span>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {scholarship.amount && (
            <Badge className="bg-emerald-50 text-emerald-700 border-0 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-semibold">
              <DollarSign className="h-3 w-3 mr-0.5" />{scholarship.amount.toLocaleString()}
            </Badge>
          )}
          {scholarship.category && (
            <Badge className={`border-0 text-xs ${catColor}`}>{getCategoryLabel(scholarship.category)}</Badge>
          )}
          {scholarship.essay_required && (
            <Badge variant="outline" className="text-xs gap-1 border-border/60">
              <PenLine className="h-2.5 w-2.5" />Essay
            </Badge>
          )}
          {scholarship.renewable && (
            <Badge variant="outline" className="text-xs gap-1 border-border/60">
              <RefreshCw className="h-2.5 w-2.5" />Renewable
            </Badge>
          )}
          {diffConfig && (
            <Badge className={`border-0 text-xs ${diffConfig.color}`}>{diffConfig.label}</Badge>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-border/50 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              <Clock className="h-3 w-3" />
              {daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
            </div>
            {scholarship.num_winners && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 ml-1">
                <Users className="h-3 w-3" />{scholarship.num_winners}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Link to={`/scholarships/${scholarship.id}`}>
              <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs">Details</Button>
            </Link>
            <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
              <Button size="sm" className="h-7 px-2.5 text-xs gap-1 shadow-sm">
                Apply <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}