import { useState } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Crown,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { User } from "../../types";
import { mockUsers } from "../../data/mockData";
import { CompanyLogo } from "../ui/company-logo";
import { apiService } from "../../utils/apiService";

interface AdminLoginFormProps {
  onLogin: (user: User) => void;
  onBackToMain: () => void;
}

export function AdminLoginForm({
  onLogin,
  onBackToMain,
}: AdminLoginFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Try API login first
      const response = await apiService.login(formData.username, formData.password);

      if (response.data) {
        // Set the token in the API service
        if (response.data.token) {
          apiService.setToken(response.data.token);
        }
        onLogin(response.data.user);
      } else {
        // If API fails, try demo mode as fallback
        if (formData.username === "admin" && formData.password === "password123") {
          const demoAdminUser = mockUsers.find(user => user.role === 'admin');
          if (demoAdminUser) {
            onLogin(demoAdminUser);
            return;
          }
        }
        throw new Error(response.error || 'Login failed');
      }
    } catch (err) {
      // If API is completely unavailable, try demo mode
      if (formData.username === "admin" && formData.password === "password123") {
        const demoAdminUser = mockUsers.find(user => user.role === 'admin');
        if (demoAdminUser) {
          onLogin(demoAdminUser);
          return;
        }
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
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl floating"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl floating-delayed"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-2xl floating"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-secondary/5 rounded-full blur-2xl floating-delayed"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 hover-lift hover-glow animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center mb-4">
            <CompanyLogo size="xl" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-accent" />
              <CardTitle className="text-2xl">
                Administrator Login
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Enter your administrator credentials
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) =>
                  handleInputChange("username", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange(
                      "password",
                      e.target.value,
                    )
                  }
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

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full btn-interactive hover-scale"
                variant="destructive"
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
                    Login as Administrator
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToMain}
                className="w-full hover-lift hover-glow"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Main Login
              </Button>
            </div>
          </form>

          <div className="text-sm text-muted-foreground text-center">
            <p className="text-sm text-muted-foreground text-center">
              Enter your admin credentials to access the system
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}