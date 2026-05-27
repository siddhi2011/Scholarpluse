const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from 'react';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, Download, RefreshCw, Eye, Edit3, FileText, Loader2 
} from 'lucide-react';
import ResumePreview from '@/components/resume/ResumePreview';
import { toast } from 'sonner';

export default function Resume() {
  const [resumeData, setResumeData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableResume, setEditableResume] = useState(null);
  const [activeTab, setActiveTab] = useState('generate');

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => db.auth.me(),
  });

  const generateResume = async () => {
    setIsGenerating(true);
    const profileInfo = `
Name: ${user?.full_name || 'Student'}
Email: ${user?.email || ''}
Education Level: ${user?.education_level || 'Not specified'}
School: ${user?.school || 'Not specified'}
GPA: ${user?.gpa || 'Not specified'}
Major: ${user?.major || 'Not specified'}
Graduation: ${user?.graduation_year || 'Not specified'}
Achievements: ${user?.achievements || 'None listed'}
Extracurriculars: ${user?.extracurriculars || 'None listed'}
Community Service: ${user?.community_service || 'None listed'}
Skills: ${user?.skills || 'None listed'}
Career Goals: ${user?.career_goals || 'Not specified'}
    `.trim();

    const result = await db.integrations.Core.InvokeLLM({
      prompt: `You are a professional resume writer specializing in scholarship applications. Using the following student profile, create a polished, professional scholarship resume. 

IMPORTANT RULES:
- Do NOT just copy the input text. REWRITE and IMPROVE everything.
- Make achievements sound impactful using action verbs and quantifiable results.
- Expand short/vague responses into professional descriptions.
- Fix all grammar and spelling.
- Organize content into clear, professional sections.
- Make it sound authentic but impressive.
- If info is missing or says "Not specified", omit that section.

Student Profile:
${profileInfo}

Generate a structured resume with improved, professional content.`,
      response_json_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          objective: { type: "string", description: "Professional objective statement, 2-3 sentences" },
          education: {
            type: "object",
            properties: {
              school: { type: "string" },
              level: { type: "string" },
              gpa: { type: "string" },
              major: { type: "string" },
              graduation: { type: "string" }
            }
          },
          achievements: {
            type: "array",
            items: { type: "string" },
            description: "List of professionally rewritten achievements"
          },
          activities: {
            type: "array",
            items: { type: "string" },
            description: "List of professionally described activities"
          },
          community_service: {
            type: "array",
            items: { type: "string" },
            description: "Community service entries"
          },
          skills: {
            type: "array",
            items: { type: "string" }
          },
          career_goals: { type: "string" }
        }
      }
    });
    
    setResumeData(result);
    setEditableResume(result);
    setActiveTab('preview');
    setIsGenerating(false);
    toast.success('Resume generated!');
  };

  const hasProfile = user?.achievements || user?.extracurriculars || user?.school;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Resume Builder</h1>
        <p className="text-muted-foreground mt-1">Generate a scholarship-quality resume from your profile</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="generate" className="gap-1">
            <Sparkles className="h-4 w-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-1" disabled={!resumeData}>
            <Eye className="h-4 w-4" /> Preview
          </TabsTrigger>
          <TabsTrigger value="edit" className="gap-1" disabled={!resumeData}>
            <Edit3 className="h-4 w-4" /> Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4 mt-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Generate Your Scholarship Resume</h2>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {hasProfile
                  ? "We'll use your profile to create a professionally written resume optimized for scholarship applications."
                  : "Fill out your profile first to generate a resume. The AI will rewrite and improve your information professionally."
                }
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={generateResume}
                  disabled={isGenerating || !hasProfile}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> Generate Resume</>
                  )}
                </Button>
                {!hasProfile && (
                  <Button variant="outline" size="lg" asChild>
                    <a href="/profile">Complete Profile First</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {resumeData && (
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={generateResume} disabled={isGenerating} className="gap-1">
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                </Button>
                <Button onClick={() => setActiveTab('edit')} variant="outline" className="gap-1">
                  <Edit3 className="h-4 w-4" /> Edit
                </Button>
              </div>
              <ResumePreview data={editableResume || resumeData} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {editableResume && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Objective</Label>
                  <Textarea
                    value={editableResume.objective || ''}
                    onChange={(e) => setEditableResume({ ...editableResume, objective: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Achievements (one per line)</Label>
                  <Textarea
                    value={(editableResume.achievements || []).join('\n')}
                    onChange={(e) => setEditableResume({ ...editableResume, achievements: e.target.value.split('\n').filter(Boolean) })}
                    className="mt-1.5"
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Activities (one per line)</Label>
                  <Textarea
                    value={(editableResume.activities || []).join('\n')}
                    onChange={(e) => setEditableResume({ ...editableResume, activities: e.target.value.split('\n').filter(Boolean) })}
                    className="mt-1.5"
                    rows={5}
                  />
                </div>
                <div>
                  <Label>Community Service (one per line)</Label>
                  <Textarea
                    value={(editableResume.community_service || []).join('\n')}
                    onChange={(e) => setEditableResume({ ...editableResume, community_service: e.target.value.split('\n').filter(Boolean) })}
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Skills (comma separated)</Label>
                  <Input
                    value={(editableResume.skills || []).join(', ')}
                    onChange={(e) => setEditableResume({ ...editableResume, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Career Goals</Label>
                  <Textarea
                    value={editableResume.career_goals || ''}
                    onChange={(e) => setEditableResume({ ...editableResume, career_goals: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <Button onClick={() => { setActiveTab('preview'); toast.success('Changes saved!'); }} className="w-full gap-1">
                  <Eye className="h-4 w-4" /> Preview Updated Resume
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}