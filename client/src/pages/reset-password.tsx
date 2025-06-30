import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import Navigation from "@/components/navigation";

export default function ResetPassword() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    // Parse URL parameters from location
    const urlParams = new URLSearchParams(location.split('?')[1]);
    const tokenParam = urlParams.get("token");
    const emailParam = urlParams.get("email");
    const typeParam = urlParams.get("type");

    if (!tokenParam || !emailParam || !typeParam) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or has expired.",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
    setType(typeParam);
  }, [location, setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
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

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token,
          newPassword,
          type,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Your password has been reset successfully. You can now log in with your new password.",
        });
        
        // Redirect based on account type
        if (type === "admin") {
          setLocation("/");
        } else if (type === "owner") {
          setLocation("/");
        } else {
          setLocation("/");
        }
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Reset Your Password
              </CardTitle>
              <CardDescription>
                Enter your new password below to complete the reset process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
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
                  disabled={loading}
                >
                  {loading ? "Resetting Password..." : "Reset Password"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setLocation("/")}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Home
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 