import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import {
  Calendar,
  FileText,
  Plus,
  TrendingUp,
  Package
} from 'lucide-react';
import { Project, User, WorkLogEntry, Material } from '../../types';

interface WorkLogManagerProps {
  currentUser: User;
  projects: Project[];
  workLogs: WorkLogEntry[];
  materials: Material[];
  onAddWorkLog: (workLog: Omit<WorkLogEntry, 'id' | 'createdAt'>) => void;
  onUpdateWorkLog?: (id: string, workLog: Partial<WorkLogEntry>) => void;
  onDeleteWorkLog?: (id: string) => void;
  onUpdateProject?: (project: Project) => void;
}

export function WorkLogManager({
  currentUser,
  projects,
  workLogs,
  materials,
  onAddWorkLog,
  onUpdateProject
}: WorkLogManagerProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    progressPercentage: '',
    materialsUsed: [] as string[]
  });

  // Filter projects for current fabricator
  const fabricatorProjects = projects.filter(p =>
    p.fabricatorIds.includes(currentUser.id) && p.status !== 'pending-assignment'
  );

  // Filter work logs for selected project and current user
  const filteredWorkLogs = selectedProject
    ? workLogs.filter(wl => wl.projectId === selectedProject && wl.fabricatorId === currentUser.id)
    : workLogs.filter(wl => wl.fabricatorId === currentUser.id);

  // Get available materials for selected project
  const projectMaterials = selectedProject
    ? materials.filter(m => m.projectId === selectedProject || !m.projectId)
    : materials;

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaterialToggle = (materialName: string) => {
    setFormData(prev => ({
      ...prev,
      materialsUsed: prev.materialsUsed.includes(materialName)
        ? prev.materialsUsed.filter(m => m !== materialName)
        : [...prev.materialsUsed, materialName]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    const newWorkLog: Omit<WorkLogEntry, 'id' | 'createdAt'> = {
      projectId: selectedProject,
      fabricatorId: currentUser.id,
      date: formData.date,
      hoursWorked: 0,
      description: formData.description,
      progressPercentage: parseInt(formData.progressPercentage),
      materials: formData.materialsUsed.length > 0 ? formData.materialsUsed : undefined
    };

    onAddWorkLog(newWorkLog);

    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      progressPercentage: '',
      materialsUsed: []
    });
    setShowAddForm(false);
  };

  const getProjectProgress = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.progress || 0;
  };

  const getSelectedProject = () => projects.find(p => p.id === selectedProject);
  const hasDocumentation = () => {
    const proj = getSelectedProject();
    if (!proj) return false;
    const hasFiles = Array.isArray(proj.attachments) && proj.attachments.length > 0;
    const hasLink = !!proj.documentationUrl && proj.documentationUrl.trim().length > 0;
    return hasFiles || hasLink;
  };
  const canSubmitForReview = () => {
    const proj = getSelectedProject();
    if (!proj) return false;

    // Check all conditions explicitly
    // Allow submission if status is one where fabricator is actively working
    const validStatuses = ['1_Assigned_to_FAB', 'in-progress', 'planning'];
    const hasStatus = validStatuses.includes(proj.status);

    // Exclude statuses where already in review or completed
    const invalidStatuses = [
      '2_Ready_for_Supervisor_Review',
      '3_Ready_for_Admin_Review',
      '4_Ready_for_Client_Signoff',
      'completed',
      'on-hold'
    ];
    const hasInvalidStatus = invalidStatuses.includes(proj.status);

    const hasDocs = hasDocumentation();
    const hasProgress = proj.progress >= 100;

    // Debug logging (can be removed later)
    console.log('Submit button check:', {
      projectId: proj.id,
      status: proj.status,
      statusMatch: hasStatus && !hasInvalidStatus,
      progress: proj.progress,
      hasProgress: hasProgress,
      hasDocs: hasDocs,
      attachments: proj.attachments?.length || 0,
      docUrl: proj.documentationUrl,
      canSubmit: hasStatus && !hasInvalidStatus && hasDocs && hasProgress
    });

    return hasStatus && !hasInvalidStatus && hasDocs && hasProgress;
  };
  const submitForSupervisorReview = () => {
    const proj = getSelectedProject();
    if (!proj || !onUpdateProject) return;
    const updated: Project = { ...proj, status: '2_Ready_for_Supervisor_Review' };
    onUpdateProject(updated);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Log & Progress Reports
          </h2>
          <p className="text-muted-foreground">Track your daily work progress and material usage</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={!selectedProject}>
          <Plus className="h-4 w-4 mr-2" />
          Add Work Log
        </Button>
      </div>

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project to log work for" />
            </SelectTrigger>
            <SelectContent>
              {fabricatorProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{project.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {project.progress}% Complete
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {selectedProject && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Project Progress</span>
              </div>
              <p className="text-2xl">{getProjectProgress(selectedProject)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Work Entries</span>
              </div>
              <p className="text-2xl">{filteredWorkLogs.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Documentation</span>
              </div>
              <p className="text-2xl">{hasDocumentation() ? 'Ready' : 'Missing'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Work Log Form */}
      {showAddForm && selectedProject && (
        <Card>
          <CardHeader>
            <CardTitle>Add Work Log Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">Progress Contribution (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="5"
                  value={formData.progressPercentage}
                  onChange={(e) => handleInputChange('progressPercentage', e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  How much of the project does this work session complete?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Work Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work performed, challenges faced, and achievements..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Materials Used (Optional)</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {projectMaterials.map(material => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`material-${material.id}`}
                        checked={formData.materialsUsed.includes(material.name)}
                        onChange={() => handleMaterialToggle(material.name)}
                        className="rounded"
                      />
                      <Label
                        htmlFor={`material-${material.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {material.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Work Log
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Submit for Supervisor Review */}
      {selectedProject && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Upload files in the Project Details → Files or add a documentation link.</div>
                {(() => {
                  const proj = getSelectedProject();
                  if (!proj) return null;
                  const missingRequirements = [];
                  if (!hasDocumentation()) missingRequirements.push('documentation');
                  if (proj.progress < 100) missingRequirements.push('100% progress');
                  if (proj.status !== '1_Assigned_to_FAB') missingRequirements.push('correct status');

                  return (
                    <div className="text-xs space-y-1">
                      <div>
                        Progress: <strong>{proj.progress}%</strong> {proj.progress < 100 && '(Must be 100% to submit)'}
                      </div>
                      <div>
                        Status: <strong>{proj.status}</strong> {
                          !['1_Assigned_to_FAB', 'in-progress', 'planning'].includes(proj.status) &&
                          !['2_Ready_for_Supervisor_Review', '3_Ready_for_Admin_Review', '4_Ready_for_Client_Signoff', 'completed', 'on-hold'].includes(proj.status) &&
                          '(Status must allow submission)'
                        }
                      </div>
                      <div>
                        Documentation: <strong>{hasDocumentation() ? 'Ready' : 'Missing'}</strong>
                        {!hasDocumentation() && (
                          <span className="ml-1">({proj.attachments?.length || 0} files, {proj.documentationUrl ? 'has link' : 'no link'})</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
              <Button
                onClick={submitForSupervisorReview}
                disabled={!canSubmitForReview()}
                className={canSubmitForReview() ? 'bg-green-600 hover:bg-green-700' : ''}
                title={
                  (() => {
                    const proj = getSelectedProject();
                    if (!proj) return 'Select a project first';
                    const validStatuses = ['1_Assigned_to_FAB', 'in-progress', 'planning'];
                    const invalidStatuses = ['2_Ready_for_Supervisor_Review', '3_Ready_for_Admin_Review', '4_Ready_for_Client_Signoff', 'completed', 'on-hold'];
                    if (!validStatuses.includes(proj.status) || invalidStatuses.includes(proj.status)) {
                      return `Status must allow submission (currently: ${proj.status})`;
                    }
                    if (!hasDocumentation()) return 'Add documentation (files or link) before submitting';
                    if (proj.progress < 100) return `Progress must be 100% (currently: ${proj.progress}%)`;
                    return 'Click to submit for supervisor review';
                  })()
                }
              >
                Submit for Supervisor Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Log History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Work Log History
            {selectedProject && (
              <Badge variant="outline">
                {getProjectName(selectedProject)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredWorkLogs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No work logs found</h3>
              <p className="text-muted-foreground">
                {selectedProject
                  ? 'Start logging your work progress for this project.'
                  : 'Select a project to view your work logs.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkLogs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((log) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleDateString()}
                        </div>

                        <Badge variant="outline">
                          +{log.progressPercentage}% progress
                        </Badge>
                      </div>
                      {!selectedProject && (
                        <Badge variant="outline">
                          {getProjectName(log.projectId)}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm mb-3">{log.description}</p>

                    {log.materials && log.materials.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">Materials Used:</p>
                        <div className="flex flex-wrap gap-1">
                          {log.materials.map((material, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {material}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Logged on {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}