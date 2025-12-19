"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
  Star,
} from "lucide-react";
import { StarRating, Modal, LoadingSpinner } from "@/components";

interface Booking {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes?: string;
  totalPrice?: number;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
  };
  provider: {
    id: string;
    name: string;
    email: string;
    image?: string;
    phone?: string;
  };
  service: {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number;
    priceType: string;
  };
  review?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  };
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/bookings/${params.id}`);
      return;
    }

    fetchBooking();
  }, [session, authStatus, params.id, router]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setBooking(data);
      } else {
        setError(data.error || "Booking not found");
      }
    } catch (error) {
      setError("Failed to load booking");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBooking();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update booking");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: booking?.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      if (response.ok) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModal(false);
          fetchBooking();
        }, 2000);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit review");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading booking details..." />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error}
          </h2>
          <button onClick={() => router.back()} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const isCustomer = session?.user?.id === booking.customer.id;
  const isProvider = session?.user?.id === booking.provider.id;

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pending Confirmation",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  // Format time string like "08:00" to "8:00 AM"
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-lg ${statusColors[booking.status]}`}
              >
                {statusLabels[booking.status]}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {booking.service.title}
              </h1>
              <p className="text-gray-500">{booking.service.category}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-blue-600">
                ${booking.totalPrice || booking.service.price}
              </span>
              <p className="text-sm text-gray-500">
                / {booking.service.priceType === "HOURLY" ? "hour" : booking.service.priceType === "SQFT" ? "sq ft" : "fixed"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Booking Details */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Booking Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(booking.scheduledDate), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatTime(booking.scheduledTime)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Service Address</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {booking.address}
                  </p>
                </div>
              </div>
              {booking.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {isCustomer ? "Service Provider" : "Customer"}
            </h2>
            <div className="flex items-center gap-4 mb-4">
              {(isCustomer ? booking.provider : booking.customer).image ? (
                <img
                  src={(isCustomer ? booking.provider : booking.customer).image}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
                  {(isCustomer ? booking.provider : booking.customer).name[0]}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {(isCustomer ? booking.provider : booking.customer).name}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a
                  href={`mailto:${(isCustomer ? booking.provider : booking.customer).email}`}
                  className="text-blue-600 hover:underline"
                >
                  {(isCustomer ? booking.provider : booking.customer).email}
                </a>
              </div>
              {(isCustomer ? booking.provider : booking.customer).phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${(isCustomer ? booking.provider : booking.customer).phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {(isCustomer ? booking.provider : booking.customer).phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actions
          </h2>

          {/* Provider Actions */}
          {isProvider && (
            <div className="flex flex-wrap gap-3">
              {booking.status === "PENDING" && (
                <>
                  <button
                    onClick={() => updateBookingStatus("CONFIRMED")}
                    disabled={actionLoading}
                    className="btn btn-success"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    Accept Booking
                  </button>
                  <button
                    onClick={() => updateBookingStatus("CANCELLED")}
                    disabled={actionLoading}
                    className="btn btn-danger"
                  >
                    <XCircle className="w-5 h-5" />
                    Decline
                  </button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <>
                  <button
                    onClick={() => updateBookingStatus("IN_PROGRESS")}
                    disabled={actionLoading}
                    className="btn btn-primary"
                  >
                    <Play className="w-5 h-5" />
                    Start Service
                  </button>
                  <button
                    onClick={() => updateBookingStatus("CANCELLED")}
                    disabled={actionLoading}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </>
              )}
              {booking.status === "IN_PROGRESS" && (
                <button
                  onClick={() => updateBookingStatus("COMPLETED")}
                  disabled={actionLoading}
                  className="btn btn-success"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark as Completed
                </button>
              )}
            </div>
          )}

          {/* Customer Actions */}
          {isCustomer && (
            <div className="flex flex-wrap gap-3">
              {["PENDING", "CONFIRMED"].includes(booking.status) && (
                <button
                  onClick={() => updateBookingStatus("CANCELLED")}
                  disabled={actionLoading}
                  className="btn btn-danger"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Cancel Booking
                </button>
              )}
              {booking.status === "COMPLETED" && !booking.review && (
                <button
                  onClick={() => setReviewModal(true)}
                  className="btn btn-primary"
                >
                  <Star className="w-5 h-5" />
                  Leave a Review
                </button>
              )}
            </div>
          )}

          {booking.status === "COMPLETED" && (
            <p className="text-sm text-gray-500 mt-2">
              This booking has been completed.
            </p>
          )}
          {booking.status === "CANCELLED" && (
            <p className="text-sm text-gray-500 mt-2">
              This booking has been cancelled.
            </p>
          )}
        </div>

        {/* Review Section */}
        {booking.review && (
          <div className="mt-6 card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Review
            </h2>
            <div className="flex items-start gap-4">
              <StarRating rating={booking.review.rating} readonly />
              {booking.review.comment && (
                <p className="text-gray-600 dark:text-gray-400">
                  {booking.review.comment}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Submitted on {format(new Date(booking.review.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title="Leave a Review"
      >
        {reviewSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Thank You!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your review has been submitted successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating
              </label>
              <StarRating
                rating={reviewData.rating}
                onRatingChange={(rating) => setReviewData({ ...reviewData, rating })}
                size="lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Share your experience..."
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full btn btn-primary py-3"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
