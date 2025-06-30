import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      return await authManager.adminLogin(email, password);
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      onClose();
      setEmail("");
      setPassword("");
      // Redirect to admin page
      window.location.href = '/admin';
    },
    onError: (error) => {
      toast({
        title: "Admin Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    adminLoginMutation.mutate();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-900">Admin Login</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Email
              </Label>
              <Input
                id="adminEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@boatrental.com"
                className="w-full"
              />
            </div>
            
            <div>
              <Label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full admin-gradient text-white py-3 rounded-lg font-medium hover:opacity-90"
              disabled={adminLoginMutation.isPending}
            >
              {adminLoginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Reset Admin Password
            </DialogTitle>
            <DialogDescription>
              Enter your admin email and new password to reset your password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!forgotPasswordEmail || !newPassword || !confirmPassword) {
              toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
              });
              return;
            }

            if (newPassword !== confirmPassword) {
              toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
              });
              return;
            }

            if (newPassword.length < 6) {
              toast({
                title: "Error",
                description: "Password must be at least 6 characters long",
                variant: "destructive",
              });
              return;
            }

            setForgotPasswordLoading(true);
            try {
              const response = await fetch("/api/auth/admin/reset-password-direct", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                  email: forgotPasswordEmail,
                  newPassword: newPassword
                }),
              });

              if (response.ok) {
                toast({
                  title: "Success",
                  description: "Your password has been reset successfully. You can now log in with your new password.",
                });
                setShowForgotPassword(false);
                setForgotPasswordEmail("");
                setNewPassword("");
                setConfirmPassword("");
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to reset password");
              }
            } catch (error) {
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reset password",
                variant: "destructive",
              });
            } finally {
              setForgotPasswordLoading(false);
            }
          }}>
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="admin@boatrental.com"
                  className="w-full pl-10"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={forgotPasswordLoading}
              >
                {forgotPasswordLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
