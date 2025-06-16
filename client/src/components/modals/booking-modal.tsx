import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authenticatedApiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface Boat {
  id: number;
  name: string;
  type: string;
  location: string;
  dailyRate: string;
  description: string;
  imageUrl?: string;
  rating: string;
  capacity: number;
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  boat: Boat | null;
}

export default function BookingModal({ open, onClose, boat }: BookingModalProps) {
  const [formData, setFormData] = useState({
    checkinDate: "",
    checkoutDate: "",
    guests: "",
    specialRequests: "",
  });

  const [pricing, setPricing] = useState({
    dailyRate: 0,
    days: 0,
    subtotal: 0,
    serviceFee: 0,
    total: 0,
  });

  const { toast } = useToast();

  // Calculate pricing when dates change
  useEffect(() => {
    if (boat && formData.checkinDate && formData.checkoutDate) {
      const checkin = new Date(formData.checkinDate);
      const checkout = new Date(formData.checkoutDate);
      const timeDiff = checkout.getTime() - checkin.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (days > 0) {
        const dailyRate = parseFloat(boat.dailyRate);
        const subtotal = dailyRate * days;
        const serviceFee = subtotal * 0.05; // 5% service fee
        const total = subtotal + serviceFee;

        setPricing({
          dailyRate,
          days,
          subtotal,
          serviceFee,
          total,
        });
      } else {
        setPricing({
          dailyRate: 0,
          days: 0,
          subtotal: 0,
          serviceFee: 0,
          total: 0,
        });
      }
    }
  }, [boat, formData.checkinDate, formData.checkoutDate]);

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!boat) throw new Error("No boat selected");

      const bookingData = {
        boatId: boat.id,
        checkinDate: new Date(formData.checkinDate).toISOString(),
        checkoutDate: new Date(formData.checkoutDate).toISOString(),
        guests: parseInt(formData.guests),
        totalAmount: pricing.total.toFixed(2),
        specialRequests: formData.specialRequests || null,
      };

      const response = await authenticatedApiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed!",
        description: "Check your email for confirmation details.",
      });
      onClose();
      setFormData({
        checkinDate: "",
        checkoutDate: "",
        guests: "",
        specialRequests: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!boat) {
      toast({
        title: "Error",
        description: "No boat selected",
        variant: "destructive",
      });
      return;
    }

    if (!formData.checkinDate || !formData.checkoutDate || !formData.guests) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const checkin = new Date(formData.checkinDate);
    const checkout = new Date(formData.checkoutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkin < today) {
      toast({
        title: "Invalid Date",
        description: "Check-in date cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    if (checkout <= checkin) {
      toast({
        title: "Invalid Date",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }

    const guests = parseInt(formData.guests);
    if (guests > boat.capacity) {
      toast({
        title: "Capacity Exceeded",
        description: `This boat can accommodate a maximum of ${boat.capacity} guests`,
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate();
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDayAfterTomorrowDate = () => {
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  };

  if (!boat) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">Book Your Adventure</DialogTitle>
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

        {/* Selected Boat Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
              <img
                src={boat.imageUrl || "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                alt={boat.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
                }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{boat.name}</h3>
              <p className="text-gray-600">{boat.location}</p>
              <p className="text-lg font-bold text-primary">${boat.dailyRate}/day</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkinDate" className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date
              </Label>
              <Input
                id="checkinDate"
                type="date"
                required
                min={getTomorrowDate()}
                value={formData.checkinDate}
                onChange={(e) => setFormData(prev => ({ ...prev, checkinDate: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="checkoutDate" className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date
              </Label>
              <Input
                id="checkoutDate"
                type="date"
                required
                min={formData.checkinDate || getDayAfterTomorrowDate()}
                value={formData.checkoutDate}
                onChange={(e) => setFormData(prev => ({ ...prev, checkoutDate: e.target.value }))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests
            </Label>
            <Select value={formData.guests} onValueChange={(value) => setFormData(prev => ({ ...prev, guests: value }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: boat.capacity }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} Guest{num > 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
              Special Requests
            </Label>
            <Textarea
              id="specialRequests"
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
              placeholder="Any special requirements or requests..."
              className="w-full"
            />
          </div>

          {/* Pricing Summary */}
          {pricing.days > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Daily Rate</span>
                <span className="font-medium">${pricing.dailyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Number of Days</span>
                <span className="font-medium">{pricing.days}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Service Fee (5%)</span>
                <span className="font-medium">${pricing.serviceFee.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={bookingMutation.isPending || pricing.days <= 0}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {bookingMutation.isPending ? "Confirming Booking..." : "Confirm Booking"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
