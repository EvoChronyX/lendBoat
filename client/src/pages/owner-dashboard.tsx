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
  Upload,
  Settings,
  User,
  Building,
  Navigation as NavigationIcon,
  Shield,
  CalendarDays,
  DollarSign as DollarIcon,
  MapPin as LocationIcon,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authManager } from "@/lib/auth";
import Navigation from "@/components/navigation";

interface Owner {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  governmentId: string;
  governmentIdNum?: string;
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
  businessLicense?: string;
  insuranceCertificate?: string;
  marinaLocation?: string;
  description?: string;
  status: string;
  adminNotes?: string;
  ownerId: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Boat {
  id: number;
  ownerId: number;
  name: string;
  type: string;
  length: number;
  capacity: number;
  location: string;
  dailyRate: string;
  description: string;
  imageUrl: string;
  rating: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Booking {
  id: number;
  userId: string;
  boatId: number;
  checkinDate: string;
  checkoutDate: string;
  guests: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

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

export default function OwnerDashboard() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [boats, setBoats] = useState<Boat[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showUpdateBoatModal, setShowUpdateBoatModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Boat update form state
  const [updateBoatForm, setUpdateBoatForm] = useState({
    name: "",
    type: "",
    length: "",
    capacity: "",
    location: "",
    dailyRate: "",
    description: ""
  });

  const user = authManager.getUser();

  // Form states for boat upload
  const [boatForm, setBoatForm] = useState({
    name: "",
    type: "",
    length: "",
    capacity: "",
    location: "",
    dailyRate: "",
    description: "",
    imageUrl: ""
  });

  // Form states for owner info edit
  const [ownerForm, setOwnerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    businessName: "",
    marinaLocation: "",
    description: ""
  });

  useEffect(() => {
    if (!user || user.role !== "owner") {
      window.location.href = "/";
      return;
    }
    fetchOwnerData();
  }, [user]);

  const fetchOwnerData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch owner details, boats, and bookings
      const [ownerRes, boatsRes, bookingsRes] = await Promise.all([
        fetch("/api/owner/profile", { headers }),
        fetch("/api/owner/boats", { headers }),
        fetch("/api/owner/bookings", { headers })
      ]);

      if (ownerRes.ok) {
        const ownerData = await ownerRes.json();
        setOwner(ownerData);
        setOwnerForm({
          firstName: ownerData.firstName,
          lastName: ownerData.lastName,
          email: ownerData.email,
          phoneNumber: ownerData.phoneNumber,
          address: ownerData.address,
          businessName: ownerData.businessName,
          marinaLocation: ownerData.marinaLocation || "",
          description: ownerData.description || ""
        });
      }

      if (boatsRes.ok) setBoats(await boatsRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch (error) {
      console.error("Error fetching owner data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch owner data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getBoatImageUrl = (boatType: string): string => {
    const imageMap: { [key: string]: string } = {
      "Yacht": "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Catamaran": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Sailboat": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Motorboat": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Speedboat": "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Fishing Boat": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Pontoon Boat": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Jet Ski": "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Houseboat": "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "Trawler": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    };
    return imageMap[boatType] || imageMap["Motorboat"];
  };

  const handleBoatUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const imageUrl = getBoatImageUrl(boatForm.type);
      
      const response = await fetch("/api/owner/boats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...boatForm,
          imageUrl,
          length: parseInt(boatForm.length),
          capacity: parseInt(boatForm.capacity),
          dailyRate: parseFloat(boatForm.dailyRate).toFixed(2)
        }),
      });

      if (response.ok) {
        toast({
          title: "Boat Added",
          description: "New boat has been added successfully",
        });
        setShowUploadModal(false);
        setBoatForm({
          name: "",
          type: "",
          length: "",
          capacity: "",
          location: "",
          dailyRate: "",
          description: "",
          imageUrl: ""
        });
        fetchOwnerData();
      } else {
        throw new Error("Failed to add boat");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add boat",
        variant: "destructive",
      });
    }
  };

  const handleOwnerUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/owner/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ownerForm),
      });

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully",
        });
        setShowEditModal(false);
        fetchOwnerData();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleReplyToBooking = async () => {
    if (!selectedBooking || !replyMessage.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/owner/bookings/${selectedBooking.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          replyMessage,
          customerEmail: selectedBooking.user?.email || "",
          customerName: `${selectedBooking.user?.firstName || ""} ${selectedBooking.user?.lastName || ""}`,
          bookingId: selectedBooking.id,
          boatName: (selectedBooking as any).boat?.name || "",
        }),
      });

      if (response.ok) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the customer",
        });
        setShowReplyModal(false);
        setReplyMessage("");
        setSelectedBooking(null);
        fetchOwnerData();
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

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/owner/bookings/${bookingId}/status`, {
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
          description: "Booking status has been updated",
        });
        fetchOwnerData();
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBoat = async () => {
    if (!selectedBoat) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/owner/boats/${selectedBoat.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateBoatForm),
      });

      if (response.ok) {
        toast({
          title: "Boat Updated",
          description: "Boat information has been updated successfully",
        });
        setShowUpdateBoatModal(false);
        setSelectedBoat(null);
        setUpdateBoatForm({
          name: "",
          type: "",
          length: "",
          capacity: "",
          location: "",
          dailyRate: "",
          description: ""
        });
        fetchOwnerData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update boat");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update boat",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBoat = async (boatId: number) => {
    if (!confirm("Are you sure you want to delete this boat? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/owner/boats/${boatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Boat Deleted",
          description: "Boat has been deleted successfully",
        });
        fetchOwnerData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete boat");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete boat",
        variant: "destructive",
      });
    }
  };

  const openUpdateBoatModal = (boat: Boat) => {
    setSelectedBoat(boat);
    setUpdateBoatForm({
      name: boat.name,
      type: boat.type,
      length: boat.length.toString(),
      capacity: boat.capacity.toString(),
      location: boat.location,
      dailyRate: boat.dailyRate,
      description: boat.description || ""
    });
    setShowUpdateBoatModal(true);
  };

  // Calculate statistics
  const totalBoats = boats.length;
  const activeBoats = boats.filter(b => b.isActive).length;
  const bookedBoats = bookings.filter(b => b.status === "confirmed").length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
  const availableBoats = totalBoats - bookedBoats;

  const stats = [
    {
      title: "Total Boats",
      value: totalBoats,
      icon: Ship,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Boats",
      value: activeBoats,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Available Boats",
      value: availableBoats,
      icon: Anchor,
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
      title: "Pending Bookings",
      value: pendingBookings,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    }
  ];

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

  if (!owner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Owner Profile Not Found</h2>
            <p className="text-gray-600 mt-2">Please contact support if this is an error.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {owner.firstName}! Manage your boat rental business.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Business Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.businessName}</p>
                    <p className="text-sm text-gray-600">Business Name</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.firstName} {owner.lastName}</p>
                    <p className="text-sm text-gray-600">Owner Name</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.email}</p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.phoneNumber}</p>
                    <p className="text-sm text-gray-600">Phone</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.address}</p>
                    <p className="text-sm text-gray-600">Address</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{owner.status}</p>
                    <p className="text-sm text-gray-600">Status</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Edit Information
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Quick Actions
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Upload className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Upload Boat</p>
                </button>
                <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">View Bookings</p>
                </button>
                <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <Ship className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900">Manage Boats</p>
                </button>
                <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                  <Mail className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-orange-900">Messages</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Boats Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">My Boats ({boats.length})</h3>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Boat
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <div key={boat.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={boat.imageUrl} 
                    alt={boat.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-lg text-gray-900">{boat.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{boat.type}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><LocationIcon className="h-4 w-4 inline mr-1" />{boat.location}</p>
                      <p><DollarIcon className="h-4 w-4 inline mr-1" />${boat.dailyRate}/day</p>
                      <p><Info className="h-4 w-4 inline mr-1" />{boat.length}ft, {boat.capacity} guests</p>
                    </div>
                    <div className="mt-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        boat.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {boat.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Boats Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Boats ({boats.length})</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {boats.map((boat) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => openUpdateBoatModal(boat)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBoat(boat.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings ({bookings.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Boat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.slice(0, 10).map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.user?.firstName} {booking.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{booking.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {boats.find(b => b.id === booking.boatId)?.name || "Unknown Boat"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(booking.checkinDate).toLocaleDateString()}</div>
                      <div className="text-gray-600">to {new Date(booking.checkoutDate).toLocaleDateString()}</div>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowReplyModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      {booking.status === "pending" && (
                        <>
                          <button 
                            onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => updateBookingStatus(booking.id, "rejected")}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="h-4 w-4" />
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
      </div>

      {/* Upload Boat Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Boat</h3>
              <form onSubmit={handleBoatUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Boat Name</label>
                    <input
                      type="text"
                      value={boatForm.name}
                      onChange={(e) => setBoatForm({...boatForm, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Boat Type</label>
                    <select
                      value={boatForm.type}
                      onChange={(e) => setBoatForm({...boatForm, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="Yacht">Yacht</option>
                      <option value="Catamaran">Catamaran</option>
                      <option value="Sailboat">Sailboat</option>
                      <option value="Motorboat">Motorboat</option>
                      <option value="Speedboat">Speedboat</option>
                      <option value="Fishing Boat">Fishing Boat</option>
                      <option value="Pontoon Boat">Pontoon Boat</option>
                      <option value="Jet Ski">Jet Ski</option>
                      <option value="Houseboat">Houseboat</option>
                      <option value="Trawler">Trawler</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (ft)</label>
                    <input
                      type="number"
                      value={boatForm.length}
                      onChange={(e) => setBoatForm({...boatForm, length: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={boatForm.capacity}
                      onChange={(e) => setBoatForm({...boatForm, capacity: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={boatForm.location}
                      onChange={(e) => setBoatForm({...boatForm, location: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={boatForm.dailyRate}
                      onChange={(e) => setBoatForm({...boatForm, dailyRate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={boatForm.description}
                    onChange={(e) => setBoatForm({...boatForm, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Upload Boat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Owner Info Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Business Information</h3>
              <form onSubmit={handleOwnerUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={ownerForm.firstName}
                      onChange={(e) => setOwnerForm({...ownerForm, firstName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={ownerForm.lastName}
                      onChange={(e) => setOwnerForm({...ownerForm, lastName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm({...ownerForm, email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={ownerForm.phoneNumber}
                      onChange={(e) => setOwnerForm({...ownerForm, phoneNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={ownerForm.address}
                      onChange={(e) => setOwnerForm({...ownerForm, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={ownerForm.businessName}
                      onChange={(e) => setOwnerForm({...ownerForm, businessName: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marina Location</label>
                    <input
                      type="text"
                      value={ownerForm.marinaLocation}
                      onChange={(e) => setOwnerForm({...ownerForm, marinaLocation: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={ownerForm.description}
                    onChange={(e) => setOwnerForm({...ownerForm, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Information
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reply to Customer</h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Customer:</strong> {selectedBooking.user?.firstName} {selectedBooking.user?.lastName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Boat:</strong> {(selectedBooking as any).boat?.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Dates:</strong> {new Date(selectedBooking.checkinDate).toLocaleDateString()} - {new Date(selectedBooking.checkoutDate).toLocaleDateString()}
                </p>
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
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReplyToBooking}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Boat Modal */}
      {showUpdateBoatModal && selectedBoat && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Update Boat Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boat Name</label>
                  <input
                    type="text"
                    value={updateBoatForm.name}
                    onChange={(e) => setUpdateBoatForm({...updateBoatForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Boat name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Boat Type</label>
                  <select
                    value={updateBoatForm.type}
                    onChange={(e) => setUpdateBoatForm({...updateBoatForm, type: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select boat type</option>
                    <option value="Yacht">Yacht</option>
                    <option value="Motorboat">Motorboat</option>
                    <option value="Sailboat">Sailboat</option>
                    <option value="Catamaran">Catamaran</option>
                    <option value="Fishing Boat">Fishing Boat</option>
                    <option value="Speedboat">Speedboat</option>
                    <option value="Pontoon Boat">Pontoon Boat</option>
                    <option value="Jet Ski">Jet Ski</option>
                    <option value="Houseboat">Houseboat</option>
                    <option value="Trawler">Trawler</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (ft)</label>
                    <input
                      type="number"
                      value={updateBoatForm.length}
                      onChange={(e) => setUpdateBoatForm({...updateBoatForm, length: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Length"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                    <input
                      type="number"
                      value={updateBoatForm.capacity}
                      onChange={(e) => setUpdateBoatForm({...updateBoatForm, capacity: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Capacity"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={updateBoatForm.location}
                    onChange={(e) => setUpdateBoatForm({...updateBoatForm, location: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={updateBoatForm.dailyRate}
                    onChange={(e) => setUpdateBoatForm({...updateBoatForm, dailyRate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Daily rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={updateBoatForm.description}
                    onChange={(e) => setUpdateBoatForm({...updateBoatForm, description: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Boat description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUpdateBoatModal(false);
                    setSelectedBoat(null);
                    setUpdateBoatForm({
                      name: "",
                      type: "",
                      length: "",
                      capacity: "",
                      location: "",
                      dailyRate: "",
                      description: ""
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateBoat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Boat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 