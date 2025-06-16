import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginModal({ open, onClose, onSwitchToSignup }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
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
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter your password"
              className="w-full"
            />
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
            <a href="#" className="text-sm text-primary hover:text-primary/80">
              Forgot password?
            </a>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
