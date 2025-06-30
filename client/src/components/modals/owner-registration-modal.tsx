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
import { authManager } from "@/lib/auth";
import { X } from "lucide-react";

interface OwnerRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function OwnerRequestModal({ open, onClose }: OwnerRequestModalProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    governmentId: "",
    governmentIdNum: "",
    dateOfBirth: "",
    businessName: "",
    boatName: "",
    boatType: "",
    boatLength: 0,
    boatCapacity: 0,
    registrationNumber: "",
    hullIdentificationNumber: "",
    stateOfRegistration: "",
    insuranceDetails: "",
    dailyRate: "",
    purpose: "",
    // Legacy fields
    taxId: "",
    businessLicense: "",
    insuranceCertificate: "",
    marinaLocation: "",
    description: "",
  });
  
  const { toast } = useToast();
  const user = authManager.getUser();

  const ownerRequestMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to submit an owner request");
      }

      const submitData = {
        userId: user.userId || user.id,
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        governmentId: formData.governmentId,
        governmentIdNum: formData.governmentIdNum,
        dateOfBirth: formData.dateOfBirth,
        // Business Information
        businessName: formData.businessName,
        // Boat Information
        boatName: formData.boatName,
        boatType: formData.boatType,
        boatLength: formData.boatLength,
        boatCapacity: formData.boatCapacity,
        registrationNumber: formData.registrationNumber,
        hullIdentificationNumber: formData.hullIdentificationNumber,
        stateOfRegistration: formData.stateOfRegistration,
        insuranceDetails: formData.insuranceDetails,
        dailyRate: formData.dailyRate,
        purpose: formData.purpose,
        // Legacy fields
        taxId: formData.taxId,
        businessLicense: formData.businessLicense,
        insuranceCertificate: formData.insuranceCertificate,
        marinaLocation: formData.marinaLocation,
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
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        address: "",
        governmentId: "",
        governmentIdNum: "",
        dateOfBirth: "",
        businessName: "",
        boatName: "",
        boatType: "",
        boatLength: 0,
        boatCapacity: 0,
        registrationNumber: "",
        hullIdentificationNumber: "",
        stateOfRegistration: "",
        insuranceDetails: "",
        dailyRate: "",
        purpose: "",
        taxId: "",
        businessLicense: "",
        insuranceCertificate: "",
        marinaLocation: "",
        description: "",
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
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit an owner request",
        variant: "destructive",
      });
      return;
    }
    
    // Validate all required fields
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phoneNumber', 'address', 'governmentId', 
      'dateOfBirth', 'businessName', 'boatName', 'boatType', 'boatLength', 
      'boatCapacity', 'registrationNumber', 'hullIdentificationNumber', 
      'stateOfRegistration', 'insuranceDetails', 'dailyRate', 'purpose'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    ownerRequestMutation.mutate();
  };

  // If user is not authenticated, show a message
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-bold text-gray-900">Owner Request</DialogTitle>
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
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You must be logged in to submit an owner request.
            </p>
            <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
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
          <p className="text-gray-600 mt-2">
            Welcome, {user?.firstName}! Please fill out the form below to apply to become a boat owner.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Enter your first name"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Enter your last name"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your full address"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="governmentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID *
                </Label>
                <Input
                  id="governmentId"
                  type="text"
                  required
                  value={formData.governmentId}
                  onChange={(e) => setFormData(prev => ({ ...prev, governmentId: e.target.value }))}
                  placeholder="Driver's License, Passport, etc."
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="governmentIdNum" className="block text-sm font-medium text-gray-700 mb-2">
                  Government ID Number *
                </Label>
                <Input
                  id="governmentIdNum"
                  type="text"
                  required
                  value={formData.governmentIdNum}
                  onChange={(e) => setFormData(prev => ({ ...prev, governmentIdNum: e.target.value }))}
                  placeholder="Enter government ID number"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
            <div>
              <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </Label>
              <Input
                id="businessName"
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="Enter your business name"
                className="w-full"
              />
            </div>
          </div>

          {/* Boat Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Boat Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boatName" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Name *
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
                  Boat Type *
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
                    <SelectItem value="pontoon">Pontoon</SelectItem>
                    <SelectItem value="cabin-cruiser">Cabin Cruiser</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="boatLength" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Length (feet) *
                </Label>
                <Input
                  id="boatLength"
                  type="number"
                  required
                  value={formData.boatLength}
                  onChange={(e) => setFormData(prev => ({ ...prev, boatLength: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="boatCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Boat Capacity *
                </Label>
                <Input
                  id="boatCapacity"
                  type="number"
                  required
                  value={formData.boatCapacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, boatCapacity: parseInt(e.target.value) || 0 }))}
                  placeholder="8"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Number *
                </Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="Enter boat registration number"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="hullIdentificationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Hull Identification Number *
                </Label>
                <Input
                  id="hullIdentificationNumber"
                  type="text"
                  required
                  value={formData.hullIdentificationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, hullIdentificationNumber: e.target.value }))}
                  placeholder="Enter HIN"
                  className="w-full"
                />
              </div>
              <div>
                <Label htmlFor="stateOfRegistration" className="block text-sm font-medium text-gray-700 mb-2">
                  State of Registration *
                </Label>
                <Select value={formData.stateOfRegistration} onValueChange={(value) => setFormData(prev => ({ ...prev, stateOfRegistration: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AL">Alabama</SelectItem>
                    <SelectItem value="AK">Alaska</SelectItem>
                    <SelectItem value="AZ">Arizona</SelectItem>
                    <SelectItem value="AR">Arkansas</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="CO">Colorado</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="DE">Delaware</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    <SelectItem value="GA">Georgia</SelectItem>
                    <SelectItem value="HI">Hawaii</SelectItem>
                    <SelectItem value="ID">Idaho</SelectItem>
                    <SelectItem value="IL">Illinois</SelectItem>
                    <SelectItem value="IN">Indiana</SelectItem>
                    <SelectItem value="IA">Iowa</SelectItem>
                    <SelectItem value="KS">Kansas</SelectItem>
                    <SelectItem value="KY">Kentucky</SelectItem>
                    <SelectItem value="LA">Louisiana</SelectItem>
                    <SelectItem value="ME">Maine</SelectItem>
                    <SelectItem value="MD">Maryland</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="MI">Michigan</SelectItem>
                    <SelectItem value="MN">Minnesota</SelectItem>
                    <SelectItem value="MS">Mississippi</SelectItem>
                    <SelectItem value="MO">Missouri</SelectItem>
                    <SelectItem value="MT">Montana</SelectItem>
                    <SelectItem value="NE">Nebraska</SelectItem>
                    <SelectItem value="NV">Nevada</SelectItem>
                    <SelectItem value="NH">New Hampshire</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
                    <SelectItem value="NM">New Mexico</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="NC">North Carolina</SelectItem>
                    <SelectItem value="ND">North Dakota</SelectItem>
                    <SelectItem value="OH">Ohio</SelectItem>
                    <SelectItem value="OK">Oklahoma</SelectItem>
                    <SelectItem value="OR">Oregon</SelectItem>
                    <SelectItem value="PA">Pennsylvania</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="SC">South Carolina</SelectItem>
                    <SelectItem value="SD">South Dakota</SelectItem>
                    <SelectItem value="TN">Tennessee</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="UT">Utah</SelectItem>
                    <SelectItem value="VT">Vermont</SelectItem>
                    <SelectItem value="VA">Virginia</SelectItem>
                    <SelectItem value="WA">Washington</SelectItem>
                    <SelectItem value="WV">West Virginia</SelectItem>
                    <SelectItem value="WI">Wisconsin</SelectItem>
                    <SelectItem value="WY">Wyoming</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dailyRate" className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Rate ($) *
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
            <div className="mt-4">
              <Label htmlFor="insuranceDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Details *
              </Label>
              <Textarea
                id="insuranceDetails"
                required
                rows={3}
                value={formData.insuranceDetails}
                onChange={(e) => setFormData(prev => ({ ...prev, insuranceDetails: e.target.value }))}
                placeholder="Provide details about your boat insurance coverage..."
                className="w-full"
              />
            </div>
            <div className="mt-4">
              <Label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Use *
              </Label>
              <Select value={formData.purpose} onValueChange={(value) => setFormData(prev => ({ ...prev, purpose: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recreational">Recreational</SelectItem>
                  <SelectItem value="fishing">Fishing</SelectItem>
                  <SelectItem value="sightseeing">Sightseeing</SelectItem>
                  <SelectItem value="events">Events/Parties</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Legacy Fields */}
          <div>
            <Label htmlFor="taxId" className="block text-sm font-medium text-gray-700 mb-2">
              Tax ID
            </Label>
            <Input
              id="taxId"
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
              placeholder="Enter tax ID (optional)"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="businessLicense" className="block text-sm font-medium text-gray-700 mb-2">
              Business License
            </Label>
            <Input
              id="businessLicense"
              type="text"
              value={formData.businessLicense}
              onChange={(e) => setFormData(prev => ({ ...prev, businessLicense: e.target.value }))}
              placeholder="Enter business license (optional)"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="insuranceCertificate" className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Certificate
            </Label>
            <Input
              id="insuranceCertificate"
              type="text"
              value={formData.insuranceCertificate}
              onChange={(e) => setFormData(prev => ({ ...prev, insuranceCertificate: e.target.value }))}
              placeholder="Enter insurance certificate (optional)"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="marinaLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Marina Location
            </Label>
            <Input
              id="marinaLocation"
              type="text"
              value={formData.marinaLocation}
              onChange={(e) => setFormData(prev => ({ ...prev, marinaLocation: e.target.value }))}
              placeholder="Enter marina location (optional)"
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter boat description (optional)"
              className="w-full"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={ownerRequestMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium"
          >
            {ownerRequestMutation.isPending ? "Submitting Application..." : "Submit Owner Application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
