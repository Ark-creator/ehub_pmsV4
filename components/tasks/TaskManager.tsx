import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar, User, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { Task, Project, User as UserType } from '../../types';

interface TaskManagerProps {
  tasks: Task[];
  projects: Project[];
  users: UserType[];
  currentUser: UserType;
  onCreateTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskManager({
  tasks,
  projects,
  users,
  currentUser,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: TaskManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    projectId: '',
    assignedTo: 'unassigned',
    dueDate: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      projectId: '',
      assignedTo: 'unassigned',
      dueDate: ''
    });
  };

  const handleCreate = () => {
    if (!formData.title || !formData.projectId) return;

    onCreateTask({
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      projectId: formData.projectId,
      assignedTo: formData.assignedTo === 'unassigned' ? undefined : formData.assignedTo,
      dueDate: formData.dueDate || undefined,
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
      dueDate: task.dueDate || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedTask || !formData.title || !formData.projectId) return;

    onUpdateTask(selectedTask.id, {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      projectId: formData.projectId,
      assignedTo: formData.assignedTo === 'unassigned' ? undefined : formData.assignedTo,
      dueDate: formData.dueDate || undefined
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

  const handleMarkAsDone = (task: Task) => {
    onUpdateTask(task.id, { 
      status: 'completed',
      updatedAt: new Date().toISOString()
    });
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
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
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getFilteredTasks = () => {
    if (currentUser.role === 'admin') {
      return tasks;
    }
    if (currentUser.role === 'supervisor') {
      const supervisorProjects = projects.filter(p => p.supervisorId === currentUser.id);
      return tasks.filter(t => supervisorProjects.some(p => p.id === t.projectId));
    }
    return tasks.filter(t => t.assignedTo === currentUser.id || t.createdBy === currentUser.id);
  };

  const filteredTasks = getFilteredTasks();

  const canCreateTask = currentUser.role === 'admin' || currentUser.role === 'supervisor';
  const canEditTask = (task: Task) => {
    return currentUser.role === 'admin' || 
           task.createdBy === currentUser.id ||
           (currentUser.role === 'supervisor' && projects.some(p => p.id === task.projectId && p.supervisorId === currentUser.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Task Management</h2>
          <p className="text-sm text-muted-foreground">
            Create, manage, and track project tasks
          </p>
        </div>
        {canCreateTask && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Badge variant={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Project: {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                  </span>
                </div>
                
                {task.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Assigned to: {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}
                    </span>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Created by: {users.find(u => u.id === task.createdBy)?.name || 'Unknown'}
                  </span>
                  <span>•</span>
                  <span>
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {canEditTask(task) && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(task)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(task)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  {task.status !== 'completed' && (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleMarkAsDone(task)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Done
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                {canCreateTask 
                  ? 'Create your first task to get started.'
                  : 'No tasks have been assigned to you yet.'
                }
              </p>
              {canCreateTask && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a team member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
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
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}>
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

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter(p => currentUser.role === 'admin' || p.supervisorId === currentUser.id)
                    .map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select value={formData.assignedTo || 'unassigned'} onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'unassigned' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users
                    .filter(u => u.role === 'fabricator' || u.role === 'supervisor')
                    .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.secureId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title || !formData.projectId}>
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details and assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}>
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

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-project">Project</Label>
              <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects
                    .filter(p => currentUser.role === 'admin' || p.supervisorId === currentUser.id)
                    .map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assignedTo">Assign To</Label>
              <Select value={formData.assignedTo || 'unassigned'} onValueChange={(value) => setFormData({ ...formData, assignedTo: value === 'unassigned' ? '' : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users
                    .filter(u => u.role === 'fabricator' || u.role === 'supervisor')
                    .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.secureId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!formData.title || !formData.projectId}>
                Update Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTask?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}