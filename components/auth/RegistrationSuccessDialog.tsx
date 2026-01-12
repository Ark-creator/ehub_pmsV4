import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, Copy, User } from 'lucide-react';
import { User as UserType } from '../../types';

interface RegistrationSuccessDialogProps {
  isOpen: boolean;
  user: UserType | null;
  onClose: () => void;
  onContinue: () => void;
}

export function RegistrationSuccessDialog({
  isOpen,
  user,
  onClose,
  onContinue
}: RegistrationSuccessDialogProps) {
  const [countdown, setCountdown] = useState(10);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(10);
      setIsCopied(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onContinue]);

  const handleCopyId = async () => {
    if (user?.secureId) {
      try {
        await navigator.clipboard.writeText(user.secureId);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy ID:', err);
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-xl">Registration Successful!</DialogTitle>
          <DialogDescription>
            Welcome to Ehub Project Management. Your account has been created successfully.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Account Details</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Role:</span>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>

          {/* Login ID */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
            <div className="text-center">
              <h4 className="font-medium text-primary">Your Login ID</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Use this ID to login to your account
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="bg-background border rounded-md px-4 py-2 font-mono text-lg font-bold text-primary">
                {user.secureId}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyId}
                className="h-10"
              >
                <Copy className="h-4 w-4" />
                {isCopied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <strong>Important:</strong> Please save your Login ID ({user.secureId}) in a secure place.
              You'll need it to access your account.
            </p>
          </div>

          {/* Countdown and Action */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Automatically continuing in {countdown} seconds...
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={onContinue}
                className="flex-1"
              >
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}