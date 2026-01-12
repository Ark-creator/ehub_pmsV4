import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Package,
  BarChart3,
  Settings,
  Calendar,
  DollarSign,
  Archive,
  Eye,
  Download
} from 'lucide-react';
import { User } from '../../types';
import { useSidebar } from '../ui/sidebar';

interface AppSidebarProps {
  currentUser: User;
}

export function AppSidebar({ currentUser }: AppSidebarProps) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  // Base navigation items for all users
  const getNavigationItems = () => {
    const baseItems = [
      {
        title: 'Dashboard',
        url: '#dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Projects',
        url: '#projects',
        icon: FolderOpen,
      },
    ];

    // Role-specific navigation items
    if (currentUser.role === 'admin') {
      return [
        ...baseItems,
        {
          title: 'Archives',
          url: '#archives',
          icon: Archive,
        },
        {
          title: 'Tasks',
          url: '#tasks',
          icon: CheckSquare,
        },
        {
          title: 'Users',
          url: '#users',
          icon: Users,
        },
        {
          title: 'Revenue',
          url: '#revenue',
          icon: DollarSign,
        },
        {
          title: 'Reports',
          url: '#reports',
          icon: BarChart3,
        },
        {
          title: 'Settings',
          url: '#settings',
          icon: Settings,
        },
      ];
    }

    if (currentUser.role === 'supervisor') {
      return [
        ...baseItems,
        {
          title: 'Archives',
          url: '#archives',
          icon: Archive,
        },
        {
          title: 'Tasks',
          url: '#tasks',
          icon: CheckSquare,
        },
        {
          title: 'Team',
          url: '#team',
          icon: Users,
        },
        {
          title: 'Reports',
          url: '#reports',
          icon: BarChart3,
        },
      ];
    }

    if (currentUser.role === 'fabricator') {
      return [
        ...baseItems,
        {
          title: 'Work Log',
          url: '#worklog',
          icon: Calendar,
        },
        {
          title: 'Materials',
          url: '#materials',
          icon: Package,
        },
        {
          title: 'Tasks',
          url: '#tasks',
          icon: CheckSquare,
        },
      ];
    }

    if (currentUser.role === 'client') {
      return [
        {
          title: 'Dashboard',
          url: '#dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Project Status',
          url: '#project-status',
          icon: Eye,
        },
        {
          title: 'Documentation',
          url: '#documentation',
          icon: Download,
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <Sidebar className="border-r-0" collapsible="offcanvas">
      <SidebarContent className="gap-0 bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <h3 className={`text-sm text-sidebar-foreground/70 tracking-wide uppercase transition-opacity ${state === 'collapsed' ? 'opacity-0 w-0 overflow-hidden' : ''}`}>
            Navigation
          </h3>
        </div>
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-sidebar-accent rounded-lg transition-colors"
                    tooltip={state === 'collapsed' ? item.title : undefined}
                  >
                    <a
                      href={item.url}
                      className="flex items-center gap-3 px-3 py-2.5"
                      onClick={(e) => {
                        // Ensure hash updates even if default is prevented by wrappers
                        const href = item.url;
                        if (href.startsWith('#')) {
                          e.preventDefault();
                          window.location.hash = href;
                        }
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className={state === 'collapsed' ? 'sr-only' : ''}>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}