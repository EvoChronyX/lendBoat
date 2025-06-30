import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  boatType: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "Miami, FL",
    rating: 5,
    comment: "Absolutely incredible experience! The yacht was pristine and the service was top-notch. We celebrated our anniversary on the water and it was everything we dreamed of. Highly recommend!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    boatType: "Luxury Yacht"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "San Diego, CA",
    rating: 5,
    comment: "Perfect for our corporate team building event! The catamaran was spacious and comfortable for our group of 12. The captain was professional and the views were breathtaking. Will definitely book again!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    boatType: "Catamaran"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Key West, FL",
    rating: 5,
    comment: "Amazing fishing trip! The boat was well-equipped and our guide knew all the best spots. Caught more fish than we could count and had a fantastic day on the water. This platform made booking so easy!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    boatType: "Fishing Boat"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance testimonials every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers about their amazing boat rental experiences
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <Card className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                {/* Quote Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Quote className="h-8 w-8 text-primary" />
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-lg md:text-xl text-gray-700 mb-8 italic leading-relaxed">
                  "{testimonials[currentIndex].comment}"
                </blockquote>

                {/* Customer Info */}
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-600">{testimonials[currentIndex].location}</p>
                    <p className="text-sm text-primary font-medium">
                      Rented: {testimonials[currentIndex].boatType}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-primary scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">100+</div>
            <div className="text-gray-600">Boat Types</div>
          </div>
        </div>
      </div>
    </section>
  );
} 