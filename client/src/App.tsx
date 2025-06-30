import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './lib/stripe';
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import OwnerDashboard from "@/pages/owner-dashboard";
import BookingSuccess from "@/pages/booking-success";
import BookingCancelled from "@/pages/booking-cancelled";
import ResetPassword from "./pages/reset-password";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route path="/owner-dashboard" component={OwnerDashboard} />
      <Route path="/booking-success" component={BookingSuccess} />
      <Route path="/booking-cancelled" component={BookingCancelled} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Elements stripe={stripePromise}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </Elements>
    </QueryClientProvider>
  );
}

export default App;
