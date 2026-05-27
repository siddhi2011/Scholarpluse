import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Dark mode toggle - top right */}
      <div className="fixed top-4 right-4 z-50 lg:block hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          className="h-9 w-9 rounded-xl shadow-sm bg-card border"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <main className="lg:ml-64 min-h-screen pb-16 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 max-w-screen-2xl">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
