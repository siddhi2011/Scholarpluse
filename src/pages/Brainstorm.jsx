const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useCallback, useRef } from 'react';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, Save, Plus, Trash2, Loader2, PenLine, Sparkles,
  BookOpen, ChevronLeft, AlertTriangle, CheckCircle2, Wand2,
  ListChecks, FileText, MessageSquare, RefreshCw, Target
} from 'lucide-react';
import { toast } from 'sonner';
import { debounce } from 'lodash';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

const IDEAL_WORD_COUNT = 650;

function WordStats({ content }) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  const sentences = content.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = sentences > 0 ? Math.round(words / sentences) : 0;
  const pct = Math.min(100, Math.round((words / IDEAL_WORD_COUNT) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{words} / {IDEAL_WORD_COUNT} words</span>
        <span className={words >= IDEAL_WORD_COUNT ? 'text-emerald-600 font-medium' : 'text-muted-foreground'}>{pct}%</span>
      </div>
      <Progress value={pct} className="h-1.5" />
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{chars} chars</span>
        <span>{sentences} sentences</span>
        <span>~{avgWordsPerSentence} words/sentence</span>
      </div>
    </div>
  );
}

export default function Brainstorm() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const promptParam = queryParams.get('prompt');
  const scholarshipTitleParam = queryParams.get('scholarship');

  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [title, setTitle] = useState(scholarshipTitleParam ? `${decodeURIComponent(scholarshipTitleParam)} Essay` : '');
  const [content, setContent] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState('feedback'); // feedback | generate | outline | brainstorm
  const [aiAllowed, setAiAllowed] = useState(true);
  const [essayPrompt, setEssayPrompt] = useState(promptParam ? decodeURIComponent(promptParam) : '');
  const queryClient = useQueryClient();

  const { data: drafts = [] } = useQuery({
    queryKey: ['essay-drafts'],
    queryFn: () => db.entities.EssayDraft.list('-updated_date'),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, data }) => id
      ? db.entities.EssayDraft.update(id, data)
      : db.entities.EssayDraft.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['essay-drafts'] });
      if (!selectedDraftId && result?.id) setSelectedDraftId(result.id);
      toast.success('Draft saved!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.EssayDraft.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['essay-drafts'] }); resetEditor(); },
  });

  useEffect(() => {
    if (selectedDraftId && selectedDraftId !== 'new') {
      const draft = drafts.find(d => d.id === selectedDraftId);
      if (draft) { setTitle(draft.title || ''); setContent(draft.content || ''); setFeedback(draft.ai_feedback || ''); }
    }
  }, [selectedDraftId, drafts]);

  const getAIFeedback = useCallback(
    debounce(async (text, allowed) => {
      if (!text || text.length < 80) return;
      setIsAnalyzing(true);
      const result = await db.integrations.Core.InvokeLLM({
        prompt: `You are a scholarship essay coach. Analyze this essay draft and provide structured feedback.

${allowed ? '' : '⚠️ NOTE: This is for BRAINSTORM ASSISTANCE ONLY. The student is NOT allowed to use AI-generated content — provide guidance only, not written content.'}

Essay:
${text}

Provide:
1. **Overall Score** - Rate clarity, impact, authenticity (e.g. 7/10)
2. **Strengths** - 2-3 specific things working well
3. **Improvements** - 2-3 specific, actionable suggestions
4. **Authenticity** - Does it feel genuine? Tips to improve
5. **Opening & Closing** - Evaluate the hook and conclusion
6. **Next Step** - One clear action item

Keep it concise and encouraging. Use markdown.`,
      });
      setFeedback(result);
      setIsAnalyzing(false);
    }, 2500),
    []
  );

  useEffect(() => {
    if (content && aiMode === 'feedback') getAIFeedback(content, aiAllowed);
    return () => getAIFeedback.cancel();
  }, [content, aiMode, aiAllowed]);

  const handleGenerate = async (type) => {
    if (!aiAllowed && type !== 'outline' && type !== 'brainstorm') {
      toast.error('AI writing not allowed for this essay');
      return;
    }
    setIsGenerating(true);
    const prompts = {
      outline: `Create a detailed essay outline for: "${title || 'scholarship essay'}". Include: hook ideas, 3-4 body paragraph topics with supporting points, and conclusion approach.`,
      brainstorm: `Generate 10 unique brainstorm ideas/angles for a scholarship essay about: "${title || 'my journey'}". Include personal story angles, unique perspectives, and what makes each compelling.`,
      draft: `Write a compelling scholarship essay draft for: "${title}". Use the student's notes: ${content}. Make it authentic, personal, and impactful. ~600 words.`,
      improve: `Improve this scholarship essay. Make it more compelling, fix grammar, enhance clarity, and strengthen the opening/closing. Keep the student's voice authentic.\n\nEssay:\n${content}`,
      grammar: `Fix all grammar, punctuation, and style issues in this essay. Keep the exact same content and voice:\n\n${content}`,
    };
    const result = await db.integrations.Core.InvokeLLM({ prompt: prompts[type] });
    if (type === 'outline' || type === 'brainstorm') {
      setFeedback(result);
    } else {
      setContent(result);
      toast.success('Content updated!');
    }
    setIsGenerating(false);
  };

  const resetEditor = () => { setSelectedDraftId(null); setTitle(''); setContent(''); setFeedback(''); };

  // Draft list view
  if (!selectedDraftId && !title && !content) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Essay Workshop</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">AI-powered writing coach for scholarship essays</p>
          </div>
          <Button onClick={() => setSelectedDraftId('new')} className="gap-1">
            <Plus className="h-4 w-4" /> New Essay
          </Button>
        </div>

        {drafts.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <PenLine className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Start your first essay</h3>
              <p className="text-muted-foreground mt-1 text-sm">Get real-time AI coaching as you write</p>
              <Button onClick={() => setSelectedDraftId('new')} className="mt-4 gap-1">
                <PenLine className="h-4 w-4" /> Start Writing
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map(draft => (
              <Card key={draft.id} className="border-0 shadow-sm card-hover cursor-pointer" onClick={() => setSelectedDraftId(draft.id)}>
                <CardContent className="p-5">
                  <h3 className="font-semibold truncate">{draft.title || 'Untitled Essay'}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{draft.content || 'No content yet'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {draft.content?.split(/\s+/).filter(Boolean).length || 0} words
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(draft.id); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-full animate-fade-in-up space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={resetEditor} className="gap-1 shrink-0">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Essay title or prompt..."
          className="flex-1 min-w-40 border-0 shadow-sm bg-card font-medium h-9"
        />
        {/* AI allowed toggle */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${aiAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
          onClick={() => setAiAllowed(!aiAllowed)}>
          {aiAllowed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {aiAllowed ? 'AI Allowed' : 'AI Restricted'}
        </div>
        <Button onClick={() => saveMutation.mutate({ id: selectedDraftId !== 'new' ? selectedDraftId : null, data: { title: title || 'Untitled Essay', content, ai_feedback: feedback } })}
          disabled={saveMutation.isPending} size="sm" className="gap-1">
          <Save className="h-3.5 w-3.5" />{saveMutation.isPending ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* AI restriction warning */}
      {!aiAllowed && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <strong>AI Writing Restricted:</strong> This essay requires your own words. AI will only provide brainstorming ideas, outlines, and structural guidance — not write content for you.
          </div>
        </div>
      )}

      {/* Main split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Writing area - 3 cols */}
        <Card className="lg:col-span-3 border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <PenLine className="h-4 w-4" /> Your Essay
              </CardTitle>
            </div>
            {essayPrompt && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Essay Prompt</p>
                <p className="text-sm italic text-foreground">"{essayPrompt}"</p>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col px-4 pb-4 gap-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={aiAllowed
                ? "Start writing your essay here... AI feedback will appear on the right as you type."
                : "Write your essay in your own words. Use the right panel for brainstorm ideas and structural guidance."}
              className="flex-1 min-h-[300px] resize-none border-0 focus-visible:ring-0 text-sm leading-relaxed"
            />
            <WordStats content={content} />
          </CardContent>
        </Card>

        {/* AI panel - 2 cols */}
        <Card className="lg:col-span-2 border-0 shadow-sm flex flex-col">
          <CardHeader className="pb-0 pt-4 px-4">
            <Tabs value={aiMode} onValueChange={setAiMode}>
              <TabsList className="w-full h-8 text-xs">
                <TabsTrigger value="feedback" className="flex-1 text-xs gap-1">
                  <MessageSquare className="h-3 w-3" />Feedback
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex-1 text-xs gap-1">
                  <Wand2 className="h-3 w-3" />Tools
                </TabsTrigger>
                <TabsTrigger value="checklist" className="flex-1 text-xs gap-1">
                  <ListChecks className="h-3 w-3" />Checklist
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-4 pb-4 pt-3">
            {aiMode === 'feedback' && (
              <>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" /> Analyzing your essay...
                  </div>
                )}
                {feedback ? (
                  <div className="prose prose-sm max-w-none text-sm">
                    <ReactMarkdown>{feedback}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground/50 py-8">
                    <Sparkles className="h-10 w-10 mb-3" />
                    <p className="text-sm">Write at least 3-4 sentences and AI feedback will appear here automatically</p>
                  </div>
                )}
              </>
            )}

            {aiMode === 'tools' && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">AI Writing Tools</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs"
                    onClick={() => handleGenerate('outline')} disabled={isGenerating}>
                    <FileText className="h-3.5 w-3.5 text-primary" /> Generate Outline
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs"
                    onClick={() => handleGenerate('brainstorm')} disabled={isGenerating}>
                    <Lightbulb className="h-3.5 w-3.5 text-yellow-500" /> Brainstorm Ideas
                  </Button>
                  {aiAllowed && (
                    <>
                      <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs"
                        onClick={() => handleGenerate('draft')} disabled={isGenerating || !title}>
                        <Wand2 className="h-3.5 w-3.5 text-purple-500" /> Generate Draft
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs"
                        onClick={() => handleGenerate('improve')} disabled={isGenerating || !content}>
                        <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Improve Writing
                      </Button>
                      <Button variant="outline" size="sm" className="justify-start gap-2 h-9 text-xs"
                        onClick={() => handleGenerate('grammar')} disabled={isGenerating || !content}>
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Fix Grammar
                      </Button>
                    </>
                  )}
                </div>
                {isGenerating && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Generating...
                  </div>
                )}
                {feedback && aiMode === 'tools' && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Result:</p>
                    <div className="prose prose-sm max-w-none text-xs">
                      <ReactMarkdown>{feedback}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiMode === 'checklist' && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Pre-submission checklist</p>
                {[
                  { label: 'Strong opening hook', done: content.length > 50 },
                  { label: 'Addresses the prompt', done: title && content.length > 100 },
                  { label: 'Personal story or example', done: content.includes('I ') || content.includes('my ') },
                  { label: 'Shows impact/growth', done: content.length > 300 },
                  { label: 'Word count near 650', done: content.split(/\s+/).filter(Boolean).length >= 500 },
                  { label: 'Strong conclusion', done: content.length > 400 },
                  { label: 'Proofread for grammar', done: false },
                  { label: 'Read aloud check', done: false },
                  { label: 'Authentic voice throughout', done: true },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-sm ${item.done ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-muted/50'}`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.done ? 'text-emerald-500' : 'text-muted-foreground/30'}`} />
                    <span className={item.done ? 'text-emerald-800 dark:text-emerald-200' : 'text-muted-foreground'}>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}