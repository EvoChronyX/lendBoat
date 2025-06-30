import { useState, useEffect } from "react";
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
  capacity: number;
  length: number;
  createdAt: string;
}

interface SearchFilters {
  boatType: string;
  rating: string;
  popularity: string;
  purpose: string;
}

export default function FeaturedBoats() {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    boatType: "",
    rating: "",
    popularity: "",
    purpose: "",
  });
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

  const { data: searchResults, isLoading: isSearching } = useQuery<Boat[]>({
    queryKey: ["/api/boats/search", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchFilters.boatType) params.append('boatType', searchFilters.boatType);
      if (searchFilters.rating) params.append('rating', searchFilters.rating);
      if (searchFilters.popularity) params.append('popularity', searchFilters.popularity);
      if (searchFilters.purpose) params.append('purpose', searchFilters.purpose);
      
      const response = await fetch(`/api/boats/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to search boats");
      }
      return response.json();
    },
    enabled: !!(searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose),
  });

  // Listen for search events from hero section
  useEffect(() => {
    const handleSearch = (event: CustomEvent) => {
      setSearchFilters(event.detail);
    };

    const handleStorageChange = () => {
      const storedFilters = localStorage.getItem('boatSearchFilters');
      if (storedFilters) {
        setSearchFilters(JSON.parse(storedFilters));
      }
    };

    window.addEventListener('boatSearch', handleSearch as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Check for stored filters on mount
    const storedFilters = localStorage.getItem('boatSearchFilters');
    if (storedFilters) {
      setSearchFilters(JSON.parse(storedFilters));
    }

    return () => {
      window.removeEventListener('boatSearch', handleSearch as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    // Clear filters and show all boats
    setSearchFilters({
      boatType: "",
      rating: "",
      popularity: "",
      purpose: "",
    });
    localStorage.removeItem('boatSearchFilters');
  };

  const displayBoats = searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose 
    ? (searchResults || [])
    : (boats || []).slice(0, 6);

  const isLoadingData = isLoading || (isSearching && !!(searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose));

  if (isLoadingData) {
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose 
                ? "Search Results" 
                : "Featured Boats"
              }
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose 
                ? `Found ${displayBoats.length} boat${displayBoats.length !== 1 ? 's' : ''} matching your criteria`
                : "Discover our handpicked selection of premium vessels for unforgettable experiences"
              }
            </p>
          </div>

          {!displayBoats || displayBoats.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose 
                  ? "No boats found matching your search criteria."
                  : "No boats available at the moment."
                }
              </p>
              {(searchFilters.boatType || searchFilters.rating || searchFilters.popularity || searchFilters.purpose) && (
                <Button
                  onClick={handleViewAllBoats}
                  variant="outline"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-medium"
                >
                  View All Boats
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayBoats.map((boat) => (
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
