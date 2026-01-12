import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { UserPlus, CheckCircle2, Copy, Eye, EyeOff } from 'lucide-react';
import { User, Project } from '../../types';
import { apiService } from '../../utils/apiService';

interface ClientCreationDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  onClientCreated: (client: User) => void;
}

export function ClientCreationDialog({ open, onClose, project, onClientCreated }: ClientCreationDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [createdClient, setCreatedClient] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const isAssigned = !!(project.clientName && project.clientName.trim().length > 0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phone && !/^(\+639|09)\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Philippine phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAssigned) {
      setErrors({ submit: 'A client is already assigned to this project.' });
      return;
    }
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.createClient({
        ...formData,
        projectId: project.id,
        projectName: project.name
      });

      if (response.data) {
        setCreatedClient(response.data);
        onClientCreated(response.data);
      } else {
        throw new Error(response.error || 'Failed to create client account');
      }
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create client account' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setErrors({});
    setCreatedClient(null);
    setShowPassword(false);
    onClose();
  };

  if (createdClient) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Client Account Created!</DialogTitle>
            <DialogDescription className="text-center">
              Client account has been successfully created for {project.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                An email with login credentials has been sent to <strong>{createdClient.email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <p className="text-sm">Client Login Credentials:</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Client ID</p>
                    <p className="font-mono text-sm">{createdClient.secureId}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(createdClient.secureId, 'secureId')}
                  >
                    {copiedField === 'secureId' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{createdClient.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(createdClient.email, 'email')}
                  >
                    {copiedField === 'email' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-2 bg-background rounded">
                  <div>
                    <p className="text-xs text-muted-foreground">Password</p>
                    <p className="font-mono text-sm">••••••••</p>
                  </div>
                  <span className="text-xs text-muted-foreground">As set</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Access Level:</strong> Client can view project documentation and progress reports only.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Client Account
          </DialogTitle>
          <DialogDescription>
            Create a client account for <strong>{project.name}</strong> to allow them to track progress and view documentation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isAssigned && (
            <Alert>
              <AlertDescription>
                A client is already assigned to this project ({project.clientName}). You cannot create another client.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              placeholder="Enter client's full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isAssigned}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isAssigned}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+639123456789 or 09123456789"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={errors.phone ? 'border-destructive' : ''}
              disabled={isAssigned}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a secure password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-destructive' : ''}
                disabled={isAssigned}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAssigned}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              The client will receive an email with their login credentials and can access project documentation and progress reports.
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || isAssigned}>
              {isAssigned ? (
                <>Client Assigned</>
              ) : isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Client
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
