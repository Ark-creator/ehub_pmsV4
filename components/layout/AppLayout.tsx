import { ReactNode } from 'react';
import { User } from '../../types';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentTheme: 'light' | 'dark' | 'auto';
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  isTransitioning?: boolean;
}

export function AppLayout({ children, currentUser, onLogout, currentTheme, onThemeChange, isTransitioning }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar currentUser={currentUser} />
        <SidebarInset className="flex-1">
          <Header
            currentUser={currentUser}
            onLogout={onLogout}
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
            isTransitioning={isTransitioning}
          />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}