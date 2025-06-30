import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToAdminLogin: () => void;
  onSwitchToOwnerLogin: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToSignup, onSwitchToAdminLogin, onSwitchToOwnerLogin }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await authManager.login(formData.email, formData.password);
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.firstName}!`,
      });
      onClose();
      setFormData({ email: "", password: "", rememberMe: false });
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate();
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">Login</DialogTitle>
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
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter your password"
                className="w-full pr-10"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: !!checked }))}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>
            <button 
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-primary hover:text-primary/80"
            >
              Forgot password?
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up
            </button>
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={onSwitchToAdminLogin}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              Admin Login
            </button>
            <button
              onClick={onSwitchToOwnerLogin}
              className="text-primary hover:text-primary/80 font-medium text-sm"
            >
              Owner Login
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Forgot Password Modal */}
    <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Reset User Password
          </DialogTitle>
          <DialogDescription>
            Enter your email and new password to reset your password.
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
            const response = await fetch("/api/auth/user/reset-password-direct", {
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
                placeholder="user@example.com"
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
