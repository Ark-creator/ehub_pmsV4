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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  Shield,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { User } from "../../types";
import { mockUsers } from "../../data/mockData";
import { CompanyLogo } from "../ui/company-logo";
import { apiService } from "../../utils/apiService";

interface UserLoginFormProps {
  onLogin: (user: User) => void;
  onBackToMain: () => void;
}

export function UserLoginForm({
  onLogin,
  onBackToMain,
}: UserLoginFormProps) {
  const [supervisorData, setSupervisorData] = useState({
    email: "",
    password: "",
  });
  const [fabricatorData, setFabricatorData] = useState({
    email: "",
    password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    supervisor: false,
    fabricator: false,
  });
  const [errors, setErrors] = useState({
    supervisor: "",
    fabricator: "",
  });
  const [isLoading, setIsLoading] = useState({
    supervisor: false,
    fabricator: false,
  });

  const handleInputChange = (
    role: "supervisor" | "fabricator",
    field: string,
    value: string,
  ) => {
    if (role === "supervisor") {
      setSupervisorData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => ({ ...prev, supervisor: "" }));
    } else {
      setFabricatorData((prev) => ({
        ...prev,
        [field]: value,
      }));
      setErrors((prev) => ({ ...prev, fabricator: "" }));
    }
  };

  const handleSubmit = async (
    role: "supervisor" | "fabricator",
  ) => {
    const data =
      role === "supervisor" ? supervisorData : fabricatorData;

    setIsLoading((prev) => ({ ...prev, [role]: true }));
    setErrors((prev) => ({ ...prev, [role]: "" }));

    try {
      // Try API login first
      const response = await apiService.login(data.email, data.password);

      if (response.data) {
        // Set the token in the API service
        if (response.data.token) {
          apiService.setToken(response.data.token);
        }
        onLogin(response.data.user);
      } else {
        // If API fails, try demo mode as fallback
        const user = mockUsers.find(
          (u) =>
            u.role === role &&
            u.email === data.email &&
            u.password === data.password,
        );

        if (user) {
          onLogin(user);
        } else {
          throw new Error(response.error || 'Login failed');
        }
      }
    } catch (err) {
      // If API is completely unavailable, try demo mode
      const user = mockUsers.find(
        (u) =>
          u.role === role &&
          u.email === data.email &&
          u.password === data.password,
      );

      if (user) {
        onLogin(user);
      } else {
        setErrors((prev) => ({
          ...prev,
          [role]: err instanceof Error ? err.message : "Invalid email or password",
        }));
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, [role]: false }));
    }
  };

  const togglePasswordVisibility = (
    role: "supervisor" | "fabricator",
  ) => {
    setShowPasswords((prev) => ({
      ...prev,
      [role]: !prev[role],
    }));
  };

  // Get available users for demo
  const supervisors = mockUsers.filter(
    (u) => u.role === "supervisor",
  );
  const fabricators = mockUsers.filter(
    (u) => u.role === "fabricator",
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl floating"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl floating-delayed"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-2xl floating-delayed"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 hover-lift hover-glow animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center mb-4">
            <CompanyLogo size="xl" showText={false} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <UserIcon className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">User Login</CardTitle>
            </div>
            <CardDescription className="text-base">
              Login as Supervisor or Fabricator
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="supervisor" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="supervisor"
                className="flex items-center gap-2"
              >
                <Badge variant="default" className="text-xs">
                  SUP
                </Badge>
                Supervisor
              </TabsTrigger>
              <TabsTrigger
                value="fabricator"
                className="flex items-center gap-2"
              >
                <Badge variant="secondary" className="text-xs">
                  FAB
                </Badge>
                Fabricator
              </TabsTrigger>
            </TabsList>

            {/* Supervisor Login */}
            <TabsContent
              value="supervisor"
              className="space-y-4"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit("supervisor");
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="supervisor-email">
                    Email
                  </Label>
                  <Input
                    id="supervisor-email"
                    type="email"
                    placeholder="Enter supervisor email"
                    value={supervisorData.email}
                    onChange={(e) =>
                      handleInputChange(
                        "supervisor",
                        "email",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor-password">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="supervisor-password"
                      type={
                        showPasswords.supervisor
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password"
                      value={supervisorData.password}
                      onChange={(e) =>
                        handleInputChange(
                          "supervisor",
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
                      onClick={() =>
                        togglePasswordVisibility("supervisor")
                      }
                    >
                      {showPasswords.supervisor ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {errors.supervisor && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {errors.supervisor}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading.supervisor}
                >
                  {isLoading.supervisor ? (
                    <>
                      <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Login as Supervisor
                    </>
                  )}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground space-y-1 border-t pt-3">
                <p>
                  <strong>Demo Supervisors:</strong>
                </p>
                {supervisors.map((user) => (
                  <p key={user.id} className="text-xs">
                    {user.email} / {user.password}
                  </p>
                ))}
              </div>
            </TabsContent>

            {/* Fabricator Login */}
            <TabsContent
              value="fabricator"
              className="space-y-4"
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit("fabricator");
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fabricator-email">
                    Email
                  </Label>
                  <Input
                    id="fabricator-email"
                    type="email"
                    placeholder="Enter fabricator email"
                    value={fabricatorData.email}
                    onChange={(e) =>
                      handleInputChange(
                        "fabricator",
                        "email",
                        e.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fabricator-password">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="fabricator-password"
                      type={
                        showPasswords.fabricator
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter password"
                      value={fabricatorData.password}
                      onChange={(e) =>
                        handleInputChange(
                          "fabricator",
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
                      onClick={() =>
                        togglePasswordVisibility("fabricator")
                      }
                    >
                      {showPasswords.fabricator ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {errors.fabricator && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {errors.fabricator}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading.fabricator}
                >
                  {isLoading.fabricator ? (
                    <>
                      <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Login as Fabricator
                    </>
                  )}
                </Button>
              </form>

              <div className="text-sm text-muted-foreground space-y-1 border-t pt-3">
                <p>
                  <strong>Demo Fabricators:</strong>
                </p>
                {fabricators.map((user) => (
                  <p key={user.id} className="text-xs">
                    {user.email} / {user.password}
                  </p>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Button
            type="button"
            variant="outline"
            onClick={onBackToMain}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}