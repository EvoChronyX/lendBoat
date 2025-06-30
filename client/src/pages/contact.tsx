import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSubmitted(true);
        setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
        toast({
          title: "Message Sent!",
          description: "Thank you for contacting us. We'll get back to you soon!",
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      details: "support@lendboat.com",
      description: "We'll respond within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      details: "+1 (555) 123-4567",
      description: "Mon-Fri from 8am to 6pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      details: "123 Marina Blvd, Miami, FL",
      description: "Come say hello at our office"
    },
    {
      icon: Clock,
      title: "Support Hours",
      details: "24/7 Customer Support",
      description: "We're here when you need us"
    }
  ];

  const faqs = [
    {
      question: "How do I book a boat?",
      answer: "Browse our available boats, select your dates, and complete the booking process. You'll receive confirmation and boat details via email."
    },
    {
      question: "What if I need to cancel my booking?",
      answer: "Cancellation policies vary by boat owner. Check the specific boat's cancellation policy before booking. Most allow free cancellation up to 24 hours before."
    },
    {
      question: "Do I need a boating license?",
      answer: "Requirements vary by location and boat type. Some boats come with a captain, while others require a valid boating license. Check individual boat listings for details."
    },
    {
      question: "Is insurance included?",
      answer: "Yes, all bookings include basic insurance coverage. Additional coverage options are available during the booking process."
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We've received your message and will get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Get in <span className="text-blue-600">Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Have a question or need help? We're here to assist you with everything boat-related. 
              Reach out to us and we'll get back to you as soon as possible.
            </p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                <info.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                <p className="text-lg text-blue-600 font-medium mb-2">{info.details}</p>
                <p className="text-gray-600 text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours. 
                We're here to help with any questions about boat rentals, bookings, or our platform.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    required
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <p className="text-gray-600 mb-8">
                Find quick answers to common questions about our boat rental platform.
              </p>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="mt-8 bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Immediate Help?</h3>
                <p className="text-gray-600 mb-4">
                  For urgent matters or booking issues, please call us directly:
                </p>
                <a 
                  href="tel:+15551234567" 
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  +1 (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Our Office</h2>
            <p className="text-gray-600">
              Stop by our Miami office to meet the team and discuss your boating needs in person.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14384.8258068!2d-80.1917902!3d25.7616798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b6823afc4b85%3A0x96d2dd8bd5a0a0a0!2sMiami%2C%20FL!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="lendBoat Office Location"
              ></iframe>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">lendBoat Headquarters</h3>
              <p className="text-gray-600">123 Marina Blvd, Miami, FL 33139</p>
              <p className="text-gray-600">Open Monday - Friday, 8:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Boating Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Browse our selection of boats and start planning your next water adventure today.
          </p>
          <a 
            href="/" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-medium transition-colors duration-300 inline-block"
          >
            Browse Available Boats
          </a>
        </div>
      </section>
    </div>
  );
} 