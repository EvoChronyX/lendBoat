import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authenticatedApiRequest, authManager } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, UserCheck, Clock, Anchor, Check, X, Eye } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface AdminStats {
  totalUsers: number;
  approvedOwners: number;
  pendingRequests: number;
  totalBoats: number;
}

interface OwnerRequest {
  id: number;
  businessName: string;
  ownerName: string;
  email: string;
  boatType: string;
  marinaLocation: string;
  dailyRate: string;
  createdAt: string;
  status: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");

  // Check if user is admin
  useEffect(() => {
    if (!authManager.isAuthenticated() || !authManager.isAdmin()) {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
    }
  }, [setLocation, toast]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/stats");
      return response.json();
    },
  });

  // Fetch pending requests
  const { data: pendingRequests, isLoading: requestsLoading } = useQuery<OwnerRequest[]>({
    queryKey: ["/api/admin/pending-requests"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/pending-requests");
      return response.json();
    },
  });

  // Approve owner mutation
  const approveOwnerMutation = useMutation({
    mutationFn: async (requestId: number) => {
      await authenticatedApiRequest("POST", `/api/admin/approve-owner/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Owner Approved",
        description: "Approval email sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject owner mutation
  const rejectOwnerMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: number; reason: string }) => {
      await authenticatedApiRequest("POST", `/api/admin/reject-owner/${requestId}`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Request Rejected",
        description: "Rejection email sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    authManager.logout();
    setLocation("/");
    toast({
      title: "Logged Out",
      description: "You have been logged out of the admin panel.",
    });
  };

  const handleApprove = (requestId: number) => {
    approveOwnerMutation.mutate(requestId);
  };

  const handleReject = (requestId: number) => {
    const reason = prompt("Please provide a reason for rejection (optional):");
    rejectOwnerMutation.mutate({ requestId, reason: reason || "" });
  };

  if (!authManager.isAuthenticated() || !authManager.isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-gray-800 text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? "..." : stats?.totalUsers || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <UserCheck className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Owners</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? "..." : stats?.approvedOwners || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <Clock className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? "..." : stats?.pendingRequests || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Anchor className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Boats</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {statsLoading ? "..." : stats?.totalBoats || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending Requests</TabsTrigger>
                <TabsTrigger value="users">All Users</TabsTrigger>
                <TabsTrigger value="owners">Boat Owners</TabsTrigger>
                <TabsTrigger value="boats">All Boats</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Owner Registration Requests</h3>
                  
                  {requestsLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-gray-600">Loading requests...</p>
                    </div>
                  ) : !pendingRequests || pendingRequests.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-gray-600">No pending requests</p>
                    </div>
                  ) : (
                    pendingRequests.map((request) => (
                      <Card key={request.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="text-lg font-medium text-gray-900">{request.businessName}</h4>
                                <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                                  Pending
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Applicant:</span> {request.ownerName}
                                </div>
                                <div>
                                  <span className="font-medium">Email:</span> {request.email}
                                </div>
                                <div>
                                  <span className="font-medium">Boat Type:</span> {request.boatType}
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span> {request.marinaLocation}
                                </div>
                                <div>
                                  <span className="font-medium">Applied:</span> {new Date(request.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Rate:</span> ${request.dailyRate}/day
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                disabled={approveOwnerMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <Check className="mr-1 h-4 w-4" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                disabled={rejectOwnerMutation.isPending}
                                variant="destructive"
                                size="sm"
                              >
                                <X className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">User management coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="owners" className="mt-6">
                <div className="text-center py-8">
                  <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">Owner management coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="boats" className="mt-6">
                <div className="text-center py-8">
                  <Anchor className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-gray-600">Boat management coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
