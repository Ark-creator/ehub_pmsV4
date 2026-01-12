import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Calendar,
  User,
  Building,
  Clock
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Task, Project, User as UserType } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface AdminTasksManagerProps {
  tasks: Task[];
  projects: Project[];
  users: UserType[];
  currentUser: UserType;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function AdminTasksManager({
  tasks,
  projects,
  users,
  currentUser,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: AdminTasksManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    projectId: '',
    assignedTo: 'unassigned',
    dueDate: '',
    estimatedHours: '',
    actualHours: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      projectId: '',
      assignedTo: 'unassigned',
      dueDate: '',
      estimatedHours: '',
      actualHours: ''
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  const handleCreate = () => {
    if (!formData.title || !formData.projectId) return;

    onCreateTask({
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      projectId: formData.projectId,
      assignedTo: formData.assignedTo === 'unassigned' ? undefined : formData.assignedTo,
      dueDate: formData.dueDate || undefined,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
      createdBy: currentUser.id
    });

    resetForm();
    setShowCreateDialog(false);
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      assignedTo: task.assignedTo || 'unassigned',
      dueDate: task.dueDate || '',
      estimatedHours: task.estimatedHours?.toString() || '',
      actualHours: task.actualHours?.toString() || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedTask || !formData.title || !formData.projectId) return;

    onUpdateTask(selectedTask.id, {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      projectId: formData.projectId,
      assignedTo: formData.assignedTo === 'unassigned' ? undefined : formData.assignedTo,
      dueDate: formData.dueDate || undefined,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined
    });

    resetForm();
    setSelectedTask(null);
    setShowEditDialog(false);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      onDeleteTask(selectedTask.id);
      setSelectedTask(null);
      setShowDeleteDialog(false);
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
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getAssigneeName = (userId?: string) => {
    if (!userId) return 'Unassigned';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown';
  };

  const renderTaskForm = (isEdit: boolean) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter task title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="projectId">Project *</Label>
          <Select
            value={formData.projectId}
            onValueChange={(value) => setFormData({ ...formData, projectId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: Task['status']) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Task['priority']) =>
              setFormData({ ...formData, priority: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select
            value={formData.assignedTo}
            onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users
                .filter(u => u.role === 'fabricator' || u.role === 'supervisor')
                .map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimatedHours">Est. Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actualHours">Actual Hours</Label>
          <Input
            id="actualHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.actualHours}
            onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => {
            resetForm();
            setSelectedTask(null);
            isEdit ? setShowEditDialog(false) : setShowCreateDialog(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={isEdit ? handleUpdate : handleCreate}>
          {isEdit ? 'Update' : 'Create'} Task
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Tasks Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and delete tasks across all projects
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-[200px]">
            <Building className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge variant={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(task)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {task.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Project:</span>
                  <span>{getProjectName(task.projectId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned:</span>
                  <span>{getAssigneeName(task.assignedTo)}</span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Due:</span>
                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Hours:</span>
                  <span>
                    {task.actualHours || 0} / {task.estimatedHours || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || projectFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a project.
            </DialogDescription>
          </DialogHeader>
          {renderTaskForm(false)}
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and assignments.
            </DialogDescription>
          </DialogHeader>
          {renderTaskForm(true)}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTask(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

