import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { authenticatedApiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface OwnerRegistrationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OwnerRegistrationModal({ open, onClose }: OwnerRegistrationModalProps) {
  const [formData, setFormData] = useState({
    businessName: "",
    taxId: "",
    businessLicense: null as File | null,
    insuranceCertificate: null as File | null,
    boatName: "",
    boatType: "",
    boatLength: "",
    boatCapacity: "",
    marinaLocation: "",
    dailyRate: "",
    description: "",
    agreeToTerms: false,
  });
  
  const { toast } = useToast();

  const ownerRegistrationMutation = useMutation({
    mutationFn: async () => {
      // For now, we'll submit without file uploads
      // In a real implementation, you'd handle file uploads to a cloud service
      const submitData = {
        businessName: formData.businessName,
        taxId: formData.taxId,
        businessLicense: formData.businessLicense?.name || "",
        insuranceCertificate: formData.insuranceCertificate?.name || "",
        boatName: formData.boatName,
        boatType: formData.boatType,
        boatLength: parseInt(formData.boatLength),
        boatCapacity: parseInt(formData.boatCapacity),
        marinaLocation: formData.marinaLocation,
        dailyRate: formData.dailyRate,
        description: formData.description,
      };
      
      const response = await authenticatedApiRequest("POST", "/api/owner-requests", submitData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your owner application has been submitted for review. You'll receive an email notification once it's processed.",
      });
      onClose();
      setFormData({
        businessName: "",
        taxId: "",
        businessLicense: null,
        insuranceCertificate: null,
        boatName: "",
        boatType: "",
        boatLength: "",
        boatCapacity: "",
        marinaLocation: "",
        dailyRate: "",
        description: "",
        agreeToTerms: false,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.taxId || !formData.boatName || !formData.boatType || 
        !formData.boatLength || !formData.boatCapacity || !formData.marinaLocation || 
        !formData.dailyRate || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Owner Terms of Service",
        variant: "destructive",
      });
      return;
    }

    ownerRegistrationMutation.mutate();
  };

  const handleFileChange = (field: 'businessLicense' | 'insuranceCertificate') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900">Become a Boat Owner</DialogTitle>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  placeholder="Your business name"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID
                </Label>
                <Input
                  id="taxId"
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                  placeholder="123-45-6789"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
                  Business License
                </Label>
                <Input
                  id="businessLicense"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange('businessLicense')}
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="insuranceCertificate" className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Certificate
                </Label>
                <Input
                  id="insuranceCertificate"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange('insuranceCertificate')}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Boat Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Initial Boat Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boatName" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Name
                </Label>
                <Input
                  id="boatName"
                  type="text"
                  required
                  value={formData.boatName}
                  onChange={(e) => setFormData(prev => ({ ...prev, boatName: e.target.value }))}
                  placeholder="Enter boat name"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="boatType" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Type
                </Label>
                <Select value={formData.boatType} onValueChange={(value) => setFormData(prev => ({ ...prev, boatType: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select boat type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yacht">Yacht</SelectItem>
                    <SelectItem value="fishing">Fishing Boat</SelectItem>
                    <SelectItem value="speedboat">Speedboat</SelectItem>
                    <SelectItem value="sailboat">Sailboat</SelectItem>
                    <SelectItem value="catamaran">Catamaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="boatLength" className="block text-sm font-medium text-gray-700 mb-2">
                  Length (ft)
                </Label>
                <Input
                  id="boatLength"
                  type="number"
                  required
                  value={formData.boatLength}
                  onChange={(e) => setFormData(prev => ({ ...prev, boatLength: e.target.value }))}
                  placeholder="30"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="boatCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </Label>
                <Input
                  id="boatCapacity"
                  type="number"
                  required
                  value={formData.boatCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, boatCapacity: e.target.value }))}
                  placeholder="8"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Location & Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marinaLocation" className="block text-sm font-medium text-gray-700 mb-2">
                  Marina Location
                </Label>
                <Input
                  id="marinaLocation"
                  type="text"
                  required
                  value={formData.marinaLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, marinaLocation: e.target.value }))}
                  placeholder="Miami Beach Marina"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate ($)
                </Label>
                <Input
                  id="dailyRate"
                  type="number"
                  required
                  value={formData.dailyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
                  placeholder="300"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Boat Description
            </Label>
            <Textarea
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your boat, amenities, and what makes it special..."
              className="w-full"
            />
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="ownerTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))}
              className="mt-1"
            />
            <Label htmlFor="ownerTerms" className="text-sm text-gray-600">
              I certify that all information provided is accurate and I agree to the{" "}
              <a href="#" className="text-primary underline">Owner Terms of Service</a>.
              I understand my application will be reviewed by our admin team.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={ownerRegistrationMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {ownerRegistrationMutation.isPending ? "Submitting Application..." : "Submit Owner Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
