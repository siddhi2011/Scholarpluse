const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Search, BookmarkCheck, FileText, 
  Lightbulb, User, FolderOpen, GraduationCap, Menu, X, Layers, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { useQuery } from '@tanstack/react-query';
import { computeStats, calculateLevel } from '@/lib/gamification';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/scholarships', icon: Search, label: 'Discover' },
  { path: '/tracker', icon: BookmarkCheck, label: 'Tracker' },
  { path: '/resume', icon: FileText, label: 'Resume' },
  { path: '/brainstorm', icon: Lightbulb, label: 'Essay Workshop' },
  { path: '/documents', icon: FolderOpen, label: 'Documents' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  const { data: saved = [] } = useQuery({
    queryKey: ['saved-scholarships'],
    queryFn: () => db.entities.SavedScholarship.list(),
  });
  const { data: essays = [] } = useQuery({
    queryKey: ['essay-drafts'],
    queryFn: () => db.entities.EssayDraft.list(),
  });
  const { data: scholarships = [] } = useQuery({
    queryKey: ['scholarships'],
    queryFn: () => db.entities.Scholarship.list('-created_date', 10),
  });

  const scholarshipMap = {};
  scholarships.forEach(s => { scholarshipMap[s.id] = s; });
  const stats = computeStats(saved, scholarshipMap, essays);
  const { level, title: levelTitle } = calculateLevel(stats.xp);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}
      
      <Button variant="ghost" size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-sm border"
        onClick={onToggle}>
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar z-40 flex flex-col transition-transform duration-300 ease-out",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground leading-none">ScholarAI</h1>
            <p className="text-xs text-sidebar-foreground/40 mt-0.5">Smart Scholarships</p>
          </div>
        </div>

        {/* Level badge */}
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-sidebar-accent flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-sidebar-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground">Level {level} · {levelTitle}</p>
            <p className="text-xs text-sidebar-foreground/50">{stats.xp} XP earned</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onToggle(); }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20" 
                    : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" style={{ height: '1.125rem', width: '1.125rem' }} />
                <span>{item.label}</span>
                {item.path === '/tracker' && saved.length > 0 && (
                  <span className={cn(
                    "ml-auto text-xs rounded-full px-1.5 py-0.5 font-medium",
                    isActive ? "bg-white/20 text-white" : "bg-sidebar-accent text-sidebar-foreground/70"
                  )}>{saved.length}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom tip */}
        <div className="p-3 m-3 rounded-xl bg-sidebar-accent/60 border border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50 mb-1 font-medium uppercase tracking-wide">Daily Tip</p>
          <p className="text-xs text-sidebar-foreground/70 leading-relaxed">Apply to at least 2 scholarships per week. Consistency beats perfection!</p>
        </div>
      </aside>
    </>
  );
}