import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface SearchFilters {
  boatType: string;
  rating: string;
  popularity: string;
  purpose: string;
}

export default function HeroSection() {
  const [searchData, setSearchData] = useState<SearchFilters>({
    boatType: "",
    rating: "",
    popularity: "",
    purpose: "",
  });

  const boatTypes = [
    "Yacht",
    "Fishing Boat",
    "Speedboat",
    "Catamaran",
    "Sailboat",
    "Pontoon Boat",
    "Jet Ski",
    "Houseboat",
    "Motorboat",
    "Trawler"
  ];

  const purposes = [
    "Party",
    "Business Meeting",
    "Travel",
    "Fishing",
    "Vacation",
    "Wedding",
    "Corporate Event",
    "Family Trip",
    "Romantic Getaway",
    "Adventure"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Store search filters in localStorage for the boats component to use
    localStorage.setItem('boatSearchFilters', JSON.stringify(searchData));
    
    // Scroll to boats section
    const boatsSection = document.getElementById("boats");
    if (boatsSection) {
      boatsSection.scrollIntoView({ behavior: "smooth" });
    }
    
    // Trigger a custom event to notify the boats component
    window.dispatchEvent(new CustomEvent('boatSearch', { detail: searchData }));
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
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-5xl mx-auto">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div>
                <Label htmlFor="boatType" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Type
                </Label>
                <Select
                  value={searchData.boatType}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, boatType: value }))}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900">
                    <SelectValue placeholder="Select boat type" />
                  </SelectTrigger>
                  <SelectContent>
                    {boatTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </Label>
                <Select
                  value={searchData.rating}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, rating: value }))}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highly-rated">Highly Rated (4.5+)</SelectItem>
                    <SelectItem value="top-rated">Top Rated (4.0+)</SelectItem>
                    <SelectItem value="well-rated">Well Rated (3.5+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="popularity" className="block text-sm font-medium text-gray-700 mb-2">
                  Popularity
                </Label>
                <Select
                  value={searchData.popularity}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, popularity: value }))}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900">
                    <SelectValue placeholder="Any popularity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-popular">Most Popular</SelectItem>
                    <SelectItem value="trending">Trending</SelectItem>
                    <SelectItem value="new">New Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </Label>
                <Select
                  value={searchData.purpose}
                  onValueChange={(value) => setSearchData(prev => ({ ...prev, purpose: value }))}
                >
                  <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-900">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
