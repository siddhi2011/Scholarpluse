const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trash2, ExternalLink, Clock, BookmarkCheck, DollarSign,
  TrendingUp, Trophy, Calendar, CheckCircle2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getCategoryLabel } from '@/lib/educationLevels';

const STATUS_CONFIG = {
  saved:   { label: 'Saved',   emoji: '🔖', color: 'bg-secondary text-secondary-foreground', order: 1 },
  applied: { label: 'Applied', emoji: '📤', color: 'bg-primary/10 text-primary', order: 2 },
};

export default function Tracker() {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const { data: savedList = [], isLoading: loadingSaved } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => db.entities.SavedScholarship.list(),
  });
  const { data: scholarships = [], isLoading: loadingScholarships } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => db.entities.Scholarship.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.SavedScholarship.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['saved-scholarships'] });
      const previous = queryClient.getQueryData(['saved-scholarships']) || [];
      queryClient.setQueryData(['saved-scholarships'], previous.map(s =>
        s.id === id ? { ...s, ...data } : s
      ));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['saved-scholarships'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.SavedScholarship.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] }),
  });

  const scholarshipMap = {};
  scholarships.forEach(s => { scholarshipMap[s.id] = s; });

  const enriched = savedList
    .map(sv => ({ saved: sv, scholarship: scholarshipMap[sv.scholarship_id] }))
    .filter(e => e.scholarship);

  const filtered = activeTab === 'all' ? enriched : enriched.filter(e => e.saved.status === activeTab);

  const totalApplied = enriched.filter(e => e.saved.status === 'applied').length;
  const totalAppliedAmount = enriched
    .filter(e => e.saved.status === 'applied')
    .reduce((sum, e) => sum + (e.scholarship.amount || 0), 0);
  const totalSaved = enriched.filter(e => e.saved.status === 'saved').length;

  const isLoading = loadingSaved || loadingScholarships;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Tracker</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">Track every scholarship from save to acceptance</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Tracked', value: enriched.length, icon: BookmarkCheck, color: 'text-primary' },
          { label: 'Saved', value: totalSaved, icon: BookmarkCheck, color: 'text-violet-600' },
          { label: 'Applied', value: totalApplied, sub: totalApplied > 0 ? `$${totalAppliedAmount.toLocaleString()} potential` : null, icon: TrendingUp, color: 'text-blue-600' },
          { label: 'Apply Rate', value: enriched.length > 0 ? `${Math.round((totalApplied / enriched.length) * 100)}%` : '—', icon: Trophy, color: 'text-emerald-600' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-4 w-4 ${color}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
              <p className="text-2xl font-bold">{value}</p>
              {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="text-xs">All ({enriched.length})</TabsTrigger>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = enriched.filter(e => e.saved.status === key).length;
            return count > 0 ? (
              <TabsTrigger key={key} value={key} className="text-xs">
                {cfg.emoji} {cfg.label} ({count})
              </TabsTrigger>
            ) : null;
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-16 text-center">
                <BookmarkCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">No scholarships here yet</h3>
                <p className="text-muted-foreground mt-1 text-sm">Save scholarships to start tracking</p>
                <Link to="/scholarships"><Button className="mt-4">Browse Scholarships</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(({ saved: sv, scholarship }) => {
                const daysLeft = differenceInDays(new Date(scholarship.deadline), new Date());
                const cfg = STATUS_CONFIG[sv.status] || STATUS_CONFIG.saved;

                return (
                  <Card key={sv.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 md:p-5">
                      <div className="flex flex-col md:flex-row md:items-center gap-3">
                        {/* Status emoji */}
                        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-lg shrink-0">
                          {cfg.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link to={`/scholarships/${scholarship.id}`}>
                            <h3 className="font-semibold text-sm hover:text-primary transition-colors truncate">{scholarship.title}</h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {scholarship.amount && (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                                <DollarSign className="h-3 w-3" />{scholarship.amount.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className={`text-xs flex items-center gap-1 ${daysLeft < 0 ? 'text-muted-foreground' : daysLeft <= 7 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                              <Clock className="h-3 w-3" />
                              {daysLeft < 0 ? 'Expired' : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
                            </span>
                            {sv.applied_date && (
                              <>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />Applied {format(new Date(sv.applied_date), 'MMM d')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant={sv.status === 'applied' ? 'default' : 'outline'}
                            className={`h-8 text-xs gap-1.5 ${sv.status === 'applied' ? '' : ''}`}
                            onClick={() => updateMutation.mutate({
                              id: sv.id,
                              data: { status: sv.status === 'applied' ? 'saved' : 'applied', ...(sv.status !== 'applied' ? { applied_date: new Date().toISOString().split('T')[0] } : {}) }
                            })}
                          >
                            {sv.status === 'applied' ? <><CheckCircle2 className="h-3.5 w-3.5" /> Applied</> : <><CheckCircle2 className="h-3.5 w-3.5 opacity-40" /> Mark Applied</>}
                          </Button>

                          <a href={scholarship.apply_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteMutation.mutate(sv.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}