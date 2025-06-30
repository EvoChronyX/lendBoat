import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { XCircle, Home, ArrowLeft } from "lucide-react";

export default function BookingCancelled() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-gray-600">
            Your payment was cancelled and no booking was created.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2">What happened?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• You cancelled the payment process</div>
            <div>• No charges were made to your account</div>
            <div>• Your booking was not confirmed</div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
          
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
} 