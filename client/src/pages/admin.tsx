import React, { useState, useEffect } from "react";
import { 
  Users, 
  Anchor, 
  Ship, 
  Calendar, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Reply,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Star,
  Clock,
  FileText,
  BarChart3,
  Activity,
  CreditCard,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authManager } from "@/lib/auth";
import Navigation from "@/components/navigation";

interface User {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface Owner {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  status: string;
  createdAt: string;
}

interface OwnerRequest {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  governmentId: string;
  governmentIdNum?: string | null;
  dateOfBirth: string;
  businessName: string;
  boatName: string;
  boatType: string;
  boatLength: number;
  boatCapacity: number;
  registrationNumber: string;
  hullIdentificationNumber: string;
  stateOfRegistration: string;
  insuranceDetails: string;
  dailyRate: string;
  purpose: string;
  businessLicense?: string | null;
  insuranceCertificate?: string | null;
  marinaLocation?: string | null;
  description?: string | null;
  status: string;
  createdAt: string;
}

interface Boat {
  id: number;
  name: string;
  type: string;
  dailyRate: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  ownerId: number;
}

interface Booking {
  id: number;
  userId: string;
  boatId: number;
  totalAmount: string;
  status: string;
  checkinDate: string;
  checkoutDate: string;
  guests: string;
  createdAt: string;
}

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerRequests, setOwnerRequests] = useState<OwnerRequest[]>([]);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedOwnerRequest, setSelectedOwnerRequest] = useState<OwnerRequest | null>(null);
  const [showOwnerRequestModal, setShowOwnerRequestModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const user = authManager.getUser();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      window.location.href = "/";
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, ownersRes, ownerRequestsRes, boatsRes, bookingsRes, contactsRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/owners", { headers }),
        fetch("/api/admin/owner-requests", { headers }),
        fetch("/api/admin/boats", { headers }),
        fetch("/api/admin/bookings", { headers }),
        fetch("/api/admin/contacts", { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (ownersRes.ok) setOwners(await ownersRes.json());
      if (ownerRequestsRes.ok) setOwnerRequests(await ownerRequestsRes.json());
      if (boatsRes.ok) setBoats(await boatsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (contactsRes.ok) setContacts(await contactsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOwnerRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owner-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Request Approved",
          description: "Owner request has been approved and email sent",
        });
        fetchData();
      } else {
        throw new Error("Failed to approve request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve owner request",
        variant: "destructive",
      });
    }
  };

  const handleRejectOwnerRequest = async (requestId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owner-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Application rejected by admin" }),
      });

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "Owner request has been rejected and email sent",
        });
        fetchData();
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject owner request",
        variant: "destructive",
      });
    }
  };

  const handleRejectOwnerRequestWithReason = async () => {
    if (!selectedOwnerRequest || !declineReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/owner-requests/${selectedOwnerRequest.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: declineReason }),
      });

      if (response.ok) {
        toast({
          title: "Request Rejected",
          description: "Owner request has been rejected with reason and email sent",
        });
        setShowDeclineModal(false);
        setShowOwnerRequestModal(false);
        setSelectedOwnerRequest(null);
        setDeclineReason("");
        fetchData();
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject owner request",
        variant: "destructive",
      });
    }
  };

  const handleReplyToContact = async () => {
    if (!selectedContact || !replyMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/contacts/${selectedContact.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          replyMessage,
          customerEmail: selectedContact.email,
          customerName: `${selectedContact.firstName} ${selectedContact.lastName}`,
          originalSubject: selectedContact.subject,
        }),
      });

      if (response.ok) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the customer",
        });
        setShowReplyModal(false);
        setReplyMessage("");
        setSelectedContact(null);
        fetchData();
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    }
  };

  const updateContactStatus = async (contactId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/contacts/${contactId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: "Contact status has been updated",
        });
        fetchData();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contact status",
        variant: "destructive",
      });
    }
  };

  // Calculate statistics
  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
  const pendingRequests = ownerRequests.filter(r => r.status === "pending").length;
  const activeBoats = boats.filter(b => b.isActive).length;
  const newMessages = contacts.filter(c => c.status === "new").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Boat Owners",
      value: owners.length,
      icon: Anchor,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Requests",
      value: pendingRequests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Active Boats",
      value: activeBoats,
      icon: Ship,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "New Messages",
      value: newMessages,
      icon: Mail,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Confirmed Bookings",
      value: confirmedBookings,
      icon: CheckCircle,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    }
  ];

  const openOwnerRequestDetails = (request: OwnerRequest) => {
    setSelectedOwnerRequest(request);
    setShowOwnerRequestModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Boat Rental Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}! Here's your complete overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="flex items-center">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.color}`} />
                </div>
                <div className="ml-2 sm:ml-3 lg:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Recent Activity
              </h3>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="space-y-3 sm:space-y-4">
                {/* Recent Bookings */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Recent Bookings</h4>
                  <div className="space-y-2">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">Booking #{booking.id}</p>
                          <p className="text-xs text-gray-600">${booking.totalAmount}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Messages */}
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Recent Messages</h4>
                  <div className="space-y-2">
                    {contacts.slice(0, 3).map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-xs sm:text-sm font-medium">{contact.firstName} {contact.lastName}</p>
                          <p className="text-xs text-gray-600">{contact.subject}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          contact.status === "new" ? "bg-red-100 text-red-800" :
                          contact.status === "replied" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {contact.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200">
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Quick Actions
              </h3>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <button className="p-2 sm:p-3 lg:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-blue-900">Manage Users</p>
                </button>
                <button className="p-2 sm:p-3 lg:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Anchor className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-green-900">Review Requests</p>
                </button>
                <button className="p-2 sm:p-3 lg:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Ship className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-purple-900">Boat Management</p>
                </button>
                <button className="p-2 sm:p-3 lg:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm font-medium text-orange-900">View Bookings</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables Section */}
        <div className="space-y-6 sm:space-y-8">
          {/* Users Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">All Users ({users.length})</h3>
            </div>
            {/* Mobile view */}
            <div className="block sm:hidden">
              <div className="p-4 space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Phone:</span> {user.phone}
                      </div>
                      <div>
                        <span className="text-gray-600">Role:</span>
                        <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                          user.role === "admin" ? "bg-red-100 text-red-800" :
                          user.role === "owner" ? "bg-green-100 text-green-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.slice(0, 5).map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin" ? "bg-red-100 text-red-800" :
                          user.role === "owner" ? "bg-green-100 text-green-800" :
                          "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Owner Requests Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Owner Requests ({ownerRequests.length})</h3>
            </div>
            {/* Mobile view */}
            <div className="block sm:hidden">
              <div className="p-4 space-y-4">
                {ownerRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-50" onClick={() => openOwnerRequestDetails(request)}>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {request.firstName} {request.lastName}
                      </div>
                      <div className="text-xs text-gray-600">{request.businessName}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Boat:</span> {request.boatName}
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span> {request.boatType}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === "approved" ? "bg-green-100 text-green-800" :
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {request.status}
                      </span>
                      <div className="text-xs text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex space-x-2 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleApproveOwnerRequest(request.id)}
                          className="flex-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOwnerRequest(request);
                            setShowDeclineModal(true);
                          }}
                          className="flex-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ownerRequests.slice(0, 5).map((request) => (
                    <tr key={request.id} className="cursor-pointer hover:bg-gray-50" onClick={() => openOwnerRequestDetails(request)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.firstName} {request.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.businessName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.boatName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === "approved" ? "bg-green-100 text-green-800" :
                          request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        {request.status === "pending" && (
                          <>
                            <button 
                              onClick={() => handleApproveOwnerRequest(request.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedOwnerRequest(request);
                                setShowDeclineModal(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Boats Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Boats ({boats.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boats.slice(0, 5).map((boat) => (
                    <tr key={boat.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{boat.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{boat.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{boat.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${boat.dailyRate}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          boat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {boat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Bookings ({bookings.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{booking.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(booking.checkinDate).toLocaleDateString()} - {new Date(booking.checkoutDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Contact Messages Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Contact Messages ({contacts.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.slice(0, 5).map((contact) => (
                    <tr key={contact.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contact.status === "new" ? "bg-red-100 text-red-800" :
                          contact.status === "replied" ? "bg-green-100 text-green-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowReplyModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Reply className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => updateContactStatus(contact.id, contact.status === "new" ? "read" : "new")}
                          className="text-green-600 hover:text-green-900"
                        >
                          {contact.status === "new" ? <CheckCircle className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to {selectedContact.firstName} {selectedContact.lastName}</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2"><strong>Subject:</strong> {selectedContact.subject}</p>
                <p className="text-sm text-gray-600 mb-2"><strong>Original Message:</strong></p>
                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded">{selectedContact.message}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply:</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your reply here..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage("");
                    setSelectedContact(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplyToContact}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Request Details Modal */}
      {showOwnerRequestModal && selectedOwnerRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900">Owner Request Details</h3>
                <button
                  onClick={() => {
                    setShowOwnerRequestModal(false);
                    setSelectedOwnerRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Personal Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.firstName} {selectedOwnerRequest.lastName}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Email</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.email}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.phoneNumber}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Address</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.address}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Government ID</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.governmentId}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Government ID Number</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.governmentIdNum || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Date of Birth</label>
                    <p className="text-xs sm:text-sm text-gray-900">{new Date(selectedOwnerRequest.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Business & Boat Information */}
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 border-b pb-2">Business & Boat Information</h4>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Business Name</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.businessName}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Boat Name</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.boatName}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Boat Type</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.boatType}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Boat Length</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.boatLength} feet</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Boat Capacity</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.boatCapacity} passengers</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Registration Number</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Hull Identification Number</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.hullIdentificationNumber}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">State of Registration</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.stateOfRegistration}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Insurance Details</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.insuranceDetails}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Daily Rate</label>
                    <p className="text-xs sm:text-sm text-gray-900">${selectedOwnerRequest.dailyRate}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Purpose</label>
                    <p className="text-xs sm:text-sm text-gray-900">{selectedOwnerRequest.purpose}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOwnerRequest.status === "pending" && (
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                  <button
                    onClick={() => handleApproveOwnerRequest(selectedOwnerRequest.id)}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowDeclineModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Owner Request Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Owner Request</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection:</label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your reason here..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason("");
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectOwnerRequestWithReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
