import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X, Eye, EyeOff } from "lucide-react";

interface SignupModalProps {
  open: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupModal({ open, onClose, onSwitchToLogin }: SignupModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { toast } = useToast();

  const signupMutation = useMutation({
    mutationFn: async () => {
      return await authManager.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created",
        description: `Welcome to BoatRental, ${data.user.firstName}!`,
      });
      onClose();
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        agreeToTerms: false,
      });
    },
    onError: (error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Terms of Service and Privacy Policy",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    signupMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">Sign Up</DialogTitle>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
                className="w-full"
              />
            </div>
          </div>
          
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
              placeholder="john@example.com"
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
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
                placeholder="Minimum 8 characters"
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <a href="#" className="text-primary underline">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary underline">Privacy Policy</a>
            </Label>
          </div>
          
          <Button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {signupMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
