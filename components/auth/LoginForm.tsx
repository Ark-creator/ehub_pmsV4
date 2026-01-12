import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { Shield, UserPlus, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';
import { CompanyLogo } from '../ui/company-logo';
import { apiService } from '../../utils/apiService';
import { mapUserDataFromBackend } from '../../utils/userDataMapper';

interface LoginFormProps {
  onLogin: (user: User) => void;
  onShowSignup: () => void;
  onShowForgotPassword: () => void;
}

export function LoginForm({ onLogin, onShowSignup, onShowForgotPassword }: LoginFormProps) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if we're in demo mode (no proper Supabase setup)
      // Try API login first
      const response = await apiService.login(formData.identifier, formData.password);

      if (response.data) {
        // Set the token in the API service
        if (response.data.token) {
          apiService.setToken(response.data.token);
        }

        const rawUserData = response.data.user;
        const userData = mapUserDataFromBackend(rawUserData);
        onLogin(userData);
      } else {
        // If API fails, try demo mode as fallback
        if (formData.identifier.toLowerCase() === 'admin' && formData.password === 'password123') {
          const demoAdminUser = {
            id: 'admin-1',
            name: 'Demo Administrator',
            email: 'admin@ehub.com',
            role: 'admin' as const,
            school: 'Ehub University',
            phone: '+63 123 456 7890',
            gcashNumber: '09123456789',
            secureId: 'ADM001',
            employeeNumber: 'EMP001',
            isActive: true,
            createdAt: new Date().toISOString(),
            department: 'Administration'
          };
          onLogin(demoAdminUser);
          return;
        }
        if (formData.identifier.toLowerCase() === 'supervisor' && formData.password === 'password123') {
          const demoSupervisorUser = {
            id: 'supervisor-1',
            name: 'Demo Supervisor',
            email: 'supervisor@ehub.com',
            role: 'supervisor' as const,
            school: 'Ehub University',
            phone: '+63 987 654 3210',
            gcashNumber: '09987654321',
            secureId: 'SUP001',
            employeeNumber: 'EMP101',
            isActive: true,
            createdAt: new Date().toISOString(),
            department: 'Demo Department'
          };
          onLogin(demoSupervisorUser);
          return;
        }
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      // If API is completely unavailable, try demo mode
      if (formData.identifier.toLowerCase() === 'admin' && formData.password === 'password123') {
        const demoAdminUser = {
          id: 'admin-1',
          name: 'Demo Administrator',
          email: 'admin@ehub.com',
          role: 'admin' as const,
          school: 'Ehub University',
          phone: '+63 123 456 7890',
          gcashNumber: '09123456789',
          secureId: 'ADM001',
          employeeNumber: 'EMP001',
          isActive: true,
          createdAt: new Date().toISOString(),
          department: 'Administration'
        };
        onLogin(demoAdminUser);
        return;
      }
      if (formData.identifier.toLowerCase() === 'supervisor' && formData.password === 'password123') {
        const demoSupervisorUser = {
          id: 'supervisor-1',
          name: 'Demo Supervisor',
          email: 'supervisor@ehub.com',
          role: 'supervisor' as const,
          school: 'Ehub University',
          phone: '+63 987 654 3210',
          gcashNumber: '09987654321',
          secureId: 'SUP001',
          employeeNumber: 'EMP101',
          isActive: true,
          createdAt: new Date().toISOString(),
          department: 'Demo Department'
        };
        onLogin(demoSupervisorUser);
        return;
      }
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center mb-4">
            <CompanyLogo size="xl" showText={true} className="font-[Archivo_Black]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-[Archivo_Black]">Ehub Project Management</CardTitle>
            </div>
            <CardDescription className="text-base">
              Enter your credentials to access the system
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">Employee ID / Secure ID / Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your ID or email"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Use your Employee ID, Secure ID, or email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base bg-accent hover:bg-accent/90 font-[Archivo_Black]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              onClick={onShowForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                New Fabricator?
              </span>
            </div>
          </div>

          {/* Fabricator Signup */}
          <Button
            onClick={onShowSignup}
            variant="outline"
            className="w-full h-11"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Sign Up as Fabricator
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}