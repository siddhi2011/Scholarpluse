const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo, useEffect } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScholarshipCard from '@/components/scholarships/ScholarshipCard';
import ScholarshipFilters from '@/components/scholarships/ScholarshipFilters';
import SwipeMode from '@/components/scholarships/SwipeMode';
import { Skeleton } from '@/components/ui/skeleton';
import { EDUCATION_LEVELS } from '@/lib/educationLevels';
import { Loader2, Search, Layers, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { triggerMiniConfetti } from '@/components/ui/ConfettiEffect';

const INITIAL_FILTERS = { search: '', educationLevel: '', category: '', sort: 'deadline', citizenship: '', state: '', major: '', gender: '', essay_required: '', renewable: '', minAmount: 0 };

export default function ScholarshipFeed() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState('grid'); // grid | swipe
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const queryClient = useQueryClient();

  const { data: scholarships = [], isLoading } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => db.entities.Scholarship.list('-created_date', 500),
  });
  const { data: savedList = [] } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => db.entities.SavedScholarship.list(),
  });
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => db.auth.me(),
  });

  const saveMutation = useMutation({
    mutationFn: async (scholarship) => {
      const existing = savedList.find(s => s.scholarship_id === scholarship.id);
      if (existing) {
        await db.entities.SavedScholarship.delete(existing.id);
        return { action: 'unsaved', scholarshipId: scholarship.id, existingId: existing.id };
      } else {
        const result = await db.entities.SavedScholarship.create({ scholarship_id: scholarship.id, status: 'saved' });
        triggerMiniConfetti();
        return { action: 'saved', scholarshipId: scholarship.id, created: result };
      }
    },
    onMutate: async (scholarship) => {
      await queryClient.cancelQueries({ queryKey: ['saved-scholarships'] });
      const previous = queryClient.getQueryData(['saved-scholarships']) || [];
      const existing = previous.find(s => s.scholarship_id === scholarship.id);
      if (existing) {
        queryClient.setQueryData(['saved-scholarships'], previous.filter(s => s.id !== existing.id));
      } else {
        const optimistic = { id: `temp-${Date.now()}`, scholarship_id: scholarship.id, status: 'saved', created_date: new Date().toISOString() };
        queryClient.setQueryData(['saved-scholarships'], [...previous, optimistic]);
      }
      return { previous };
    },
    onSuccess: (result) => {
      if (result.action === 'saved') toast.success('Scholarship saved! +10 XP');
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['saved-scholarships'], context.previous);
      toast.error('Failed to update. Please try again.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-scholarships'] });
    },
  });

  const savedIds = new Set(savedList.map(s => s.scholarship_id));

  // Compute match scores based on user profile
  const computeMatchScore = (scholarship) => {
    if (!user) return null;
    let score = 50;
    if (user.education_level && scholarship.education_level_min) {
      const userOrder = EDUCATION_LEVELS.find(l => l.value === user.education_level)?.order || 0;
      const minOrder = EDUCATION_LEVELS.find(l => l.value === scholarship.education_level_min)?.order || 1;
      const maxOrder = EDUCATION_LEVELS.find(l => l.value === scholarship.education_level_max)?.order || 6;
      if (userOrder >= minOrder && userOrder <= maxOrder) score += 20;
      else score -= 30;
    }
    if (user.major && scholarship.major && scholarship.major.toLowerCase().includes(user.major.toLowerCase())) score += 15;
    if (user.gpa && scholarship.gpa_requirement && parseFloat(user.gpa) >= scholarship.gpa_requirement) score += 10;
    if (scholarship.citizenship === 'any') score += 5;
    return Math.max(10, Math.min(99, score));
  };

  const handleAISearch = async (query) => {
    setAiSearching(true);
    setAiResults(null);
    const scholarshipTitles = scholarships.slice(0, 100).map(s => `${s.id}|||${s.title}|||${s.category}|||${s.major || ''}|||${s.state || ''}|||${s.essay_required ? 'essay' : 'no-essay'}|||${s.gender || 'any'}`).join('\n');
    
    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are a scholarship search assistant. A student is searching for: "${query}"

Here are available scholarships (id|||title|||category|||major|||state|||essay|||gender):
${scholarshipTitles}

Return the IDs of the 20 most relevant scholarships matching the query. Consider all criteria mentioned.`,
      response_json_schema: {
        type: "object",
        properties: { matching_ids: { type: "array", items: { type: "string" } } }
      }
    });
    
    setAiResults(result.matching_ids || []);
    setAiSearching(false);
    toast.success(`AI found ${result.matching_ids?.length || 0} matches`);
  };

  const filtered = useMemo(() => {
    let result = scholarships.filter(s => {
      if (s.is_active === false) return false;
      if (new Date(s.deadline) <= new Date()) return false;
      if (!s.apply_url) return false;

      // AI results override
      if (aiResults) return aiResults.includes(s.id);

      if (filters.search) {
        const q = filters.search.toLowerCase();
        const haystack = `${s.title} ${s.provider} ${s.description} ${s.major} ${s.tags}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.category && s.category !== filters.category) return false;
      if (filters.citizenship && filters.citizenship !== 'all' && s.citizenship && s.citizenship !== filters.citizenship && s.citizenship !== 'any') return false;
      if (filters.state && s.state && s.state !== filters.state) return false;
      if (filters.major && s.major && !s.major.toLowerCase().includes(filters.major.toLowerCase())) return false;
      if (filters.gender && filters.gender !== 'all' && s.gender && s.gender !== 'any' && s.gender !== filters.gender) return false;
      if (filters.essay_required === 'no' && s.essay_required) return false;
      if (filters.renewable === 'yes' && !s.renewable) return false;
      if (filters.minAmount && s.amount && s.amount < filters.minAmount) return false;

      if (filters.educationLevel) {
        const userOrder = EDUCATION_LEVELS.find(l => l.value === filters.educationLevel)?.order || 0;
        const minOrder = EDUCATION_LEVELS.find(l => l.value === s.education_level_min)?.order || 1;
        const maxOrder = EDUCATION_LEVELS.find(l => l.value === s.education_level_max)?.order || 6;
        if (userOrder < minOrder || userOrder > maxOrder) return false;
      }

      return true;
    });

    if (!aiResults) {
      const withScores = result.map(s => ({ scholarship: s, score: computeMatchScore(s) }));
      switch (filters.sort) {
        case 'deadline': withScores.sort((a, b) => new Date(a.scholarship.deadline) - new Date(b.scholarship.deadline)); break;
        case 'amount_high': withScores.sort((a, b) => (b.scholarship.amount || 0) - (a.scholarship.amount || 0)); break;
        case 'amount_low': withScores.sort((a, b) => (a.scholarship.amount || 0) - (b.scholarship.amount || 0)); break;
        case 'newest': withScores.sort((a, b) => new Date(b.scholarship.created_date) - new Date(a.scholarship.created_date)); break;
        case 'match': withScores.sort((a, b) => (b.score || 0) - (a.score || 0)); break;
      }
      return withScores;
    }

    return result.map(s => ({ scholarship: s, score: computeMatchScore(s) }));
  }, [scholarships, filters, aiResults, user]);

  const handleClear = () => { setFilters(INITIAL_FILTERS); setAiResults(null); };

  return (
    <div className="max-w-7xl mx-auto space-y-5 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Scholarships</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{filtered.length} scholarships available · {savedList.length} saved</p>
        </div>
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="h-9">
            <TabsTrigger value="grid" className="gap-1.5 text-xs"><LayoutGrid className="h-3.5 w-3.5" />Browse</TabsTrigger>
            <TabsTrigger value="swipe" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" />Swipe</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === 'grid' && (
        <>
          <ScholarshipFilters
            filters={filters}
            onFilterChange={(f) => { setAiResults(null); setFilters(f); }}
            onClear={handleClear}
            totalResults={filtered.length}
            onAISearch={handleAISearch}
          />

          {aiSearching && (
            <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>AI is finding your best matches...</span>
            </div>
          )}

          {!aiSearching && (
            isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-20 w-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold">No scholarships found</h3>
                <p className="text-muted-foreground mt-1 text-sm">Try adjusting your filters or use AI search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(({ scholarship, score }) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    isSaved={savedIds.has(scholarship.id)}
                    onToggleSave={() => saveMutation.mutate(scholarship)}
                    matchScore={filters.sort === 'match' || aiResults ? score : undefined}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}

      {viewMode === 'swipe' && (
        <>
          <ScholarshipFilters
            filters={filters}
            onFilterChange={(f) => { setAiResults(null); setFilters(f); }}
            onClear={handleClear}
            totalResults={filtered.length}
            onAISearch={handleAISearch}
          />
          <SwipeMode
            scholarships={filtered.map(f => f.scholarship).filter(s => !savedIds.has(s.id))}
            savedIds={savedIds}
            onSave={(s) => saveMutation.mutate(s)}
          />
        </>
      )}
    </div>
  );
}