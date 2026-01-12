import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
// import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Building,
  Calendar,
  DollarSign,
  Users,
  X
} from 'lucide-react';
import { Project, User } from '../../types';
import { CreateProjectForm } from '../projects/CreateProjectForm';
import { ProjectDetails } from '../projects/ProjectDetails';
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

interface AdminProjectsManagerProps {
  projects: Project[];
  users: User[];
  currentUser: User;
  onCreateProject: (project: Omit<Project, 'id'>) => void | Promise<void> | Promise<Project>;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

export function AdminProjectsManager({
  projects,
  users,
  currentUser,
  onCreateProject,
  onUpdateProject,
  onDeleteProject
}: AdminProjectsManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete.id);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '0_Created':
        return 'outline';
      case '1_Assigned_to_FAB':
        return 'secondary';
      case '2_Ready_for_Supervisor_Review':
      case '3_Ready_for_Admin_Review':
        return 'destructive';
      case '4_Ready_for_Client_Signoff':
        return 'default';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getSupervisorName = (supervisorId: string) => {
    const supervisor = users.find((u) => u.id === supervisorId);
    return supervisor?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Admin Projects Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and delete projects
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects by name, description, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge variant="outline">{project.priority}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectDetails(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(project)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {project.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Supervisor:</span>
                  <span>{getSupervisorName(project.supervisorId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Start:</span>
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">End:</span>
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Budget:</span>
                  <span>₱{project.budget.toLocaleString()}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg mb-2">No projects found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create your first project to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Project Form */}
      {showCreateForm && (
        <CreateProjectForm
          currentUser={currentUser}
          users={users}
          onCreateProject={onCreateProject}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* Project Details/Edit Modal */}
      {showProjectDetails && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          users={users}
          currentUser={currentUser}
          onUpdateProject={(updatedProject) => {
            onUpdateProject(updatedProject);
            setSelectedProject(updatedProject);
          }}
          onClose={() => {
            setShowProjectDetails(false);
            setSelectedProject(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action
              cannot be undone and will permanently remove the project and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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

