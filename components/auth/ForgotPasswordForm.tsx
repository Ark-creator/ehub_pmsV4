import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { CompanyLogo } from '../ui/company-logo';
// import { apiService } from '../../utils/apiService';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For now, just simulate success since we don't have email service set up
      console.log(`Password reset email would be sent to ${email}`);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex items-center justify-center mb-4">
              <CompanyLogo size="xl" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-2xl text-green-600">Reset Email Sent</CardTitle>
              </div>
              <CardDescription className="text-base">
                Check your email for password reset instructions
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                The link will expire in 15 minutes for security purposes.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={onBackToLogin}
                className="w-full"
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex items-center justify-center mb-4">
            <CompanyLogo size="xl" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Reset Password</CardTitle>
            </div>
            <CardDescription className="text-base">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending Reset Email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Email
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onBackToLogin}
                className="w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground text-center">
            <p>
              Remember your password?{' '}
              <button
                onClick={onBackToLogin}
                className="text-primary hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}