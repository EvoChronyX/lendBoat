import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X, Eye, EyeOff, Mail, Lock } from "lucide-react";

interface OwnerLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (owner: any, token: string) => void;
}

export default function OwnerLoginModal({ open, onClose, onSuccess }: OwnerLoginModalProps) {
  const [ownerId, setOwnerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordOwnerId, setForgotPasswordOwnerId] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: owner ID, 2: email
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId || !password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/owner-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: ownerId,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Login Successful",
          description: `Welcome, ${data.owner.businessName}!`,
        });
        onSuccess(data.owner, data.token);
        setOwnerId("");
        setPassword("");
      } else {
        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        } else {
          // Handle non-JSON responses (like HTML error pages)
          const errorText = await response.text();
          console.error("Non-JSON response:", errorText);
          throw new Error(`Server error (${response.status}): ${response.statusText}`);
        }
      }
    } catch (err: any) {
      console.error("Owner login error:", err);
      toast({
        title: "Login Failed",
        description: err.message || "Invalid credentials or server error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-900">Owner Login</DialogTitle>
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
              <Label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                Owner ID
              </Label>
              <Input
                id="ownerId"
                type="text"
                required
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="Enter your Owner ID"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
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
              Reset Owner Password
            </DialogTitle>
            <DialogDescription>
              {forgotPasswordStep === 1 
                ? "Enter your Owner ID to verify your account."
                : "Enter your email address to receive the password reset link."
              }
            </DialogDescription>
          </DialogHeader>

          {forgotPasswordStep === 1 ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!forgotPasswordOwnerId) {
                toast({
                  title: "Error",
                  description: "Please enter your Owner ID",
                  variant: "destructive",
                });
                return;
              }

              setForgotPasswordLoading(true);
              try {
                const response = await fetch("/api/auth/owner/verify-owner-id", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ ownerId: forgotPasswordOwnerId }),
                });

                if (response.ok) {
                  setForgotPasswordStep(2);
                } else {
                  // Check if response is JSON
                  const contentType = response.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Invalid Owner ID");
                  } else {
                    // Handle non-JSON responses
                    const errorText = await response.text();
                    console.error("Non-JSON response:", errorText);
                    throw new Error(`Server error (${response.status}): ${response.statusText}`);
                  }
                }
              } catch (error) {
                console.error("Verify owner ID error:", error);
                toast({
                  title: "Error",
                  description: error instanceof Error ? error.message : "Invalid Owner ID",
                  variant: "destructive",
                });
              } finally {
                setForgotPasswordLoading(false);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Owner ID
                  </Label>
                  <Input
                    id="ownerId"
                    type="text"
                    required
                    value={forgotPasswordOwnerId}
                    onChange={(e) => setForgotPasswordOwnerId(e.target.value)}
                    placeholder="Enter your Owner ID"
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? "Verifying..." : "Verify Owner ID"}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!forgotPasswordEmail) {
                toast({
                  title: "Error",
                  description: "Please enter your email address",
                  variant: "destructive",
                });
                return;
              }

              setForgotPasswordLoading(true);
              try {
                const response = await fetch("/api/auth/owner/forgot-password", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ 
                    email: forgotPasswordEmail,
                    ownerId: forgotPasswordOwnerId 
                  }),
                });

                if (response.ok) {
                  toast({
                    title: "Email Sent",
                    description: "Password reset email has been sent to your email address",
                  });
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordOwnerId("");
                  setForgotPasswordStep(1);
                } else {
                  // Check if response is JSON
                  const contentType = response.headers.get("content-type");
                  if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to send reset email");
                  } else {
                    // Handle non-JSON responses
                    const errorText = await response.text();
                    console.error("Non-JSON response:", errorText);
                    throw new Error(`Server error (${response.status}): ${response.statusText}`);
                  }
                }
              } catch (error) {
                console.error("Forgot password error:", error);
                toast({
                  title: "Error",
                  description: error instanceof Error ? error.message : "Failed to send reset email",
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
                    placeholder="owner@example.com"
                    className="w-full pl-10"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={forgotPasswordLoading}
                >
                  {forgotPasswordLoading ? "Sending..." : "Send Reset Email"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordStep(1);
                    setForgotPasswordEmail("");
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to Owner ID
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 