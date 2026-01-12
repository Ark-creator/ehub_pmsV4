import { useState, FormEvent, KeyboardEvent } from "react";
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
import { Shield, LogIn, Loader2 } from "lucide-react";
import { CompanyLogo } from "../ui/company-logo";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export function MainLoginPortal() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter your credentials");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await signIn(identifier, password);

      if (signInError) {
        setError(signInError);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Fetch user profile to get role
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("role, name, is_active")
          .eq("auth_id", data.user.id)
          .single();

        if (profileError || !userProfile) {
          setError("Unable to load user profile");
          setLoading(false);
          return;
        }

        if (!userProfile.is_active) {
          setError("Your account has been deactivated. Contact administrator.");
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Redirect based on role
        switch (userProfile.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "supervisor":
            navigate("/supervisor/dashboard");
            break;
          case "fabricator":
            navigate("/fabricator/dashboard");
            break;
          case "client":
            navigate("/client/projects");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      const form = e.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-700">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <CompanyLogo className="h-20 w-20" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Ehub Project Management
          </CardTitle>
          <CardDescription className="text-base">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium">
                Employee ID / Secure ID / Email
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="admin@ehub.ph"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="h-11"
                autoComplete="username"
              />
              <p className="text-xs text-muted-foreground">
                Use your Employee ID, Secure ID, or email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-base"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full text-sm"
              onClick={() => navigate("/forgot-password")}
              disabled={loading}
            >
              Forgot your password?
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-muted-foreground mb-4">
              NEW FABRICATOR?
            </p>
            <Button
              variant="outline"
              className="w-full h-11"
              onClick={() => navigate("/signup-fabricator")}
              disabled={loading}
            >
              <Shield className="mr-2 h-5 w-5" />
              Sign Up as Fabricator
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
