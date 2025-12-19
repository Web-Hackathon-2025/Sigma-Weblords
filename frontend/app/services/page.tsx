"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { ServiceCard, CategoryFilter, LoadingSpinner } from "@/components";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: string;
  location: string;
  provider: {
    id: string;
    name: string;
    image?: string;
    address?: string;
    avgRating: number;
    reviewCount: number;
    completedJobs?: number;
    yearsExperience?: number;
    isVerified?: boolean;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "ALL",
    location: searchParams.get("location") || "",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.category && filters.category !== "ALL") params.set("category", filters.category);
      if (filters.location) params.set("location", filters.location);
      params.set("page", "1");
      params.set("limit", "12");

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [filters.category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
    
    // Update URL
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.category !== "ALL") params.set("category", filters.category);
    if (filters.location) params.set("location", filters.location);
    router.push(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "ALL", location: "" });
    router.push("/services");
    setTimeout(fetchServices, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Browse Services
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Find the perfect service provider for your needs
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plumber, electrician, cleaning..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="relative sm:w-48">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="City"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button type="submit" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all">
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg sm:hidden"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className={`mb-8 ${showFilters ? "block" : "hidden sm:block"}`}>
          <CategoryFilter
            selectedCategory={filters.category}
            onCategoryChange={(category) => setFilters({ ...filters, category })}
          />
        </div>

        {/* Active Filters */}
        {(filters.search || filters.location || filters.category !== "ALL") && (
          <div className="mb-6 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Active filters:</span>
            {filters.search && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                Search: {filters.search}
                <button onClick={() => { setFilters({ ...filters, search: "" }); setTimeout(fetchServices, 100); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.location && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                Location: {filters.location}
                <button onClick={() => { setFilters({ ...filters, location: "" }); setTimeout(fetchServices, 100); }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.category !== "ALL" && (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1">
                {filters.category}
                <button onClick={() => setFilters({ ...filters, category: "ALL" })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Loading services..." />
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filters
            </p>
            <button onClick={clearFilters} className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Found {pagination?.total || services.length} services
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-lg ${
                        page === pagination.page
                          ? "bg-orange-600 text-white"
                          : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading..." />}>
      <ServicesContent />
    </Suspense>
  );
}
