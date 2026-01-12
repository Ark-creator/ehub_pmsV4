import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FolderOpen, CheckSquare, Users, DollarSign } from 'lucide-react';
import { Project, Task, User as UserType } from '../../types';

interface DashboardStatsProps {
  projects: Project[];
  tasks: Task[];
  users: UserType[];
  currentUser: UserType;
}

const navigateToView = (view: string) => {
  window.location.hash = view;
};

export function DashboardStats({ projects, tasks, users, currentUser }: DashboardStatsProps) {
  const getFilteredData = () => {
    if (currentUser.role === 'admin') {
      return { projects, tasks, users };
    }

    if (currentUser.role === 'supervisor') {
      const filteredProjects = projects.filter(p => p.supervisorId === currentUser.id);
      const filteredTasks = tasks.filter(t =>
        filteredProjects.some(p => p.id === t.projectId)
      );
      return {
        projects: filteredProjects,
        tasks: filteredTasks,
        users: users.filter(u => u.role === 'fabricator')
      };
    }

    // fabricator
    const filteredTasks = tasks.filter(t => t.assignedTo === currentUser.id);
    const filteredProjects = projects.filter(p =>
      p.fabricatorIds.includes(currentUser.id)
    );
    return {
      projects: filteredProjects,
      tasks: filteredTasks,
      users: []
    };
  };

  const { projects: filteredProjects, tasks: filteredTasks, users: filteredUsers } = getFilteredData();

  const activeProjects = filteredProjects.filter(p => p.status === 'in-progress').length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;

  // Role-based revenue calculations
  const getRevenueData = () => {
    if (currentUser.role === 'admin') {
      const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
      const totalRevenue = filteredProjects.reduce((sum, p) => sum + p.revenue, 0);
      return {
        title: 'Total Revenue',
        value: `₱${totalRevenue.toLocaleString()}`,
        description: `₱${totalBudget.toLocaleString()} budgeted`,
        canView: true
      };
    }

    if (currentUser.role === 'supervisor') {
      const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
      const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
      return {
        title: 'Project Budget',
        value: `₱${totalBudget.toLocaleString()}`,
        description: `₱${totalSpent.toLocaleString()} spent`,
        canView: true
      };
    }

    // fabricator - only assigned project values
    const totalProjectValue = filteredProjects.reduce((sum, p) => sum + p.revenue, 0);
    return {
      title: 'Assigned Value',
      value: `₱${totalProjectValue.toLocaleString()}`,
      description: `${filteredProjects.length} assigned projects`,
      canView: true
    };
  };

  const revenueData = getRevenueData();

  const stats = [
    {
      title: 'Active Projects',
      value: activeProjects.toString(),
      icon: FolderOpen,
      description: `${filteredProjects.length} total projects`,
      onClick: () => navigateToView('projects'),
    },
    {
      title: 'Completed Tasks',
      value: completedTasks.toString(),
      icon: CheckSquare,
      description: `${filteredTasks.length} total tasks`,
      onClick: () => navigateToView('tasks'),
    },
    ...(currentUser.role !== 'fabricator' ? [{
      title: 'Team Members',
      value: filteredUsers.length.toString(),
      icon: Users,
      description: 'Available resources',
      onClick: () => navigateToView('users'),
    }] : []),
    {
      title: revenueData.title,
      value: revenueData.value,
      icon: DollarSign,
      description: revenueData.description,
      onClick: () => navigateToView('revenue'),
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all cursor-pointer md:hover:scale-105 active:scale-95"
          onClick={stat.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-br from-primary/5 to-transparent px-4 md:px-6">
            <CardTitle className="text-xs md:text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-1.5 md:p-2 rounded-lg ${index === 0 ? 'bg-primary/10 text-primary' :
                index === 1 ? 'bg-accent/10 text-accent' :
                  index === 2 ? 'bg-secondary/10 text-secondary' :
                    'bg-accent/10 text-accent'
              }`}>
              <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 px-4 md:px-6">
            <div className="text-2xl md:text-3xl font-bold">
              {stat.value}
            </div>
            <p className="text-[10px] md:text-sm text-muted-foreground mt-1 truncate">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}