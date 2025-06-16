import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BookingModal from "@/components/modals/booking-modal";
import { useToast } from "@/hooks/use-toast";
import { authManager } from "@/lib/auth";

interface Boat {
  id: number;
  name: string;
  type: string;
  location: string;
  dailyRate: string;
  description: string;
  imageUrl?: string;
  rating: string;
}

export default function FeaturedBoats() {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const { toast } = useToast();

  const { data: boats, isLoading } = useQuery<Boat[]>({
    queryKey: ["/api/boats"],
    queryFn: async () => {
      const response = await fetch("/api/boats");
      if (!response.ok) {
        throw new Error("Failed to fetch boats");
      }
      return response.json();
    },
  });

  const handleBooking = (boat: Boat) => {
    if (!authManager.isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to book a boat.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedBoat(boat);
    setShowBookingModal(true);
  };

  const handleViewAllBoats = () => {
    // Scroll to boats section or implement filtering
    const boatsSection = document.getElementById("boats");
    if (boatsSection) {
      boatsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <section id="boats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Boats</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover our handpicked selection of premium vessels for unforgettable experiences</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="boats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Boats</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Discover our handpicked selection of premium vessels for unforgettable experiences</p>
          </div>

          {!boats || boats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No boats available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {boats.slice(0, 6).map((boat) => (
                <Card key={boat.id} className="boat-card bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={boat.imageUrl || "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
                    alt={boat.name}
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
                    }}
                  />
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{boat.name}</h3>
                        <p className="text-gray-600">{boat.location}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="text-yellow-400 mr-1 h-4 w-4 fill-current" />
                        <span className="text-gray-700 font-medium">{boat.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{boat.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        ${boat.dailyRate}<span className="text-sm font-normal text-gray-500">/day</span>
                      </div>
                      <Button
                        onClick={() => handleBooking(boat)}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              onClick={handleViewAllBoats}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium"
            >
              View All Boats
            </Button>
          </div>
        </div>
      </section>

      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        boat={selectedBoat}
      />
    </>
  );
}
