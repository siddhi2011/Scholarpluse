const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, BookmarkCheck, FileText, Lightbulb, 
  ArrowRight, Clock, DollarSign, TrendingUp, GraduationCap,
  Sparkles, Target, Trophy, Flame, ChevronRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getCategoryLabel } from '@/lib/educationLevels';
import { computeStats, calculateLevel, BADGES } from '@/lib/gamification';
import XPBar from '@/components/dashboard/XPBar';
import BadgeGrid from '@/components/dashboard/BadgeGrid';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, sub, color, to, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link to={to}>
        <Card className="card-hover border-0 shadow-sm cursor-pointer overflow-hidden group">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
                {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
              </div>
              <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => db.entities.Scholarship.list('-created_date', 200),
  });
  const { data: saved = [] } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => db.entities.SavedScholarship.list(),
  });
  const { data: essays = [] } = useQuery({
    queryKey: ['essay-drafts'],
    queryFn: () => db.entities.EssayDraft.list(),
  });
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => db.auth.me(),
  });

  const activeScholarships = scholarships.filter(s => s.is_active !== false && new Date(s.deadline) > new Date());
  const savedIds = new Set(saved.map(s => s.scholarship_id));
  const scholarshipMap = {};
  scholarships.forEach(s => { scholarshipMap[s.id] = s; });

  const stats = computeStats(saved, scholarshipMap, essays);
  const { level, title: levelTitle, next } = calculateLevel(stats.xp);

  const urgentDeadlines = saved
    .map(s => ({ saved: s, scholarship: scholarshipMap[s.scholarship_id] }))
    .filter(({ scholarship }) => scholarship && differenceInDays(new Date(scholarship.deadline), new Date()) >= 0 && differenceInDays(new Date(scholarship.deadline), new Date()) <= 30)
    .sort((a, b) => new Date(a.scholarship.deadline) - new Date(b.scholarship.deadline))
    .slice(0, 5);

  const recommended = activeScholarships
    .filter(s => !savedIds.has(s.id))
    .slice(0, 4);

  // Profile completion
  const profileFields = ['education_level', 'school', 'gpa', 'major', 'achievements', 'extracurriculars', 'career_goals'];
  const profileComplete = profileFields.filter(f => user?.[f]).length;
  const profilePct = Math.round((profileComplete / profileFields.length) * 100);

  const earnedBadges = BADGES.filter(b => b.condition(stats));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Your scholarship journey at a glance</p>
        </div>
        <Link to="/scholarships">
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25">
            <Search className="h-4 w-4" /> Find Scholarships
          </Button>
        </Link>
      </div>

      {/* XP & Level bar */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-4">
          <XPBar xp={stats.xp} />
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Search} label="Available" value={activeScholarships.length} color="bg-primary/10 text-primary" to="/scholarships" delay={0} />
        <StatCard icon={BookmarkCheck} label="Saved" value={stats.totalSaved} color="bg-accent/10 text-accent" to="/tracker" delay={0.05} />
        <StatCard icon={TrendingUp} label="Applied" value={stats.totalApplied} sub={stats.totalApplied > 0 ? `$${stats.totalAppliedAmount.toLocaleString()} applied for` : null} color="bg-chart-3/10 text-chart-3" to="/tracker" delay={0.1} />
        <StatCard icon={Trophy} label="Won" value={stats.totalAccepted} color="bg-chart-4/10 text-chart-4" to="/tracker" delay={0.15} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="space-y-4">
          {/* Profile completion */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Profile</h3>
                <Link to="/profile"><Button variant="ghost" size="sm" className="h-7 text-xs text-primary">Edit</Button></Link>
              </div>
              <Progress value={profilePct} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">{profilePct}% complete · {profileFields.length - profileComplete} fields remaining</p>
              {profilePct < 100 && (
                <Link to="/profile">
                  <Button size="sm" variant="outline" className="w-full mt-3 text-xs">Complete Profile for Better Matches</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2"><Trophy className="h-4 w-4 text-primary" /> Badges</h3>
                <span className="text-xs text-muted-foreground">{earnedBadges.length}/{BADGES.length}</span>
              </div>
              <BadgeGrid stats={stats} />
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/scholarships', icon: Search, label: 'Browse Scholarships' },
                  { to: '/resume', icon: FileText, label: 'AI Resume Builder' },
                  { to: '/brainstorm', icon: Lightbulb, label: 'Write Essays' },
                  { to: '/documents', icon: GraduationCap, label: 'Upload Documents' },
                ].map(({ to, icon: Icon, label }) => (
                  <Link key={to} to={to}>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium flex-1">{label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right col - spans 2 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Upcoming deadlines */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><Flame className="h-4 w-4 text-destructive" /> Tracked Deadlines</h3>
                <Link to="/tracker"><Button variant="ghost" size="sm" className="text-primary gap-1 h-7">View all <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {urgentDeadlines.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No tracked scholarships yet</p>
                  <Link to="/scholarships"><Button size="sm" variant="outline" className="mt-3">Browse & Save</Button></Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {urgentDeadlines.map(({ saved: sv, scholarship }) => {
                    const daysLeft = differenceInDays(new Date(scholarship.deadline), new Date());
                    return (
                      <Link key={sv.id} to={`/scholarships/${scholarship.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${daysLeft <= 7 ? 'bg-destructive/10' : 'bg-muted'}`}>
                            <Clock className={`h-4 w-4 ${daysLeft <= 7 ? 'text-destructive' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{scholarship.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {scholarship.amount && <span className="text-xs text-muted-foreground">${scholarship.amount.toLocaleString()}</span>}
                              <span className="text-xs text-muted-foreground">· {format(new Date(scholarship.deadline), 'MMM d')}</span>
                            </div>
                          </div>
                          <Badge variant={daysLeft <= 3 ? "destructive" : daysLeft <= 14 ? "secondary" : "outline"} className="shrink-0 text-xs">
                            {daysLeft}d
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommended */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Recommended For You</h3>
                <Link to="/scholarships"><Button variant="ghost" size="sm" className="text-primary gap-1 h-7">More <ArrowRight className="h-3 w-3" /></Button></Link>
              </div>
              {recommended.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Complete your profile to get personalized matches</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommended.map(s => {
                    const daysLeft = differenceInDays(new Date(s.deadline), new Date());
                    return (
                      <Link key={s.id} to={`/scholarships/${s.id}`}>
                        <div className="p-3 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group">
                          <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{s.provider}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {s.amount && <Badge variant="secondary" className="text-xs gap-1"><DollarSign className="h-2.5 w-2.5" />{s.amount.toLocaleString()}</Badge>}
                            <Badge variant={daysLeft <= 14 ? "destructive" : "outline"} className="text-xs ml-auto">{daysLeft}d left</Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}