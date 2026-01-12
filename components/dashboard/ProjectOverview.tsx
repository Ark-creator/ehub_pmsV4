import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Project, User } from '../../types';

interface ProjectOverviewProps {
  projects: Project[];
  currentUser: User;
}

export function ProjectOverview({ projects, currentUser }: ProjectOverviewProps) {
  const getFilteredProjects = () => {
    if (currentUser.role === 'admin') {
      return projects;
    }
    if (currentUser.role === 'supervisor') {
      return projects.filter(p => p.supervisorId === currentUser.id);
    }
    return projects.filter(p => p.fabricatorIds.includes(currentUser.id));
  };

  const filteredProjects = getFilteredProjects();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'planning':
        return 'outline';
      case 'review':
        return 'destructive';
      case 'on-hold':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredProjects.slice(0, 5).map((project) => (
            <div key={project.id} className="flex items-center justify-between space-y-2">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm">{project.name}</h4>
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-xs text-muted-foreground w-12">
                    {project.progress}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Due: {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No projects assigned to you
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}