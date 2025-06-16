import { useState } from "react";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/modals/login-modal";
import SignupModal from "@/components/modals/signup-modal";
import OwnerRegistrationModal from "@/components/modals/owner-registration-modal";
import AdminLoginModal from "@/components/modals/admin-login-modal";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { toast } = useToast();

  const user = authManager.getUser();
  const isAuthenticated = authManager.isAuthenticated();

  const handleLogout = () => {
    authManager.logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleOwnerRegistration = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login first to register as an owner.",
        variant: "destructive",
      });
      setShowLoginModal(true);
      return;
    }
    setShowOwnerModal(true);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Anchor className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-gray-900">BoatRental</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#boats" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Boats</a>
                <a href="#about" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                <a href="#contact" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleOwnerRegistration}
                    className="text-gray-700 hover:text-primary text-sm font-medium"
                  >
                    Become an Owner
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdminModal(true)}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Admin
                  </Button>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setShowSignupModal(true)}
                    className="secondary-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-gray-700 text-sm">
                    Welcome, {user?.firstName}!
                  </span>
                  {!authManager.isOwner() && (
                    <Button
                      variant="ghost"
                      onClick={handleOwnerRegistration}
                      className="text-gray-700 hover:text-primary text-sm font-medium"
                    >
                      Become an Owner
                    </Button>
                  )}
                  {authManager.isAdmin() && (
                    <Button
                      variant="ghost"
                      onClick={() => window.location.href = '/admin'}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      Admin Panel
                    </Button>
                  )}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                  >
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      
      <SignupModal 
        open={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
      
      <OwnerRegistrationModal 
        open={showOwnerModal} 
        onClose={() => setShowOwnerModal(false)} 
      />
      
      <AdminLoginModal 
        open={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
    </>
  );
}
