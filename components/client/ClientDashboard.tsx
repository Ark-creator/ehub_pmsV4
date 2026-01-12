import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, CheckCircle, Clock, Download, Eye, FileText, User, AlertCircle } from 'lucide-react';
import { Project, User as UserType, WorkLogEntry, Task } from '../../types';

interface ClientDashboardProps {
  currentUser: UserType;
  projects: Project[];
  users: UserType[];
  workLogs: WorkLogEntry[];
  tasks: Task[];
}

export function ClientDashboard({ 
  currentUser, 
  projects, 
  users, 
  workLogs, 
  tasks 
}: ClientDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Get client's project
  const clientProject = projects.find(p => p.id === currentUser.clientProjectId);
  
  if (!clientProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg mb-2">No Project Assigned</h3>
          <p className="text-muted-foreground">
            You don't have any projects assigned to your account yet.
          </p>
        </div>
      </div>
    );
  }

  const supervisor = users.find(u => u.id === clientProject.supervisorId);
  const fabricators = users.filter(u => clientProject.fabricatorIds.includes(u.id));
  const projectWorkLogs = workLogs.filter(log => log.projectId === clientProject.id);
  const projectTasks = tasks.filter(task => task.projectId === clientProject.id);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'review':
        return 'outline';
      case 'on-hold':
        return 'destructive';
      case 'planning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewDetails = () => {
    setSelectedProject(clientProject);
    setShowDetailsDialog(true);
  };

  // Sort work logs by date (most recent first)
  const sortedWorkLogs = [...projectWorkLogs].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
  const totalTasks = projectTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Client Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track your project progress and documentation
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {currentUser.school}
        </Badge>
      </div>

      {/* Project Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl">{clientProject.name}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {clientProject.description}
              </p>
            </div>
            <div className="flex gap-2 ml-4">
              <Badge variant={getStatusColor(clientProject.status)} className="flex items-center gap-1">
                {getStatusIcon(clientProject.status)}
                {clientProject.status}
              </Badge>
              <Badge variant="outline">
                {clientProject.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Project Progress</span>
                <span className="text-sm">{clientProject.progress}%</span>
              </div>
              <Progress value={clientProject.progress} className="h-2" />
            </div>

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p>{new Date(clientProject.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p>{new Date(clientProject.endDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Supervisor</p>
                  <p>{supervisor?.name}</p>
                </div>
              </div>
            </div>

            {/* Task Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl">{totalTasks}</p>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl text-green-600">{completedTasks}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl">{taskProgress.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Task Progress</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
              {clientProject.documentationUrl && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(clientProject.documentationUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Reports and Documentation */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Progress Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Progress Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedWorkLogs.length > 0 ? (
              <div className="space-y-4">
                {sortedWorkLogs.slice(0, 5).map((log) => {
                  const fabricator = users.find(u => u.id === log.fabricatorId);
                  return (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium">{fabricator?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.date).toLocaleDateString()} • {log.hoursWorked} hours
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{log.progressPercentage}% progress
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {log.description}
                      </p>
                      {log.materials && log.materials.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Materials Used:</p>
                          <p className="text-xs text-muted-foreground">
                            {log.materials.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
                {sortedWorkLogs.length > 5 && (
                  <Button variant="outline" size="sm" onClick={handleViewDetails}>
                    View All Reports ({sortedWorkLogs.length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No progress reports available yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Project Documentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientProject.attachments && clientProject.attachments.length > 0 ? (
              <div className="space-y-3">
                {clientProject.attachments.map((doc) => {
                  const uploader = users.find(u => u.id === doc.uploadedBy);
                  return (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • 
                            Uploaded by {uploader?.name} on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No documentation available yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Complete project details and progress tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedProject && (
            <div className="space-y-6">
              <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                </TabsList>

                <TabsContent value="progress" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Project Status</label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Badge variant={getStatusColor(selectedProject.status)} className="flex items-center gap-1">
                          {getStatusIcon(selectedProject.status)}
                          {selectedProject.status}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Overall Progress</label>
                      <div className="mt-1">
                        <Progress value={selectedProject.progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-1">{selectedProject.progress}% complete</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">All Progress Reports</h4>
                    <div className="space-y-3">
                      {sortedWorkLogs.map((log) => {
                        const fabricator = users.find(u => u.id === log.fabricatorId);
                        return (
                          <div key={log.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{fabricator?.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(log.date).toLocaleDateString()} • {log.hoursWorked} hours worked
                                </p>
                              </div>
                              <Badge variant="secondary">
                                +{log.progressPercentage}% progress
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.description}
                            </p>
                            {log.materials && log.materials.length > 0 && (
                              <div>
                                <p className="text-xs font-medium">Materials Used:</p>
                                <p className="text-xs text-muted-foreground">
                                  {log.materials.join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3">Task Progress</h4>
                    <div className="space-y-2">
                      {projectTasks.map((task) => {
                        const assignee = users.find(u => u.id === task.assignedTo);
                        return (
                          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Assigned to: {assignee?.name}
                              </p>
                            </div>
                            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                              {task.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documentation" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3">Project Documents</h4>
                      <div className="grid gap-2">
                        {selectedProject.attachments?.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-medium">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB • 
                                  Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )) || <p className="text-sm text-muted-foreground">No documents available.</p>}
                      </div>
                    </div>

                    {selectedProject.documentationUrl && (
                      <div>
                        <h4 className="mb-3">External Documentation</h4>
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Google Drive Documentation</p>
                              <p className="text-xs text-muted-foreground">
                                Complete project documentation and files
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              onClick={() => window.open(selectedProject.documentationUrl, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3">Project Supervisor</h4>
                      <div className="p-4 border rounded-lg">
                        {supervisor ? (
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{supervisor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {supervisor.school} • {supervisor.secureId}
                              </p>
                            </div>
                          </div>
                        ) : <p className="text-sm text-muted-foreground">Supervisor information not available</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3">Fabrication Team</h4>
                      <div className="grid gap-3">
                        {fabricators.map(fabricator => {
                          const fabricatorLogs = projectWorkLogs.filter(log => log.fabricatorId === fabricator.id);
                          const totalHours = fabricatorLogs.reduce((sum, log) => sum + log.hoursWorked, 0);
                          
                          return (
                            <div key={fabricator.id} className="p-4 border rounded-lg">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                  <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{fabricator.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {fabricator.school} • {fabricator.secureId}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{totalHours} hours</p>
                                  <p className="text-xs text-muted-foreground">{fabricatorLogs.length} reports</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}