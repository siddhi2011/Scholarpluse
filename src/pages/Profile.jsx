const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, User, GraduationCap, Trophy, DollarSign, Heart, Briefcase, Send, Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/lib/AuthContext';
import { EDUCATION_LEVELS, MAJORS, US_STATES } from '@/lib/educationLevels';
import { toast } from 'sonner';

const CITIZENSHIP_WITH_VISA = [
  { value: 'us_citizen', label: 'U.S. Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident (Green Card)' },
  { value: 'visa_holder', label: 'Visa Holder (F-1, H-1B, etc.)' },
  { value: 'daca', label: 'DACA Recipient' },
  { value: 'international', label: 'International Student' },
  { value: 'any', label: 'Prefer not to say' },
];

const HOUSEHOLD_INCOME_OPTIONS = [
  { value: 'under_25k', label: 'Under $25,000' },
  { value: '25k_50k', label: '$25,000 – $50,000' },
  { value: '50k_75k', label: '$50,000 – $75,000' },
  { value: '75k_100k', label: '$75,000 – $100,000' },
  { value: '100k_150k', label: '$100,000 – $150,000' },
  { value: 'over_150k', label: 'Over $150,000' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const HOUSEHOLD_SIZE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8+'];

const ETHNICITY_OPTIONS = [
  'African American / Black',
  'Asian / Asian American',
  'Hispanic / Latino',
  'Native American / Alaska Native',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian',
  'Middle Eastern / North African',
  'Multiracial',
  'Other',
  'Prefer not to say',
];

const GENDER_OPTIONS = [
  { value: 'any', label: 'Prefer not to say' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
];

const MILITARY_OPTIONS = [
  { value: 'none', label: 'No affiliation' },
  { value: 'active_duty', label: 'Active duty service member' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'dependent', label: 'Dependent / family member of veteran' },
  { value: 'rotc', label: 'ROTC member' },
];

const DISABILITY_OPTIONS = [
  { value: 'none', label: 'No disability' },
  { value: 'physical', label: 'Physical disability' },
  { value: 'visual', label: 'Visual impairment' },
  { value: 'hearing', label: 'Hearing impairment' },
  { value: 'learning', label: 'Learning disability' },
  { value: 'mental_health', label: 'Mental health condition' },
  { value: 'chronic_illness', label: 'Chronic illness' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const CAREER_FIELDS = [
  'Technology / Computer Science', 'Engineering', 'Medicine / Healthcare', 'Law',
  'Business / Finance', 'Education / Teaching', 'Arts / Design', 'Journalism / Media',
  'Public Service / Government', 'Social Work / Nonprofit', 'Science / Research',
  'Architecture', 'Environmental Science', 'Agriculture', 'Military / Defense', 'Other',
];

const GPA_OPTIONS = ['4.0', '3.9', '3.8', '3.7', '3.6', '3.5', '3.4', '3.3', '3.2', '3.1', '3.0',
  '2.9', '2.8', '2.7', '2.6', '2.5', '2.4', '2.3', '2.2', '2.1', '2.0', 'Below 2.0'];

const GRAD_YEARS = Array.from({ length: 12 }, (_, i) => String(2024 + i));

const FIRST_GEN_OPTIONS = [
  { value: 'true', label: 'Yes — first in my family to attend college' },
  { value: 'false', label: 'No — family member(s) attended college' },
];

function SectionCard({ icon: Icon, title, children }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function FieldSelect({ label, value, onValueChange, options, placeholder = 'Select...' }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={value || ''} onValueChange={onValueChange}>
        <SelectTrigger className="mt-1.5"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map(opt =>
            typeof opt === 'string'
              ? <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              : <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

const EMPTY_PROFILE = {
  education_level: '', school: '', gpa: '', major: '', graduation_year: '',
  state: '', citizenship: '', gender: '', ethnicity: '', household_income: '',
  household_size: '', first_gen: '', military_affiliation: '', disability: '',
  achievements: '', extracurriculars: '', leadership_roles: '', community_service: '',
  work_experience: '', skills: '', languages: '', sat_score: '', act_score: '',
  career_goals: '', intended_career_field: '',
};

export default function Profile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => db.auth.me(),
  });

  const { logout } = useAuth();
  const [deletePending, setDeletePending] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        ...Object.fromEntries(Object.keys(EMPTY_PROFILE).map(k => [k, user[k] ?? ''])),
        first_gen: user.first_gen === true ? 'true' : user.first_gen === false ? 'false' : '',
      }));
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: (data) => db.auth.updateMe({
      ...data,
      first_gen: data.first_gen === 'true' ? true : data.first_gen === 'false' ? false : undefined,
    }),
    onSuccess: () => toast.success('Profile saved! Scholarship matches updated.'),
  });

  const set = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  // Profile completeness
  const filledFields = Object.values(profile).filter(v => v !== '' && v !== undefined).length;
  const totalFields = Object.keys(EMPTY_PROFILE).length;
  const pct = Math.round((filledFields / totalFields) * 100);

  if (isLoading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const handleFeedback = () => {
    const subject = encodeURIComponent('ScholarshipHub Feedback');
    const body = encodeURIComponent('Hi! I wanted to share some feedback:\n\n');
    window.location.href = `mailto:support@scholarshiphub.com?subject=${subject}&body=${body}`;
    toast.success('Opening your email client...');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Complete your profile to get the best scholarship matches</p>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={pct >= 80 ? 'default' : 'secondary'} className="text-sm px-3 py-1.5">
            {pct}% complete
          </Badge>
          <Button onClick={handleFeedback} variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Send className="h-3.5 w-3.5" /> Feedback
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <SectionCard icon={User} title="Basic Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Full Name</Label>
            <Input value={user?.full_name || ''} disabled className="mt-1.5 bg-muted" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="mt-1.5 bg-muted" />
          </div>
          <FieldSelect label="Gender" value={profile.gender} onValueChange={v => set('gender', v)} options={GENDER_OPTIONS} />
          <FieldSelect label="Ethnicity / Race" value={profile.ethnicity} onValueChange={v => set('ethnicity', v)} options={ETHNICITY_OPTIONS} />
          <FieldSelect label="State of Residence" value={profile.state} onValueChange={v => set('state', v)} options={US_STATES.map(s => ({ value: s, label: s }))} />
          <FieldSelect label="Citizenship Status" value={profile.citizenship} onValueChange={v => set('citizenship', v)} options={CITIZENSHIP_WITH_VISA} />
          <FieldSelect label="First-Generation College Student?" value={profile.first_gen} onValueChange={v => set('first_gen', v)} options={FIRST_GEN_OPTIONS} />
          <FieldSelect label="Military Affiliation" value={profile.military_affiliation} onValueChange={v => set('military_affiliation', v)} options={MILITARY_OPTIONS} />
          <FieldSelect label="Disability Status (for disability scholarships)" value={profile.disability} onValueChange={v => set('disability', v)} options={DISABILITY_OPTIONS} />
          <div>
            <Label>Languages Spoken</Label>
            <Input value={profile.languages} onChange={e => set('languages', e.target.value)} className="mt-1.5" placeholder="e.g. English, Spanish, Mandarin" />
          </div>
        </div>
      </SectionCard>

      {/* Financial Info */}
      <SectionCard icon={DollarSign} title="Financial Information">
        <p className="text-xs text-muted-foreground -mt-1">Used to match you with need-based scholarships. Never shared publicly.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSelect label="Annual Household Income" value={profile.household_income} onValueChange={v => set('household_income', v)} options={HOUSEHOLD_INCOME_OPTIONS} />
          <FieldSelect label="Household Size (# of people)" value={profile.household_size} onValueChange={v => set('household_size', v)} options={HOUSEHOLD_SIZE_OPTIONS.map(s => ({ value: s, label: s }))} />
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard icon={GraduationCap} title="Education">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldSelect label="Education Level" value={profile.education_level} onValueChange={v => set('education_level', v)} options={EDUCATION_LEVELS.map(l => ({ value: l.value, label: l.longLabel }))} />
          <div>
            <Label>School / University</Label>
            <Input value={profile.school} onChange={e => set('school', e.target.value)} className="mt-1.5" placeholder="e.g. Lincoln High School" />
          </div>
          <FieldSelect label="GPA" value={profile.gpa} onValueChange={v => set('gpa', v)} options={GPA_OPTIONS.map(g => ({ value: g, label: g }))} />
          <FieldSelect label="Major / Field of Study" value={profile.major} onValueChange={v => set('major', v)} options={MAJORS.map(m => ({ value: m, label: m }))} />
          <FieldSelect label="Expected Graduation Year" value={profile.graduation_year} onValueChange={v => set('graduation_year', v)} options={GRAD_YEARS.map(y => ({ value: y, label: y }))} />
          <FieldSelect label="Intended Career Field" value={profile.intended_career_field} onValueChange={v => set('intended_career_field', v)} options={CAREER_FIELDS.map(f => ({ value: f, label: f }))} />
          <div>
            <Label>SAT Score (optional)</Label>
            <Input value={profile.sat_score} onChange={e => set('sat_score', e.target.value)} className="mt-1.5" placeholder="e.g. 1350" />
          </div>
          <div>
            <Label>ACT Score (optional)</Label>
            <Input value={profile.act_score} onChange={e => set('act_score', e.target.value)} className="mt-1.5" placeholder="e.g. 28" />
          </div>
        </div>
      </SectionCard>

      {/* Achievements */}
      <SectionCard icon={Trophy} title="Achievements & Activities">
        <div>
          <Label>Academic Achievements & Awards</Label>
          <Textarea value={profile.achievements} onChange={e => set('achievements', e.target.value)} className="mt-1.5" placeholder="e.g. Honor Roll, Dean's List, National Merit Semifinalist, Science Fair Winner..." rows={3} />
        </div>
        <div>
          <Label>Extracurricular Activities</Label>
          <Textarea value={profile.extracurriculars} onChange={e => set('extracurriculars', e.target.value)} className="mt-1.5" placeholder="Clubs, sports, bands, debate team — include years of involvement..." rows={3} />
        </div>
        <div>
          <Label>Leadership Roles</Label>
          <Textarea value={profile.leadership_roles} onChange={e => set('leadership_roles', e.target.value)} className="mt-1.5" placeholder="e.g. Student body president, team captain, club founder..." rows={2} />
        </div>
        <div>
          <Label>Community Service & Volunteering</Label>
          <Textarea value={profile.community_service} onChange={e => set('community_service', e.target.value)} className="mt-1.5" placeholder="Organizations, hours served, projects led..." rows={3} />
        </div>
        <div>
          <Label>Skills</Label>
          <Input value={profile.skills} onChange={e => set('skills', e.target.value)} className="mt-1.5" placeholder="e.g. Python, Public Speaking, Graphic Design, Leadership" />
        </div>
      </SectionCard>

      {/* Work Experience */}
      <SectionCard icon={Briefcase} title="Work Experience">
        <div>
          <Label>Jobs & Internships</Label>
          <Textarea value={profile.work_experience} onChange={e => set('work_experience', e.target.value)} className="mt-1.5" placeholder="List roles, employers, dates, and key responsibilities..." rows={4} />
        </div>
      </SectionCard>

      {/* Goals */}
      <SectionCard icon={Heart} title="Goals & Aspirations">
        <div>
          <Label>Career Goals</Label>
          <Textarea value={profile.career_goals} onChange={e => set('career_goals', e.target.value)} className="mt-1.5" placeholder="What do you want to do with your degree? What impact do you want to make?" rows={4} />
        </div>
      </SectionCard>

      <Button onClick={() => saveMutation.mutate(profile)} disabled={saveMutation.isPending} size="lg" className="w-full gap-2 h-12">
        <Save className="h-4 w-4" />
        {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
      </Button>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-destructive mb-3">Danger Zone</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive">
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" /> Delete Account
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all of your data from our servers, including saved scholarships, essays, and documents.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  setDeletePending(true);
                  logout(true);
                }}
                disabled={deletePending}
              >
                {deletePending ? 'Deleting...' : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}