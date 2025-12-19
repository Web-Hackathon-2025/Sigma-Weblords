"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Calendar,
  ArrowLeft,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { StarRating, Modal, LoadingSpinner } from "@/components";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  availability?: string;
  provider: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
    city?: string;
    address?: string;
    bio?: string;
    avgRating: number;
    reviewCount: number;
    providerReviews: Array<{
      id: string;
      rating: number;
      comment?: string;
      createdAt: string;
      customer: {
        name: string;
        image?: string;
      };
    }>;
  };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    scheduledAt: "",
    address: "",
    notes: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/services/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          setService(data);
        } else {
          setError(data.error || "Service not found");
        }
      } catch (error) {
        setError("Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/services/${params.id}`);
      return;
    }

    setBookingLoading(true);
    setError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service?.id,
          scheduledAt: new Date(bookingData.scheduledAt).toISOString(),
          address: bookingData.address,
          notes: bookingData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModal(false);
          router.push("/dashboard/customer/bookings");
        }, 2000);
      } else {
        setError(data.error || "Failed to create booking");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading service details..." />
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <Link href="/services" className="btn btn-primary">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  if (!service) return null;

  const categoryColors: Record<string, string> = {
    PLUMBER: "bg-blue-100 text-blue-700",
    ELECTRICIAN: "bg-yellow-100 text-yellow-700",
    CLEANER: "bg-green-100 text-green-700",
    TUTOR: "bg-purple-100 text-purple-700",
    TECHNICIAN: "bg-orange-100 text-orange-700",
    CARPENTER: "bg-amber-100 text-amber-700",
    PAINTER: "bg-pink-100 text-pink-700",
    GARDENER: "bg-emerald-100 text-emerald-700",
    MECHANIC: "bg-red-100 text-red-700",
    OTHER: "bg-gray-100 text-gray-700",
  };

  // Get minimum date/time (now + 1 hour)
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <div className="card">
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${
                  categoryColors[service.category] || categoryColors.OTHER
                }`}
              >
                {service.category}
              </span>

              <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
                {service.title}
              </h1>

              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StarRating rating={service.provider.avgRating} readonly />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {service.provider.avgRating > 0
                      ? `${service.provider.avgRating.toFixed(1)} (${service.provider.reviewCount} reviews)`
                      : "No reviews yet"}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {service.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-blue-600">
                    ${service.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {service.priceUnit}
                  </span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Reviews ({service.provider.reviewCount})
              </h3>

              {service.provider.providerReviews.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No reviews yet
                </p>
              ) : (
                <div className="space-y-6">
                  {service.provider.providerReviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 dark:border-slate-700 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        {review.customer.image ? (
                          <img
                            src={review.customer.image}
                            alt={review.customer.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                            {review.customer.name[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {review.customer.name}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {format(new Date(review.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <StarRating rating={review.rating} readonly size="sm" />
                          {review.comment && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Card */}
            <div className="card">
              <div className="text-center">
                {service.provider.image ? (
                  <img
                    src={service.provider.image}
                    alt={service.provider.name}
                    className="w-24 h-24 rounded-2xl mx-auto object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto text-white text-3xl font-bold">
                    {service.provider.name[0]}
                  </div>
                )}

                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {service.provider.name}
                </h3>

                <div className="mt-2 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {service.provider.avgRating > 0 ? service.provider.avgRating.toFixed(1) : "New"}
                  </span>
                  <span className="text-gray-500">
                    ({service.provider.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {service.provider.bio && (
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                  {service.provider.bio}
                </p>
              )}

              <div className="mt-6 space-y-3">
                {service.provider.city && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-5 h-5" />
                    <span>{service.provider.city}</span>
                  </div>
                )}
                {service.provider.phone && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Phone className="w-5 h-5" />
                    <span>{service.provider.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Mail className="w-5 h-5" />
                  <span>{service.provider.email}</span>
                </div>
              </div>

              <Link
                href={`/providers/${service.provider.id}`}
                className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Profile
              </Link>
            </div>

            {/* Book Button */}
            <div className="card">
              <button
                onClick={() => {
                  if (!session) {
                    router.push(`/auth/signin?callbackUrl=/services/${params.id}`);
                  } else if (session.user.role === "CUSTOMER") {
                    setBookingModal(true);
                  }
                }}
                className="w-full btn btn-primary py-4 text-lg"
                disabled={session?.user?.id === service.provider.id}
              >
                <Calendar className="w-5 h-5" />
                Book This Service
              </button>
              {!session && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Sign in to book this service
                </p>
              )}
              {session?.user?.role === "PROVIDER" && (
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Switch to a customer account to book services
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title="Book Service"
        size="md"
      >
        {bookingSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Booking Submitted!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your booking request has been sent to the provider. You will be notified once confirmed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date & Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  value={bookingData.scheduledAt}
                  onChange={(e) => setBookingData({ ...bookingData, scheduledAt: e.target.value })}
                  min={minDateTime}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Service Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={bookingData.address}
                  onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                  placeholder="Enter your full address"
                  required
                  rows={3}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                placeholder="Any special instructions or requirements"
                rows={3}
              />
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">Service Price</span>
                <span className="text-xl font-bold text-blue-600">
                  ${service.price} {service.priceUnit}
                </span>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full btn btn-primary py-3"
              >
                {bookingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
