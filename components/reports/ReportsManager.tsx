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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Edit, Trash2, Calendar, User, Building, AlertCircle, FileText, Download, Eye } from 'lucide-react';
import { Project, User as UserType, Task } from '../../types';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'task' | 'user' | 'financial' | 'custom';
  status: 'draft' | 'published' | 'archived';
  projectId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  data: any;
  filters: any;
}

interface ReportsManagerProps {
  projects: Project[];
  users: UserType[];
  tasks: Task[];
  currentUser: UserType;
}

export function ReportsManager({
  projects,
  users,
  tasks,
  currentUser
}: ReportsManagerProps) {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'report-1',
      title: 'Monthly Project Progress',
      description: 'Comprehensive overview of all project progress for the current month',
      type: 'project',
      status: 'published',
      createdBy: 'admin-001',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      data: {},
      filters: { month: 'current', status: 'all' }
    },
    {
      id: 'report-2',
      title: 'Team Performance Analysis',
      description: 'Analysis of team member performance and task completion rates',
      type: 'user',
      status: 'published',
      createdBy: 'admin-001',
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      data: {},
      filters: { period: 'last30days', includeAll: true }
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'project' as Report['type'],
    status: 'draft' as Report['status'],
    projectId: '',
    filters: {}
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'project',
      status: 'draft',
      projectId: '',
      filters: {}
    });
  };

  const handleCreate = () => {
    if (!formData.title) return;

    const newReport: Report = {
      id: `report-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      projectId: formData.projectId || undefined,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: generateReportData(formData.type, formData.projectId),
      filters: formData.filters
    };

    setReports(prev => [...prev, newReport]);
    resetForm();
    setShowCreateDialog(false);
  };

  const handleEdit = (report: Report) => {
    setSelectedReport(report);
    setFormData({
      title: report.title,
      description: report.description,
      type: report.type,
      status: report.status,
      projectId: report.projectId || '',
      filters: report.filters
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedReport || !formData.title) return;

    setReports(prev => prev.map(report => 
      report.id === selectedReport.id
        ? {
            ...report,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            status: formData.status,
            projectId: formData.projectId || undefined,
            updatedAt: new Date().toISOString(),
            data: generateReportData(formData.type, formData.projectId),
            filters: formData.filters
          }
        : report
    ));

    resetForm();
    setSelectedReport(null);
    setShowEditDialog(false);
  };

  const handleDelete = (report: Report) => {
    setSelectedReport(report);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedReport) {
      setReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSelectedReport(null);
      setShowDeleteDialog(false);
    }
  };

  const handleView = (report: Report) => {
    setSelectedReport(report);
    setShowViewDialog(true);
  };

  const generateReportData = (type: Report['type'], projectId?: string) => {
    switch (type) {
      case 'project':
        if (projectId) {
          const project = projects.find(p => p.id === projectId);
          const projectTasks = tasks.filter(t => t.projectId === projectId);
          return {
            project,
            tasks: projectTasks,
            totalTasks: projectTasks.length,
            completedTasks: projectTasks.filter(t => t.status === 'completed').length,
            completionRate: projectTasks.length > 0 ? (projectTasks.filter(t => t.status === 'completed').length / projectTasks.length) * 100 : 0
          };
        }
        return {
          projects: projects.length,
          completedProjects: projects.filter(p => p.status === 'completed').length,
          inProgressProjects: projects.filter(p => p.status === 'in-progress').length
        };
      case 'task':
        return {
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          pendingTasks: tasks.filter(t => t.status === 'pending').length,
          inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
          blockedTasks: tasks.filter(t => t.status === 'blocked').length
        };
      case 'user':
        return {
          totalUsers: users.length,
          admins: users.filter(u => u.role === 'admin').length,
          supervisors: users.filter(u => u.role === 'supervisor').length,
          fabricators: users.filter(u => u.role === 'fabricator').length
        };
      case 'financial':
        const totalRevenue = projects.reduce((sum, p) => sum + p.revenue, 0);
        const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
        const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);
        return {
          totalRevenue,
          totalBudget,
          totalSpent,
          profit: totalRevenue - totalSpent,
          budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        };
      default:
        return {};
    }
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getTypeColor = (type: Report['type']) => {
    switch (type) {
      case 'project':
        return 'default';
      case 'task':
        return 'secondary';
      case 'user':
        return 'outline';
      case 'financial':
        return 'destructive';
      case 'custom':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const canCreateReport = currentUser.role === 'admin' || currentUser.role === 'supervisor';
  const canEditReport = (report: Report) => {
    return currentUser.role === 'admin' || report.createdBy === currentUser.id;
  };

  const getFilteredReports = () => {
    if (currentUser.role === 'admin') {
      return reports;
    }
    if (currentUser.role === 'supervisor') {
      return reports.filter(r => 
        r.createdBy === currentUser.id || 
        r.status === 'published' ||
        (r.projectId && projects.some(p => p.id === r.projectId && p.supervisorId === currentUser.id))
      );
    }
    return reports.filter(r => r.status === 'published');
  };

  const filteredReports = getFilteredReports();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Generate and manage comprehensive project reports
          </p>
        </div>
        {canCreateReport && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Reports</TabsTrigger>
          <TabsTrigger value="project">Project Reports</TabsTrigger>
          <TabsTrigger value="task">Task Reports</TabsTrigger>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      {report.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {report.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <Badge variant={getTypeColor(report.type)}>
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 text-sm">
                    {report.projectId && (
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Project: {projects.find(p => p.id === report.projectId)?.name || 'Unknown'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Created by: {users.find(u => u.id === report.createdBy)?.name || 'Unknown'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Created: {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.updatedAt !== report.createdAt && (
                        <>
                          <span>•</span>
                          <span>
                            Updated: {new Date(report.updatedAt).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* Download functionality */}}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    {canEditReport(report) && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(report)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="project" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.filter(r => r.type === 'project').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Projects</p>
                      <p className="text-2xl">{report.data.projects || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="text-2xl text-green-600">{report.data.completedProjects || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">In Progress</p>
                      <p className="text-2xl text-blue-600">{report.data.inProgressProjects || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completion Rate</p>
                      <p className="text-2xl">{report.data.completionRate || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="task" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.filter(r => r.type === 'task').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Tasks</p>
                      <p className="text-2xl">{report.data.totalTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="text-2xl text-green-600">{report.data.completedTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">In Progress</p>
                      <p className="text-2xl text-blue-600">{report.data.inProgressTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="text-2xl text-yellow-600">{report.data.pendingTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Blocked</p>
                      <p className="text-2xl text-red-600">{report.data.blockedTasks || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4">
            {filteredReports.filter(r => r.type === 'financial').map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{report.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl text-green-600">${(report.data.totalRevenue || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Budget</p>
                      <p className="text-2xl">${(report.data.totalBudget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Spent</p>
                      <p className="text-2xl text-red-600">${(report.data.totalSpent || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profit</p>
                      <p className={`text-2xl ${(report.data.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${(report.data.profit || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Budget Usage</p>
                      <p className="text-2xl">{(report.data.budgetUtilization || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">
                {canCreateReport 
                  ? 'Create your first report to get started with analytics.'
                  : 'No reports have been published yet.'
                }
              </p>
              {canCreateReport && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Report Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Generate a comprehensive report with customizable filters and data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter report title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter report description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Report Type</Label>
                <Select value={formData.type} onValueChange={(value: Report['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project Report</SelectItem>
                    <SelectItem value="task">Task Report</SelectItem>
                    <SelectItem value="user">User Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Report['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'project' && (
              <div className="space-y-2">
                <Label htmlFor="project">Specific Project (Optional)</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project or leave blank for all projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
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
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title}>
                Create Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Update report details and regenerate data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Report Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter report title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter report description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Report Type</Label>
                <Select value={formData.type} onValueChange={(value: Report['type']) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project Report</SelectItem>
                    <SelectItem value="task">Task Report</SelectItem>
                    <SelectItem value="user">User Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: Report['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'project' && (
              <div className="space-y-2">
                <Label htmlFor="edit-project">Specific Project (Optional)</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project or leave blank for all projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Projects</SelectItem>
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
            )}

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!formData.title}>
                Update Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Report Type</Label>
                    <p className="text-sm">{selectedReport.type}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">{selectedReport.status}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Updated</Label>
                    <p className="text-sm">{new Date(selectedReport.updatedAt).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="mb-4">Report Data</h4>
                  <pre className="text-sm bg-muted p-4 rounded overflow-auto">
                    {JSON.stringify(selectedReport.data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Report
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedReport?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}