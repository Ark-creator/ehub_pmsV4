import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
  Calendar,
  DollarSign,
  Users,
  Building,
  Link,
  FileText,
  Download,
  ExternalLink,
  Edit,
  Save,
  X,
  FileText as FileIcon,
  Link as LinkIcon,
  Archive as ArchiveIcon,
  Users as UsersIcon,
  DollarSign as RevenueIcon
} from 'lucide-react';
import { Project, User, ProjectAttachment } from '../../types';
import { ProjectFileUpload } from './ProjectFileUpload';
import { FabricatorRevenueManager } from './FabricatorRevenueManager';
import { apiService } from '../../utils/apiService';

interface ProjectDetailsProps {
  project: Project;
  users: User[];
  currentUser: User;
  onUpdateProject: (updatedProject: Project) => void;
  onClose: () => void;
}

export function ProjectDetails({
  project,
  users,
  currentUser,
  onUpdateProject,
  onClose
}: ProjectDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);
  const [newFabricatorId, setNewFabricatorId] = useState<string>('');
  const [showAddFabricator, setShowAddFabricator] = useState(false);
  const [backendClientAssigned, setBackendClientAssigned] = useState(false);
  const clientUser = users.find(u => u.role === 'client' && u.clientProjectId === project.id);
  const localClientAssigned = !!clientUser;

  useEffect(() => {
    let active = true;
    // Verify against backend if client is assigned to this project
    (async () => {
      try {
        const res = await apiService.getProjects();
        const rows = (res.data || []) as any[];
        const raw = rows.find((r: any) => r.id === project.id || r.id === project.id);
        const assigned = !!(raw && (raw.client_id || raw.clientId || raw.client_name || raw.clientName));
        if (active) setBackendClientAssigned(assigned);
      } catch {
        // ignore; fall back to local state
      }
    })();
    return () => { active = false; };
  }, [project.id]);

  const canEdit =
    currentUser.role === 'admin' ||
    (currentUser.role === 'supervisor' && project.supervisorId === currentUser.id);

  const canManageFabricators =
    currentUser.role === 'admin' ||
    (currentUser.role === 'supervisor' && project.supervisorId === currentUser.id);

  const canUploadFiles =
    currentUser.role === 'admin' ||
    (currentUser.role === 'supervisor' && project.supervisorId === currentUser.id) ||
    (currentUser.role === 'fabricator' && project.fabricatorIds.includes(currentUser.id));

  const getSupervisorName = (supervisorId: string) => {
    const supervisor = users.find((u) => u.id === supervisorId);
    return supervisor?.name || 'Unknown Supervisor';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '0_Created':
        return 'outline';
      case '1_Assigned_to_FAB':
        return 'secondary';
      case '2_Ready_for_Supervisor_Review':
        return 'destructive';
      case '3_Ready_for_Admin_Review':
        return 'destructive';
      case '4_Ready_for_Client_Signoff':
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleSave = () => {
    onUpdateProject(editedProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleFilesUploaded = (newAttachments: ProjectAttachment[]) => {
    const updatedProject = {
      ...editedProject,
      attachments: [...(editedProject.attachments || []), ...newAttachments]
    };
    setEditedProject(updatedProject);
    onUpdateProject(updatedProject);
  };

  const handleDocumentationUrlChange = (url: string) => {
    setEditedProject((prev) => ({ ...prev, documentationUrl: url }));
  };

  const handleAddFabricator = () => {
    if (
      newFabricatorId &&
      !editedProject.fabricatorIds.includes(newFabricatorId)
    ) {
      const updatedFabricators = [
        ...editedProject.fabricatorIds,
        newFabricatorId
      ];
      const updatedProject = {
        ...editedProject,
        fabricatorIds: updatedFabricators
      };
      setEditedProject(updatedProject);
      onUpdateProject(updatedProject);
      setNewFabricatorId('');
      setShowAddFabricator(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <div className='flex justify-between items-start'>
            <div>
              {isEditing && canEdit ? (
                <div className='space-y-2'>
                  <Input
                    value={editedProject.name}
                    onChange={(e) =>
                      setEditedProject((prev) => ({
                        ...prev,
                        name: e.target.value
                      }))
                    }
                    className='text-2xl font-semibold'
                  />
                  <div className='flex items-center gap-2'>
                    <select
                      value={editedProject.status}
                      onChange={(e) =>
                        setEditedProject((prev) => ({
                          ...prev,
                          status: e.target.value as Project['status']
                        }))
                      }
                      className='border rounded px-2 py-1 text-sm'
                    >
                      <option value='0_Created'>0_Created</option>
                      <option value='1_Assigned_to_FAB'>1_Assigned_to_FAB</option>
                      <option value='2_Ready_for_Supervisor_Review'>2_Ready_for_Supervisor_Review</option>
                      <option value='3_Ready_for_Admin_Review'>3_Ready_for_Admin_Review</option>
                      <option value='4_Ready_for_Client_Signoff'>4_Ready_for_Client_Signoff</option>
                      <option value='planning'>Planning</option>
                      <option value='in-progress'>In Progress</option>
                      <option value='review'>Review</option>
                      <option value='completed'>Completed</option>
                      <option value='on-hold'>On Hold</option>
                      <option value='pending-assignment'>Pending Assignment</option>
                    </select>
                    <select
                      value={editedProject.priority}
                      onChange={(e) =>
                        setEditedProject((prev) => ({
                          ...prev,
                          priority: e.target.value as Project['priority']
                        }))
                      }
                      className='border rounded px-2 py-1 text-sm'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                      <option value='urgent'>Urgent</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <CardTitle className='text-2xl'>{project.name}</CardTitle>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant='outline'>{project.priority} priority</Badge>
                  </div>
                </>
              )}
            </div>
            <div className='flex gap-2'>
              {canEdit && !isEditing && (
                <Button
                  variant='outline'
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className='h-4 w-4 mr-2' />
                  Edit
                </Button>
              )}
              {(canEdit && (localClientAssigned || backendClientAssigned)) && (
                <Button variant='outline' disabled>
                  Client Assigned
                </Button>
              )}
              {isEditing && (
                <>
                  <Button variant='outline' onClick={handleSave}>
                    <Save className='h-4 w-4 mr-2' />
                    Save
                  </Button>
                  <Button variant='ghost' onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
              <Button variant='ghost' onClick={onClose}>
                <X className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue='overview' className='w-full'>
            <TabsList className='flex w-full overflow-x-auto justify-start md:grid md:grid-cols-5 h-auto p-1 bg-muted/50'>
              <TabsTrigger value='overview' className="flex-1 min-w-[80px]">
                <FileIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value='team' className="flex-1 min-w-[80px]">
                <UsersIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Team</span>
              </TabsTrigger>
              <TabsTrigger value='revenue' className="flex-1 min-w-[80px]">
                <RevenueIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Revenue</span>
              </TabsTrigger>
              <TabsTrigger value='files' className="flex-1 min-w-[80px]">
                <FileIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Files</span>
              </TabsTrigger>
              <TabsTrigger value='documentation' className="flex-1 min-w-[80px]">
                <LinkIcon className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Docs</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value='overview' className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='description'>Description</Label>
                    {isEditing ? (
                      <Input
                        id='description'
                        value={editedProject.description}
                        onChange={(e) =>
                          setEditedProject((prev) => ({
                            ...prev,
                            description: e.target.value
                          }))
                        }
                        className='mt-1'
                      />
                    ) : (
                      <p className='text-sm text-muted-foreground mt-1'>
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Progress</Label>
                    <div className='space-y-1'>
                      <div className='flex justify-between text-sm'>
                        <span>{project.progress}% Complete</span>
                        {isEditing && (
                          <Input
                            type='number'
                            min='0'
                            max='100'
                            value={editedProject.progress}
                            onChange={(e) =>
                              setEditedProject((prev) => ({
                                ...prev,
                                progress: parseInt(e.target.value) || 0
                              }))
                            }
                            className='w-20 h-6'
                          />
                        )}
                      </div>
                      <Progress value={project.progress} />
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        Start Date
                      </Label>
                      {isEditing && canEdit ? (
                        <Input
                          type='date'
                          value={editedProject.startDate}
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              startDate: e.target.value
                            }))
                          }
                          className='mt-1'
                        />
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        End Date
                      </Label>
                      {isEditing && canEdit ? (
                        <Input
                          type='date'
                          value={editedProject.endDate}
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              endDate: e.target.value
                            }))
                          }
                          className='mt-1'
                        />
                      ) : (
                        <p className='text-sm text-muted-foreground'>
                          {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className='flex items-center gap-2'>
                      <Building className='h-4 w-4' />
                      Client
                    </Label>
                    {clientUser ? (
                      <div className='text-sm text-muted-foreground'>
                        <p>{clientUser.name}</p>
                        <p className='text-xs'>{clientUser.email}</p>
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>No client assigned</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />
              <div className='space-y-4'>
                <h3 className='text-lg'>Financial Overview</h3>
                <div className='grid gap-4 md:grid-cols-3'>
                  {(currentUser.role === 'admin' ||
                    currentUser.role === 'supervisor') && (
                      <>
                        <Card>
                          <CardContent className='pt-6'>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm'>Budget</span>
                            </div>
                            {isEditing && currentUser.role === 'admin' ? (
                              <Input
                                type='number'
                                value={editedProject.budget}
                                onChange={(e) =>
                                  setEditedProject((prev) => ({
                                    ...prev,
                                    budget: parseFloat(e.target.value) || 0
                                  }))
                                }
                                className='text-2xl font-semibold mt-2'
                              />
                            ) : (
                              <p className='text-2xl'>
                                ₱{project.budget.toLocaleString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className='pt-6'>
                            <div className='flex items-center gap-2'>
                              <DollarSign className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm'>Spent</span>
                            </div>
                            {isEditing && currentUser.role === 'admin' ? (
                              <Input
                                type='number'
                                value={editedProject.spent}
                                onChange={(e) =>
                                  setEditedProject((prev) => ({
                                    ...prev,
                                    spent: parseFloat(e.target.value) || 0
                                  }))
                                }
                                className='text-2xl font-semibold mt-2'
                              />
                            ) : (
                              <p className='text-2xl'>
                                ₱{project.spent.toLocaleString()}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}

                  <Card>
                    <CardContent className='pt-6'>
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {currentUser.role === 'fabricator'
                            ? 'Project Value'
                            : 'Revenue'}
                        </span>
                      </div>
                      {isEditing && currentUser.role === 'admin' ? (
                        <Input
                          type='number'
                          value={editedProject.revenue}
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              revenue: parseFloat(e.target.value) || 0
                            }))
                          }
                          className='text-2xl font-semibold mt-2'
                        />
                      ) : (
                        <p className='text-2xl'>
                          ₱{project.revenue.toLocaleString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value='team' className='space-y-6'>
              <Card>
                <CardHeader className='flex justify-between items-center'>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='h-5 w-5' />
                    Project Team
                  </CardTitle>
                  {canManageFabricators && !showAddFabricator && (
                    <Button
                      onClick={() => setShowAddFabricator(true)}
                      variant='outline'
                      size='sm'
                    >
                      Add Fabricator
                    </Button>
                  )}
                </CardHeader>

                {canManageFabricators && showAddFabricator && (
                  <div className='p-4'>
                    <Label htmlFor='fabricator-select'>
                      Select Fabricator
                    </Label>
                    <select
                      id='fabricator-select'
                      value={newFabricatorId}
                      onChange={(e) => setNewFabricatorId(e.target.value)}
                      className='border rounded p-2'
                    >
                      <option value=''>--Choose a Fabricator--</option>
                      {users
                        .filter(
                          (user) =>
                            user.role === 'fabricator' &&
                            !editedProject.fabricatorIds.includes(user.id)
                        )
                        .map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                    </select>
                    <div className='mt-2 flex gap-2'>
                      <Button
                        onClick={handleAddFabricator}
                        disabled={!newFabricatorId}
                      >
                        Add
                      </Button>
                      <Button
                        variant='ghost'
                        onClick={() => {
                          setShowAddFabricator(false);
                          setNewFabricatorId('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* List fabricators */}
                <CardContent className='space-y-6'>
                  {/* Supervisor info */}
                  <div className='pb-4 border-b'>
                    <Label className='flex items-center gap-2 text-base mb-2'>
                      Supervisor
                    </Label>
                    {isEditing && currentUser.role === 'admin' ? (
                      <div className='space-y-2'>
                        <select
                          value={editedProject.supervisorId}
                          onChange={(e) =>
                            setEditedProject((prev) => ({
                              ...prev,
                              supervisorId: e.target.value
                            }))
                          }
                          className='w-full border rounded p-2'
                        >
                          {users
                            .filter((user) => user.role === 'supervisor')
                            .map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} - {user.school}
                              </option>
                            ))}
                        </select>
                      </div>
                    ) : (
                      <div className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg'>
                        <div className='w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center'>
                          S
                        </div>
                        <div>
                          <p className='font-medium'>
                            {getSupervisorName(project.supervisorId)}
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            Project Supervisor
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fabricators list */}
                  <div>
                    <Label className='flex items-center gap-2 text-base mb-3'>
                      Fabricators ({project.fabricatorIds.length})
                    </Label>
                    <div className='space-y-3'>
                      {project.fabricatorIds.map((fabId, index) => {
                        const fabricator = users.find((u) => u.id === fabId);
                        const fabricatorBudget =
                          project.fabricatorBudgets?.find(
                            (fb) => fb.fabricatorId === fabId
                          );
                        const hasRevenue =
                          fabricatorBudget &&
                          fabricatorBudget.allocatedRevenue > 0;

                        return (
                          <div
                            key={fabId}
                            className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'
                          >
                            <div className='flex items-center gap-3'>
                              <div className='w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center'>
                                {index + 1}
                              </div>
                              <div>
                                <p className='font-medium'>
                                  {fabricator?.name || 'Unknown'}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                  {fabricator?.secureId}
                                </p>
                              </div>
                            </div>
                            {hasRevenue &&
                              (currentUser.role === 'admin' ||
                                currentUser.role === 'supervisor') && (
                                <Badge variant='outline' className='gap-1'>
                                  <DollarSign className='h-3 w-3' />
                                  ₱
                                  {
                                    fabricatorBudget.allocatedRevenue.toLocaleString()
                                  } revenue
                                </Badge>
                              )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value='revenue' className='space-y-6'>
              <FabricatorRevenueManager
                project={project}
                users={users}
                currentUser={currentUser}
                onUpdateProject={onUpdateProject}
              />
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value='files' className='space-y-6'>
              {canUploadFiles && (
                <ProjectFileUpload
                  projectId={project.id}
                  currentUserId={currentUser.id}
                  onFilesUploaded={handleFilesUploaded}
                />
              )}

              {project.attachments && project.attachments.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <FileText className='h-5 w-5' />
                      Project Files ({project.attachments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2'>
                      {project.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between p-3 bg-muted rounded'
                        >
                          <div className='flex items-center gap-3'>
                            <FileText className='h-4 w-4' />
                            <div>
                              <p className='font-medium'>{attachment.name}</p>
                              <p className='text-sm text-muted-foreground'>
                                {formatFileSize(attachment.size)} •
                                Uploaded{' '}
                                {new Date(
                                  attachment.uploadedAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button variant='ghost' size='sm'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                !canEdit && (
                  <Card>
                    <CardContent className='py-12'>
                      <div className='text-center'>
                        <FileText className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                        <h3 className='text-lg mb-2'>No files uploaded</h3>
                        <p className='text-muted-foreground'>
                          No files have been uploaded to this project yet.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              )}
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value='documentation' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Link className='h-5 w-5' />
                    Google Drive Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {isEditing ? (
                    <div className='space-y-2'>
                      <Label htmlFor='docs-url'>Documentation URL</Label>
                      <Input
                        id='docs-url'
                        value={editedProject.documentationUrl || ''}
                        onChange={(e) =>
                          handleDocumentationUrlChange(e.target.value)
                        }
                        placeholder='https://drive.google.com/drive/folders/...'
                      />
                    </div>
                  ) : (
                    <>
                      {project.documentationUrl ? (
                        <div className='flex items-center justify-between p-4 bg-muted rounded-lg'>
                          <div className='flex items-center gap-3'>
                            <Link className='h-5 w-5 text-primary' />
                            <div>
                              <p className='font-medium'>Project Documentation</p>
                              <p className='text-sm text-muted-foreground'>
                                Google Drive folder with complete project
                                documentation
                              </p>
                            </div>
                          </div>
                          <Button variant='outline' asChild>
                            <a
                              href={project.documentationUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <ExternalLink className='h-4 w-4 mr-2' />
                              Open
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className='text-center py-8'>
                          <Link className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                          <h3 className='text-lg mb-2'>No documentation link</h3>
                          <p className='text-muted-foreground'>
                            No Google Drive documentation has been added to this
                            project.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation Guidelines</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>
                    The Google Drive folder should contain:
                  </p>
                  <ul className='text-sm text-muted-foreground space-y-1 ml-4'>
                    <li>• Project specifications and requirements</li>
                    <li>• Technical drawings and blueprints</li>
                    <li>• Material lists and supplier information</li>
                    <li>• Quality control checklists</li>
                    <li>• Progress reports and photos</li>
                    <li>• Client communication records</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
