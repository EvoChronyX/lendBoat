import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturedBoats from "@/components/featured-boats";
import Testimonials from "@/components/testimonials";
import { Anchor, Facebook, Twitter, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gray-50 font-sans">
      <Navigation />
      <HeroSection />
      <FeaturedBoats />
      <Testimonials />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Anchor className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">lendBoat</span>
              </div>
              <p className="text-gray-400 mb-4">Your premier destination for boat rentals and marine adventures.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Facebook className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Twitter className="text-xl" />
                </a>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  <Instagram className="text-xl" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#boats" className="text-gray-400 hover:text-white transition-colors">Browse Boats</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Become an Owner</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cancellation Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2 text-gray-400">
                <p className="flex items-center"><Phone className="mr-2 h-4 w-4" />+1 (555) 123-4567</p>
                <p className="flex items-center"><Mail className="mr-2 h-4 w-4" />support@lendboat.com</p>
                <p className="flex items-center"><MapPin className="mr-2 h-4 w-4" />123 Marina Blvd, Miami, FL</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 lendBoat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
