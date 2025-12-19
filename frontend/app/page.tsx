"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, MapPin, Star, Shield, Clock, ChevronRight, Users, Briefcase, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "PLUMBER", label: "Plumber", icon: "🔧", description: "Fix leaks, installations & repairs" },
  { value: "ELECTRICIAN", label: "Electrician", icon: "⚡", description: "Wiring, repairs & installations" },
  { value: "CLEANER", label: "Cleaner", icon: "🧹", description: "Home & office cleaning services" },
  { value: "TUTOR", label: "Tutor", icon: "📚", description: "Academic & professional tutoring" },
  { value: "TECHNICIAN", label: "Technician", icon: "💻", description: "Computer & device repairs" },
  { value: "CARPENTER", label: "Carpenter", icon: "🪚", description: "Furniture & woodwork" },
  { value: "PAINTER", label: "Painter", icon: "🎨", description: "Interior & exterior painting" },
  { value: "GARDENER", label: "Gardener", icon: "🌱", description: "Garden & lawn maintenance" },
];

const stats = [
  { icon: Users, value: "10,000+", label: "Happy Customers" },
  { icon: Briefcase, value: "2,500+", label: "Service Providers" },
  { icon: CheckCircle2, value: "50,000+", label: "Jobs Completed" },
  { icon: Star, value: "4.8", label: "Average Rating" },
];

const features = [
  {
    icon: Shield,
    title: "Verified Providers",
    description: "All service providers are thoroughly vetted and verified for your safety.",
  },
  {
    icon: Clock,
    title: "Quick Booking",
    description: "Book services in minutes. Get confirmed appointments instantly.",
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Rate and review services. We maintain high quality standards.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (location) params.set("location", location);
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find Trusted Local{" "}
              <span className="text-amber-400">Service Providers</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100">
              Connect with skilled professionals in your area. From plumbers to
              tutors, find the right expert for every need.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 shadow-lg focus:ring-4 focus:ring-blue-300"
                  />
                </div>
                <div className="relative sm:w-64">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-gray-900 placeholder-gray-500 shadow-lg focus:ring-4 focus:ring-blue-300"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Category Links */}
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="text-blue-200 text-sm">Popular:</span>
              {categories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.value}
                  href={`/services?category=${cat.value}`}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
                >
                  {cat.icon} {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto fill-gray-50 dark:fill-slate-900">
            <path d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Browse by Category
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Find the right professional for your needs
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.value}
                href={`/services?category=${category.value}`}
                className="card group text-center hover:border-blue-300 dark:hover:border-blue-600"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {category.label}
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {category.description}
                </p>
                <ChevronRight className="w-5 h-5 mx-auto mt-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Why Choose Karigar?
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              We make finding trusted service providers easy and reliable
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-14 h-14 mx-auto bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 lg:p-16 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
              Join thousands of satisfied customers and find the perfect service
              provider for your needs today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Find Services
              </Link>
              <Link
                href="/auth/signup?role=provider"
                className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-400 transition-colors border border-blue-400"
              >
                Become a Provider
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
