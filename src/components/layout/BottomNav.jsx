import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, BookmarkCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/scholarships', icon: Search, label: 'Discover' },
  { path: '/tracker', icon: BookmarkCheck, label: 'Tracker' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-14">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 flex-1',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
