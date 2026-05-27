const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, ExternalLink, Clock, DollarSign, GraduationCap, 
  Building2, BookmarkCheck, Bookmark, Calendar, CheckCircle2,
  AlertTriangle, RefreshCw, Users, Timer, ShieldCheck, PenLine
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getCategoryLabel, getEducationLabel, DIFFICULTY_LABELS, CITIZENSHIP_OPTIONS } from '@/lib/educationLevels';
import { triggerMiniConfetti } from '@/components/ui/ConfettiEffect';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ScholarshipDetail() {
  const params = useParams();
  const id = params.id || window.location.pathname.split('/').pop();
  const queryClient = useQueryClient();

  const { data: scholarship, isLoading } = useQuery({
    queryKey: ['scholarship', id],
    queryFn: async () => {
      const list = await db.entities.Scholarship.list('-created_date', 500);
      return list.find(s => s.id === id);
    },
    enabled: !!id,
  });

  const { data: savedList = [] } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => db.entities.SavedScholarship.list(),
  });

  const isSaved = savedList.some(s => s.scholarship_id === id);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = savedList.find(s => s.scholarship_id === id);
      if (existing) {
        await db.entities.SavedScholarship.delete(existing.id);
        return 'unsaved';
      } else {
        await db.entities.SavedScholarship.create({ scholarship_id: id, status: 'saved' });
        triggerMiniConfetti();
        return 'saved';
      }
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
      if (action === 'saved') toast.success('Saved! +10 XP 🎯');
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h2 className="text-xl font-semibold">Scholarship not found</h2>
        <Link to="/scholarships"><Button className="mt-4">Browse Scholarships</Button></Link>
      </div>
    );
  }

  const deadlineDate = scholarship.deadline && scholarship.deadline !== 'varies' ? new Date(scholarship.deadline) : null;
  const daysLeft = deadlineDate ? differenceInDays(deadlineDate, new Date()) : null;
  const diffConfig = scholarship.difficulty ? DIFFICULTY_LABELS[scholarship.difficulty] : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-4">
      <Link to="/scholarships">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to scholarships
        </Button>
      </Link>

      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-accent" />
        
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {scholarship.verified && (
                  <Badge className="bg-primary/10 text-primary border-0 gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {scholarship.renewable && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <RefreshCw className="h-3 w-3" /> Renewable
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{scholarship.title}</h1>
              {scholarship.provider && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{scholarship.provider}</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="icon" className="shrink-0 h-10 w-10" onClick={() => saveMutation.mutate()}>
              {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary fill-primary" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>

          {/* AI warning */}
          {scholarship.essay_required && !scholarship.ai_allowed && (
            <div className="mt-4 flex items-start gap-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>AI Not Allowed:</strong> This scholarship requires original writing without AI assistance.
              </p>
            </div>
          )}
          {scholarship.essay_required && scholarship.ai_allowed && (
            <div className="mt-4 flex items-start gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-800 dark:text-emerald-200">
                <strong>AI Assistance Allowed:</strong> You can use AI tools to help write and refine your essay.
              </p>
            </div>
          )}

          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {scholarship.amount && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-center">
                <DollarSign className="h-4 w-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">${scholarship.amount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Award</p>
              </div>
            )}
            <div className={`p-4 rounded-xl text-center ${daysLeft !== null && daysLeft <= 7 ? 'bg-destructive/5' : 'bg-muted/60'}`}>
               <Clock className={`h-4 w-4 mx-auto mb-1 ${daysLeft !== null && daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`} />
               <p className="text-xl font-bold">{daysLeft === null ? '—' : daysLeft > 0 ? `${daysLeft}d` : 'Done'}</p>
               <p className="text-xs text-muted-foreground">{deadlineDate ? format(deadlineDate, 'MMM d') : 'Varies'}</p>
             </div>
            {scholarship.num_winners && (
              <div className="p-4 rounded-xl bg-muted/60 text-center">
                <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{scholarship.num_winners}</p>
                <p className="text-xs text-muted-foreground">Winners</p>
              </div>
            )}
            {scholarship.avg_time_hours && (
              <div className="p-4 rounded-xl bg-muted/60 text-center">
                <Timer className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{scholarship.avg_time_hours}h</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            )}
            {scholarship.gpa_requirement && (
              <div className="p-4 rounded-xl bg-muted/60 text-center">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-xl font-bold">{scholarship.gpa_requirement}+</p>
                <p className="text-xs text-muted-foreground">Min GPA</p>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-5">
            {scholarship.category && <Badge variant="secondary">{getCategoryLabel(scholarship.category)}</Badge>}
            {scholarship.education_level_min && (
              <Badge variant="outline" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {getEducationLabel(scholarship.education_level_min, true)}
                {scholarship.education_level_max && scholarship.education_level_max !== scholarship.education_level_min && (
                  <> – {getEducationLabel(scholarship.education_level_max, true)}</>
                )}
              </Badge>
            )}
            {scholarship.essay_required && (
              <Badge variant="outline" className="gap-1"><PenLine className="h-3 w-3" />Essay Required</Badge>
            )}
            {diffConfig && (
              <Badge className={`border-0 ${diffConfig.color}`}>{diffConfig.label}</Badge>
            )}
            {scholarship.citizenship && scholarship.citizenship !== 'any' && (
              <Badge variant="outline">{CITIZENSHIP_OPTIONS.find(c => c.value === scholarship.citizenship)?.label}</Badge>
            )}
            {scholarship.state && <Badge variant="outline">{scholarship.state}</Badge>}
            {scholarship.major && <Badge variant="outline">{scholarship.major}</Badge>}
            {scholarship.gender && scholarship.gender !== 'any' && (
              <Badge variant="outline">{scholarship.gender === 'female' ? 'Women Only' : scholarship.gender}</Badge>
            )}
          </div>

          {/* Description */}
          {scholarship.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">About This Scholarship</h3>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{scholarship.description}</p>
            </div>
          )}

          {/* Requirements */}
          {scholarship.requirements && (
            <div className="mt-5">
              <h3 className="font-semibold mb-2">Eligibility Requirements</h3>
              <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{scholarship.requirements}</p>
            </div>
          )}

          {/* Essay Prompt */}
          {scholarship.essay_required && scholarship.essay_prompt && (
            <div className="mt-5 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" /> Essay Prompt
              </h3>
              <p className="text-sm leading-relaxed text-foreground italic">"{scholarship.essay_prompt}"</p>
              <Link to={`/brainstorm?prompt=${encodeURIComponent(scholarship.essay_prompt)}&scholarship=${encodeURIComponent(scholarship.title)}`} className="mt-3 inline-block">
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <PenLine className="h-3 w-3" /> Start Writing in Essay Workshop
                </Button>
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button size="lg" className="w-full gap-2 h-12 text-base shadow-lg shadow-primary/25">
                Apply Now <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <Button variant="outline" size="lg" className="gap-2 h-12" onClick={() => saveMutation.mutate()}>
              {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              {isSaved ? 'Saved' : 'Save for Later'}
            </Button>
            {scholarship.essay_required && (
              <Link to={`/brainstorm?prompt=${encodeURIComponent(scholarship.essay_prompt || '')}&scholarship=${encodeURIComponent(scholarship.title || '')}`}>
                <Button variant="outline" size="lg" className="gap-2 h-12 w-full sm:w-auto">
                  <PenLine className="h-4 w-4" /> Write Essay
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}