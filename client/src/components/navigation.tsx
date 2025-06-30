import { useState } from "react";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/modals/login-modal";
import SignupModal from "@/components/modals/signup-modal";
import OwnerRequestModal from "@/components/modals/owner-registration-modal";
import AdminLoginModal from "@/components/modals/admin-login-modal";
import OwnerLoginModal from "@/components/modals/owner-login-modal";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Navigation() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showOwnerRequestModal, setShowOwnerRequestModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleOwnerRequest = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit an owner request",
        variant: "destructive",
      });
      setShowLoginModal(true);
      return;
    }
    setShowOwnerRequestModal(true);
  };

  const handleOwnerLoginSuccess = (owner: any, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("auth_user", JSON.stringify({ ...owner, role: "owner" }));
    setShowOwnerLoginModal(false);
    authManager.refreshAuthState();
    window.location.href = "/owner-dashboard";
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Anchor className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold text-gray-900">lendBoat</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
                <a href="/about" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">About</a>
                <a href="/contact" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
                {authManager.isOwner() && (
                  <a href="/owner-dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Owner Dashboard</a>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {!isAuthenticated ? (
                <>
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-primary hover:bg-primary/90 text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={() => setShowSignupModal(true)}
                    className="secondary-gradient text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-gray-700 text-sm hidden lg:block">
                    Welcome, {user?.firstName}!
                  </span>
                  {!authManager.isOwner() && (
                    <Button
                      variant="ghost"
                      onClick={handleOwnerRequest}
                      className="text-gray-700 hover:text-primary text-sm font-medium hidden lg:block"
                    >
                      Register as Owner
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
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-2 pt-2 pb-3 space-y-1">
            <a href="/" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors">Home</a>
            <a href="/about" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors">About</a>
            <a href="/contact" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors">Contact</a>
            {authManager.isOwner() && (
              <a href="/owner-dashboard" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors">Owner Dashboard</a>
            )}
            {authManager.isAdmin() && (
              <a href="/admin" className="block text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors">Admin Panel</a>
            )}
            {isAuthenticated && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Welcome, {user?.firstName}!
                  </div>
                  {!authManager.isOwner() && (
                    <button
                      onClick={handleOwnerRequest}
                      className="block w-full text-left text-gray-700 hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors"
                    >
                      Register as Owner
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowLoginModal(true);
                  }}
                  className="block w-full text-left bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSignupModal(true);
                  }}
                  className="block w-full text-left secondary-gradient text-white px-3 py-2 rounded-md text-base font-medium hover:opacity-90"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onSwitchToAdminLogin={() => {
          setShowLoginModal(false);
          setShowAdminModal(true);
        }}
        onSwitchToOwnerLogin={() => {
          setShowLoginModal(false);
          setShowOwnerLoginModal(true);
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
      
      <OwnerRequestModal 
        open={showOwnerRequestModal} 
        onClose={() => setShowOwnerRequestModal(false)} 
      />
      
      <AdminLoginModal 
        open={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />

      <OwnerLoginModal
        open={showOwnerLoginModal}
        onClose={() => setShowOwnerLoginModal(false)}
        onSuccess={handleOwnerLoginSuccess}
      />
    </>
  );
}
