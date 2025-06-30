import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Home, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  Anchor,
  Star,
  Clock,
  Navigation,
  Waves,
  Sun,
  Wind,
  Compass,
  LifeBuoy,
  Wifi,
  Coffee,
  Music,
  Camera,
  Heart,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { authenticatedApiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface BookingDetails {
  id: number;
  boatId: number;
  checkinDate: string;
  checkoutDate: string;
  guests: number;
  totalAmount: string;
  specialRequests?: string;
  status: string;
  createdAt: string;
  boat: {
    id: number;
    name: string;
    type: string;
    location: string;
    dailyRate: string;
    description: string;
    imageUrl?: string;
    rating: string;
    capacity: number;
    ownerId: number;
    length?: number;
  };
  owner: {
    id: number;
    ownerId: string;
    businessName: string;
    phone?: string;
    email?: string;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function BookingSuccess() {
  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const sessionId = searchParams.get('session_id');
  const [, setLocation] = useLocation();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      fetchBookingDetails();
    }
  }, [sessionId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await authenticatedApiRequest("GET", `/api/bookings/latest?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data);
      } else {
        setError("Failed to fetch booking details");
      }
    } catch (err) {
      setError("Failed to fetch booking details");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    if (!bookingDetails) return;

    setDownloading(true);
    try {
      // Create a temporary div for the receipt content
      const receiptDiv = document.createElement('div');
      receiptDiv.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px; text-align: center; border-radius: 20px 20px 0 0;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 700;">🎉 Booking Confirmed!</h1>
            <p style="margin: 10px 0 0; font-size: 18px;">Your boat adventure awaits</p>
          </div>
          
          <div style="padding: 40px; background: white;">
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 600; color: #059669; margin-bottom: 20px;">📋 Booking Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Booking ID</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">#${bookingDetails.id}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Status</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${bookingDetails.status}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Check-in Date</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${new Date(bookingDetails.checkinDate).toLocaleDateString()}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Check-out Date</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${new Date(bookingDetails.checkoutDate).toLocaleDateString()}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Number of Guests</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${bookingDetails.guests}</div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-left: 4px solid #059669;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 500; margin-bottom: 5px;">Boarding Point</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${bookingDetails.boat.location}</div>
                </div>
              </div>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 24px; font-weight: 600; color: #059669; margin-bottom: 20px;">🚤 Boat Details</h2>
              <div style="background: #f0f9ff; padding: 20px; border-radius: 16px; border: 2px solid #0ea5e9;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                  <div>
                    <h3 style="font-size: 20px; font-weight: 600; color: #0ea5e9; margin-bottom: 10px;">${bookingDetails.boat.name}</h3>
                    <p style="font-size: 16px; color: #0369a1; margin-bottom: 15px;">${bookingDetails.boat.type}</p>
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                      <Star style="color: #f59e0b; width: 16px; height: 16px;" />
                      <span style="font-size: 14px; color: #0369a1;">${bookingDetails.boat.rating} Rating</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 10px;">
                      <Users style="color: #0ea5e9; width: 16px; height: 16px;" />
                      <span style="font-size: 14px; color: #0369a1;">Capacity: ${bookingDetails.boat.capacity} guests</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                      <MapPin style="color: #0ea5e9; width: 16px; height: 16px;" />
                      <span style="font-size: 14px; color: #0369a1;">${bookingDetails.boat.location}</span>
                    </div>
                  </div>
                  <div>
                    <h4 style="font-size: 16px; font-weight: 600; color: #0ea5e9; margin-bottom: 10px;">Boat Features</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                      <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">Navigation System</span>
                      <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">Safety Equipment</span>
                      <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">Comfortable Seating</span>
                      <span style="background: #e0f2fe; color: #0369a1; padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 500;">Professional Crew</span>
                    </div>
                  </div>
                </div>
                <p style="font-size: 14px; color: #0369a1; margin-top: 15px; line-height: 1.5;">${bookingDetails.boat.description}</p>
              </div>
            </div>

            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 30px; border-radius: 16px; text-align: center; border: 2px solid #059669; margin-bottom: 30px;">
              <h3 style="font-size: 20px; font-weight: 600; color: #059669; margin-bottom: 10px;">Total Amount</h3>
              <div style="font-size: 32px; font-weight: 700; color: #059669; margin-bottom: 10px;">$${bookingDetails.totalAmount}</div>
              <p style="font-size: 14px; color: #047857;">Payment completed successfully</p>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 16px; text-align: center; border: 2px solid #f59e0b; margin-bottom: 30px;">
              <h3 style="font-size: 20px; font-weight: 600; color: #92400e; margin-bottom: 10px;">🌟 Happy Journey!</h3>
              <p style="font-size: 18px; font-style: italic; color: #92400e; margin-bottom: 10px;">"The best boat is friendship."</p>
              <p style="font-size: 14px; color: #a16207; font-weight: 500;">- Unknown</p>
            </div>

            <div style="background: #f8fafc; padding: 30px; text-align: center; color: #64748b; border-radius: 0 0 20px 20px;">
              <h3 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 15px;">Need Help?</h3>
              <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                <div style="display: flex; align-items: center; gap: 5px;">
                  <Phone style="width: 16px; height: 16px;" />
                  <span style="font-size: 14px;">${bookingDetails.owner.phone || '+1-555-0123'}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                  <Mail style="width: 16px; height: 16px;" />
                  <span style="font-size: 14px;">${bookingDetails.owner.email || 'support@boatrentalpro.com'}</span>
                </div>
              </div>
              <p style="font-size: 12px; margin-top: 20px; color: #9ca3af;">&copy; 2025 BoatRentalPro. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;
      
      // Append to body temporarily
      document.body.appendChild(receiptDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(receiptDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`booking-receipt-${bookingDetails.id}.pdf`);
      
      toast({
        title: "Receipt Downloaded",
        description: "Your booking receipt has been downloaded as PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to generate PDF receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find your booking details. Please check your email for confirmation."}
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const checkinDate = new Date(bookingDetails.checkinDate).toLocaleDateString();
  const checkoutDate = new Date(bookingDetails.checkoutDate).toLocaleDateString();
  const bookingDate = new Date(bookingDetails.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full mb-4 sm:mb-6">
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            🎉 Booking Confirmed!
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Your boat adventure awaits. We've sent a confirmation email to your inbox.
          </p>
        </div>

        {bookingDetails && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Booking Information */}
            <Card className="border-2 border-green-200 bg-green-50/50">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-green-800 flex items-center">
                  📋 Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Booking ID</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">#{bookingDetails.id}</div>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Status</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900">{bookingDetails.status}</div>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Check-in Date</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(bookingDetails.checkinDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Check-out Date</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(bookingDetails.checkoutDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Number of Guests</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {bookingDetails.guests}
                    </div>
                  </div>
                  <div className="bg-white/80 p-3 sm:p-4 rounded-lg border border-green-200">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Boarding Point</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {bookingDetails.boat.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boat Details */}
            <Card className="border-2 border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-blue-800 flex items-center">
                  🚤 Boat Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <div className="bg-white/80 p-4 sm:p-6 rounded-lg border border-blue-200 mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-900 mb-2 sm:mb-3">{bookingDetails.boat.name}</h3>
                      <p className="text-sm sm:text-base text-blue-700 mb-3 sm:mb-4">{bookingDetails.boat.type}</p>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center text-sm sm:text-base text-blue-700">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 mr-2" />
                          {bookingDetails.boat.rating} Rating
                        </div>
                        <div className="flex items-center text-sm sm:text-base text-blue-700">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Capacity: {bookingDetails.boat.capacity} guests
                        </div>
                        <div className="flex items-center text-sm sm:text-base text-blue-700">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          {bookingDetails.boat.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="bg-white/80 p-4 sm:p-6 rounded-lg border border-blue-200">
                      <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 sm:mb-4">Boat Features</h4>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Anchor className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Navigation
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          WiFi
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Music className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Music System
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Photography
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Comfort
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-blue-700">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Safety
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-blue-700 mt-3 sm:mt-4 leading-relaxed">
                        {bookingDetails.boat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Amount */}
            <Card className="border-2 border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-800 mb-2 sm:mb-4">Total Amount</h3>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-900 mb-2 sm:mb-4 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 mr-2" />
                  {bookingDetails.totalAmount}
                </div>
                <p className="text-sm sm:text-base text-emerald-700">Payment completed successfully</p>
              </CardContent>
            </Card>

            {/* Happy Journey Quote */}
            <Card className="border-2 border-yellow-200 bg-yellow-50/50">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-yellow-800 mb-3 sm:mb-4">🌟 Happy Journey!</h3>
                <p className="text-base sm:text-lg lg:text-xl italic text-yellow-700 mb-2 sm:mb-3">
                  "The best boat is friendship."
                </p>
                <p className="text-sm sm:text-base text-yellow-600 font-medium">- Unknown</p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-2 border-gray-200 bg-gray-50/50">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Need Help?</h3>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6">
                  <div className="flex items-center text-sm sm:text-base text-gray-700">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {bookingDetails.owner.phone || '+1-555-0123'}
                  </div>
                  <div className="flex items-center text-sm sm:text-base text-gray-700">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    {bookingDetails.owner.email || 'support@boatrentalpro.com'}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
                  &copy; 2025 BoatRentalPro. All rights reserved.
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <Button 
                onClick={downloadReceipt} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt (PDF)
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 