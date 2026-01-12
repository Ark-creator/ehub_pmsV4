import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Task, User, Project } from '../../types';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  currentUser: User;
  onUpdateTaskStatus?: (taskId: string, status: Task['status']) => void;
}

export function TaskList({ tasks, projects, currentUser, onUpdateTaskStatus }: TaskListProps) {
  const getFilteredTasks = () => {
    if (currentUser.role === 'admin') {
      return tasks;
    }
    if (currentUser.role === 'supervisor') {
      const supervisorProjects = projects.filter(p => p.supervisorId === currentUser.id);
      return tasks.filter(t => supervisorProjects.some(p => p.id === t.projectId));
    }
    return tasks.filter(t => t.assignedTo === currentUser.id);
  };

  const filteredTasks = getFilteredTasks().slice(0, 8);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      case 'pending':
        return 'outline';
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

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const canUpdateTask = (task: Task) => {
    return currentUser.role === 'fabricator' && task.assignedTo === currentUser.id;
  };

  const canMarkAsDone = (task: Task) => {
    return (currentUser.role === 'admin' || currentUser.role === 'supervisor') && task.status !== 'completed';
  };

  const getNextStatus = (currentStatus: Task['status']): Task['status'] => {
    switch (currentStatus) {
      case 'pending':
        return 'in-progress';
      case 'in-progress':
        return 'completed';
      case 'blocked':
        return 'completed';
      case 'completed':
      default:
        return 'completed';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                {getStatusIcon(task.status)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{task.title}</p>
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getProjectName(task.projectId)} • Due:{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "No due date"}
                  </p>
                </div>
              </div>
              {onUpdateTaskStatus && (
                <div className="flex gap-2">
                  {canUpdateTask(task) && task.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onUpdateTaskStatus(task.id, getNextStatus(task.status));
                      }}
                    >
                      {task.status === 'pending' && 'Start'}
                      {task.status === 'in-progress' && 'Complete'}
                      {task.status === 'blocked' && 'Complete'}
                    </Button>
                  )}
                  {canMarkAsDone(task) && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onUpdateTaskStatus(task.id, 'completed')}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No tasks available
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}