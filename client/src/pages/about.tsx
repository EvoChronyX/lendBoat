import React from "react";
import { Anchor, Users, Shield, Star, MapPin, Clock, Award, Heart } from "lucide-react";
import Navigation from "@/components/navigation";

export default function About() {
  const stats = [
    { number: "500+", label: "Happy Customers", icon: Users },
    { number: "50+", label: "Boat Owners", icon: Anchor },
    { number: "100+", label: "Destinations", icon: MapPin },
    { number: "24/7", label: "Support", icon: Clock },
  ];

  const values = [
    {
      icon: Shield,
      title: "Safety First",
      description: "All boats are thoroughly inspected and insured for your peace of mind."
    },
    {
      icon: Star,
      title: "Quality Experience",
      description: "We partner with experienced boat owners to ensure exceptional service."
    },
    {
      icon: Heart,
      title: "Customer Focused",
      description: "Your satisfaction is our priority with 24/7 customer support."
    },
    {
      icon: Award,
      title: "Trusted Platform",
      description: "Verified owners and secure payment processing for worry-free bookings."
    }
  ];

  const team = [
    {
      name: "Rohith S",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Passionate about making boat rentals accessible to everyone. Former marine engineer with 10+ years of experience."
    },
    {
      name: "Sarah Johnson",
      role: "Operations Director",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Expert in customer experience and platform operations. Dedicated to ensuring smooth sailing for all users."
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
      bio: "Tech enthusiast building the future of boat rentals. Focused on creating seamless digital experiences."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">lendBoat</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Connecting boat owners with adventure seekers to create unforgettable experiences on the water. 
              We're revolutionizing the way people access and enjoy boating experiences.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <stat.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe everyone should have the opportunity to explore the beauty of lakes, rivers, and oceans. 
                Our platform empowers boat owners to share their vessels while helping adventure seekers find the 
                perfect boat for any occasion.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From family fishing trips to romantic sunset cruises, corporate events to solo adventures, 
                we're here to make your water dreams a reality. With our secure platform, verified owners, 
                and comprehensive insurance, you can focus on creating memories that last a lifetime.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  Secure Bookings
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  Verified Owners
                </div>
                <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                  24/7 Support
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Boat on water" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-lg">
                <div className="text-2xl font-bold text-blue-600">5+ Years</div>
                <div className="text-gray-600">of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These principles guide everything we do and ensure the best experience for our community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <value.icon className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals behind lendBoat who are dedicated to making your boating dreams come true.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow duration-300">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Story
              </h2>
              <p className="text-lg mb-6 leading-relaxed opacity-90">
                lendBoat was born from a simple idea: making boat ownership and rental accessible to everyone. 
                Our founder, Rohith S, spent years working in the marine industry and saw the untapped potential 
                of connecting boat owners with people who wanted to experience the joy of being on the water.
              </p>
              <p className="text-lg mb-8 leading-relaxed opacity-90">
                What started as a small platform in Miami has grown into a nationwide community of boat enthusiasts. 
                Today, we're proud to serve thousands of customers and boat owners across the country, helping create 
                unforgettable memories on the water.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium">
                  Founded in 2019
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-medium">
                  Miami, FL
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80" 
                alt="Sunset sailing" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of happy customers who have discovered the joy of boating through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-300"
            >
              Browse Boats
            </a>
            <a 
              href="/contact" 
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-medium transition-colors duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 