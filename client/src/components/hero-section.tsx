import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

export default function HeroSection() {
  const [searchData, setSearchData] = useState({
    location: "",
    checkin: "",
    checkout: "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search data:", searchData);
  };

  return (
    <section className="relative hero-gradient text-white">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080"
          alt="Marina at sunset with luxury boats"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Perfect<br />
            <span className="text-orange-300">Boat Adventure</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Experience the freedom of the open water with our premium fleet of boats. From luxury yachts to fishing boats, find your perfect vessel.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="Where do you want to sail?"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="checkin" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </Label>
                <Input
                  id="checkin"
                  type="date"
                  value={searchData.checkin}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkin: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <Label htmlFor="checkout" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </Label>
                <Input
                  id="checkout"
                  type="date"
                  value={searchData.checkout}
                  onChange={(e) => setSearchData(prev => ({ ...prev, checkout: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900"
                />
              </div>
              <div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold text-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
