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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { X, UserPlus, Shield } from "lucide-react";
import { User } from "../../types";
import {
  generateSecureId,
  generateEmployeeNumber,
} from "../../utils/secureId";
// import { apiService } from "../../utils/apiService";

interface SupervisorSignupFormProps {
  onSignup: (user: User) => void;
  onClose: () => void;
}

export function SupervisorSignupForm({
  onSignup,
  onClose,
}: SupervisorSignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const departments = [
    "Production",
    "Quality Control",
    "Operations",
    "Manufacturing",
    "Engineering",
    "Safety",
    "Maintenance",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+639|09)\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid Philippine phone number";
    }

    if (!formData.department) {
      newErrors.department = "Department selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // For now, create a local supervisor user since we don't have the supervisor endpoint yet
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: formData.name,
        email: formData.email.toLowerCase(),
        role: "supervisor",
        department: formData.department,
        school: formData.department,
        secureId: generateSecureId('supervisor'),
        employeeNumber: generateEmployeeNumber(),
        phone: formData.phone,
        password: formData.password, // Keep password in memory for this session
      };

      onSignup(newUser);
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Failed to create supervisor account'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              <CardTitle>Create Supervisor Account</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Add a new supervisor to the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter supervisor's full name"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange("name", e.target.value)
                }
                className={
                  errors.name ? "border-destructive" : ""
                }
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter supervisor's email"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                className={
                  errors.email ? "border-destructive" : ""
                }
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
                className={
                  errors.password ? "border-destructive" : ""
                }
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+639123456789 or 09123456789"
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange("phone", e.target.value)
                }
                className={
                  errors.phone ? "border-destructive" : ""
                }
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger
                  className={
                    errors.department
                      ? "border-destructive"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">
                  {errors.department}
                </p>
              )}
            </div>

            <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Account Information
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Role:
                  </span>
                  <Badge variant="default">Supervisor</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Secure ID:
                  </span>
                  <span className="font-mono text-xs">
                    Auto-generated
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Created by:
                  </span>
                  <span className="text-xs">Administrator</span>
                </div>
              </div>
            </div>

            {errors.submit && (
              <Alert variant="destructive">
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Supervisor
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}