import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { X, Plus, CalendarIcon, Building, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Project, User } from '../../types';
// Removed embedded client creation dialog; it will be launched separately from the Projects page

interface CreateProjectFormProps {
  currentUser: User;
  users: User[];
  onCreateProject: (project: Omit<Project, 'id'>) => void | Promise<void> | Promise<Project>;
  onClose: () => void;
}

export function CreateProjectForm({ currentUser, users, onCreateProject, onClose }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Project['priority'],
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    supervisorId: '',
    fabricatorIds: [] as string[],
    fabricatorAllocation: '',
    materialsAllocation: '',
    supervisorAllocation: '',
    companyAllocation: '',
    totalProjectPrice: '',
    supervisorAssignsFabricators: false,
    broadcastToSupervisors: false, // New toggle state
    documentationUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const supervisors = users.filter(u => u.role === 'supervisor');
  const fabricators = users.filter(u => u.role === 'fabricator');

  useEffect(() => {
    const fabricator = parseFloat(formData.fabricatorAllocation) || 0;
    const materials = parseFloat(formData.materialsAllocation) || 0;
    const supervisor = parseFloat(formData.supervisorAllocation) || 0;
    const company = parseFloat(formData.companyAllocation) || 0;

    const total = fabricator + materials + supervisor + company;
    setFormData(prev => ({ ...prev, totalProjectPrice: total.toFixed(2) }));
  }, [
    formData.fabricatorAllocation,
    formData.materialsAllocation,
    formData.supervisorAllocation,
    formData.companyAllocation
  ]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    if (!formData.supervisorId && !formData.broadcastToSupervisors) {
      newErrors.supervisorId = 'Supervisor selection is required unless broadcasting to all';
    }

    if (!formData.supervisorAssignsFabricators && !formData.broadcastToSupervisors && formData.fabricatorIds.length === 0) {
      newErrors.fabricatorIds = 'At least one fabricator must be assigned or supervisor must assign manually';
    }

    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (
      (parseFloat(formData.fabricatorAllocation) || 0) < 0 ||
      (parseFloat(formData.materialsAllocation) || 0) < 0 ||
      (parseFloat(formData.supervisorAllocation) || 0) < 0 ||
      (parseFloat(formData.companyAllocation) || 0) < 0
    ) {
      newErrors.totalProjectPrice = 'Allocations must be zero or positive numbers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddFabricator = (fabricatorId: string) => {
    if (!formData.fabricatorIds.includes(fabricatorId)) {
      handleInputChange('fabricatorIds', [...formData.fabricatorIds, fabricatorId]);
    }
  };

  const handleRemoveFabricator = (fabricatorId: string) => {
    handleInputChange('fabricatorIds', formData.fabricatorIds.filter(id => id !== fabricatorId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const totalProjectPrice = parseFloat(formData.totalProjectPrice);

    const shouldSupervisorAssign = formData.supervisorAssignsFabricators;
    const initialStatus: Project['status'] = shouldSupervisorAssign ? '0_Created' : '1_Assigned_to_FAB';

    const newProject: Omit<Project, 'id'> = {
      name: formData.name,
      description: formData.description,
      clientName: '',
      status: initialStatus,
      priority: formData.priority,
      startDate: formData.startDate.toISOString().split('T')[0],
      endDate: formData.endDate.toISOString().split('T')[0],
      progress: 0,
      supervisorId: formData.supervisorId,
      fabricatorIds: formData.supervisorAssignsFabricators ? [] : formData.fabricatorIds,
      budget: totalProjectPrice,
      spent: 0,
      revenue: 0,
      documentationUrl: formData.documentationUrl || undefined,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      fabricatorBudgets: [],
      // @ts-ignore - Adding extra property handled by backend
      broadcastToSupervisors: formData.broadcastToSupervisors
    };

    await onCreateProject(newProject);
    onClose();
    try { window.location.hash = 'projects'; } catch { }
  };

  const getFabricatorName = (id: string) => {
    return users.find(u => u.id === id)?.name || 'Unknown';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Create New Project
            </CardTitle>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter project description"
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Project['priority']) => handleInputChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
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

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Timeline</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.startDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('startDate', date);
                            setShowStartCalendar(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.endDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('endDate', date);
                            setShowEndCalendar(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
                </div>
              </div>
            </div>

            {/* Team Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Team Assignment</h3>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor *</Label>
                <Select
                  value={formData.supervisorId}
                  onValueChange={(value) => handleInputChange('supervisorId', value)}
                >
                  <SelectTrigger className={errors.supervisorId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.name} - {supervisor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supervisorId && <p className="text-sm text-destructive">{errors.supervisorId}</p>}
              </div>

              {/* Broadcast to all supervisors toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="broadcastToSupervisors"
                  type="checkbox"
                  checked={formData.broadcastToSupervisors}
                  onChange={(e) => {
                    handleInputChange('broadcastToSupervisors', e.target.checked);
                    // If broadcasting, we might clear specific supervisor or keep it as preferred?
                    // Let's keep it simply separate.
                    if (e.target.checked) {
                      handleInputChange('supervisorId', '');
                    }
                  }}
                  className="cursor-pointer h-4 w-4"
                />
                <Label htmlFor="broadcastToSupervisors" className="cursor-pointer font-medium">
                  Send to all active supervisors
                </Label>
              </div>
              {formData.broadcastToSupervisors && (
                <Alert>
                  <AlertDescription>
                    All supervisors will be notified. The first to accept will be assigned.
                  </AlertDescription>
                </Alert>
              )}

              {/* Supervisor assigns fabricators manually toggle */}
              <div className="flex items-center space-x-2">
                <input
                  id="supervisorAssignsFabricators"
                  type="checkbox"
                  checked={formData.supervisorAssignsFabricators}
                  onChange={(e) => handleInputChange('supervisorAssignsFabricators', e.target.checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="supervisorAssignsFabricators" className="cursor-pointer">
                  Supervisor will assign fabricators manually
                </Label>
              </div>
              {formData.supervisorAssignsFabricators && (
                <Alert>
                  <AlertDescription>
                    You can assign fabricators later from the project card using the Assign action.
                  </AlertDescription>
                </Alert>
              )}

              {/* Fabricators selection disabled if supervisor assigns manually or broadcasting */}
              {!formData.supervisorAssignsFabricators && !formData.broadcastToSupervisors && (
                <div className="space-y-2">
                  <Label>Fabricators *</Label>
                  <Select onValueChange={handleAddFabricator}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add fabricators" />
                    </SelectTrigger>
                    <SelectContent>
                      {fabricators
                        .filter(fab => !formData.fabricatorIds.includes(fab.id))
                        .map(fabricator => (
                          <SelectItem key={fabricator.id} value={fabricator.id}>
                            {fabricator.name} - {fabricator.department}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  {formData.fabricatorIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.fabricatorIds.map(id => (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                          {getFabricatorName(id)}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveFabricator(id)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {errors.fabricatorIds && <p className="text-sm text-destructive">{errors.fabricatorIds}</p>}
                </div>
              )}
            </div>

            {/* Financial Allocation */}
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <h3 className="text-lg font-medium">Financial Allocation</h3>
                <div className="text-sm text-muted-foreground">Total Project Price</div>
              </div>

              {/* Financial Overview Preview */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Budget</span>
                    </div>
                    <p className="text-2xl">₱{(parseFloat(formData.totalProjectPrice) || 0).toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Spent</span>
                    </div>
                    <p className="text-2xl">₱0</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Revenue</span>
                    </div>
                    <p className="text-2xl">₱0</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fabricatorAllocation">Fabricator Allocation (₱)</Label>
                  <Input
                    id="fabricatorAllocation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.fabricatorAllocation}
                    onChange={(e) => handleInputChange('fabricatorAllocation', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Labor costs allocated to fabricators.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialsAllocation">Materials Allocation (₱)</Label>
                  <Input
                    id="materialsAllocation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.materialsAllocation}
                    onChange={(e) => handleInputChange('materialsAllocation', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Expected material expenses.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisorAllocation">Supervisor Allocation (₱)</Label>
                  <Input
                    id="supervisorAllocation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.supervisorAllocation}
                    onChange={(e) => handleInputChange('supervisorAllocation', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Supervisor fees or overhead.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAllocation">Company Allocation (₱)</Label>
                  <Input
                    id="companyAllocation"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.companyAllocation}
                    onChange={(e) => handleInputChange('companyAllocation', e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground">Company margin and other costs.</p>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center justify-between">
                    <span>Total Project Price (₱)</span>
                    <span className="text-muted-foreground">Auto-calculated</span>
                  </Label>
                  <Input
                    readOnly
                    value={formData.totalProjectPrice}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Documentation */}
            <div className="space-y-4">
              <h3>Documentation (Optional)</h3>

              <div className="space-y-2">
                <Label htmlFor="documentationUrl">Google Drive Documentation URL</Label>
                <Input
                  id="documentationUrl"
                  type="url"
                  value={formData.documentationUrl}
                  onChange={(e) => handleInputChange('documentationUrl', e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please fix the errors above before submitting.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
