import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const { toast } = useToast();

  const adminLoginMutation = useMutation({
    mutationFn: async () => {
      return await authManager.adminLogin(formData.email, formData.password);
    },
    onSuccess: (data) => {
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin dashboard.",
      });
      onClose();
      setFormData({ email: "", password: "" });
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
    if (!formData.email || !formData.password) {
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
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@boatrental.com"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </Label>
            <Input
              id="adminPassword"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter admin password"
              className="w-full"
            />
          </div>
          
          <Button
            type="submit"
            disabled={adminLoginMutation.isPending}
            className="w-full admin-gradient text-white py-3 rounded-lg font-medium hover:opacity-90"
          >
            {adminLoginMutation.isPending ? "Verifying..." : "Access Admin Panel"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
