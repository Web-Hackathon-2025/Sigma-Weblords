"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner, Modal } from "@/components";

interface Booking {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  message?: string;
  address: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  service: {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
  };
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "text-yellow-600 bg-yellow-100",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "text-blue-600 bg-blue-100",
    icon: CheckCircle,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "text-purple-600 bg-purple-100",
    icon: AlertCircle,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-600 bg-green-100",
    icon: CheckCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "text-red-600 bg-red-100",
    icon: XCircle,
  },
};

type BookingStatus = keyof typeof statusConfig;

export default function ProviderBookingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rescheduleModal, setRescheduleModal] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/provider/bookings");
      return;
    }

    if (session.user.role !== "PROVIDER") {
      router.push("/");
      return;
    }

    fetchBookings();
  }, [session, authStatus, router, activeTab, page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const statusParam = activeTab !== "all" ? `&status=${activeTab.toUpperCase()}` : "";
      const response = await fetch(`/api/bookings?page=${page}&limit=10${statusParam}`);
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchBookings();
      } else {
        alert("Failed to update booking");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleModal || !rescheduleDate || !rescheduleTime) return;

    setActionLoading(rescheduleModal.id);
    try {
      const response = await fetch(`/api/bookings/${rescheduleModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: rescheduleDate,
          scheduledTime: rescheduleTime,
        }),
      });

      if (response.ok) {
        setRescheduleModal(null);
        setRescheduleDate("");
        setRescheduleTime("");
        fetchBookings();
      } else {
        alert("Failed to reschedule booking");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All Bookings" },
    { id: "pending", label: "Pending" },
    { id: "confirmed", label: "Confirmed" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const timeSlots = [
    "08:00 AM",
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Booking Requests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your service booking requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {activeTab === "all"
                ? "You don't have any booking requests yet"
                : `No ${activeTab.replace("_", " ")} bookings`}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {bookings.map((booking) => {
                const status = statusConfig[booking.status as BookingStatus];
                const StatusIcon = status?.icon || Clock;

                return (
                  <div key={booking.id} className="card">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status?.color}`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {status?.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            ID: {booking.id.slice(0, 8)}...
                          </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {booking.service.title}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            <span>{booking.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>{booking.customer.phone || booking.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(booking.scheduledDate), "MMM d, yyyy")} at{" "}
                              {booking.scheduledTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{booking.address}</span>
                          </div>
                        </div>

                        {booking.message && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                            <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-2">{booking.message}</p>
                          </div>
                        )}

                        <p className="mt-3 text-lg font-semibold text-blue-600">
                          ${booking.service.price} {booking.service.priceUnit}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 lg:w-36">
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, "CONFIRMED")}
                              disabled={actionLoading === booking.id}
                              className="flex-1 btn btn-primary text-sm"
                            >
                              {actionLoading === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Accept"
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setRescheduleModal(booking);
                                setRescheduleDate(booking.scheduledDate.split("T")[0]);
                                setRescheduleTime(booking.scheduledTime);
                              }}
                              className="flex-1 btn btn-outline text-sm"
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, "CANCELLED")}
                              disabled={actionLoading === booking.id}
                              className="flex-1 btn btn-outline text-red-600 text-sm"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {booking.status === "CONFIRMED" && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, "IN_PROGRESS")}
                              disabled={actionLoading === booking.id}
                              className="flex-1 btn btn-primary text-sm"
                            >
                              Start Job
                            </button>
                            <button
                              onClick={() => {
                                setRescheduleModal(booking);
                                setRescheduleDate(booking.scheduledDate.split("T")[0]);
                                setRescheduleTime(booking.scheduledTime);
                              }}
                              className="flex-1 btn btn-outline text-sm"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                        {booking.status === "IN_PROGRESS" && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, "COMPLETED")}
                            disabled={actionLoading === booking.id}
                            className="flex-1 btn btn-success text-sm"
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Mark Complete"
                            )}
                          </button>
                        )}
                        {(booking.status === "COMPLETED" || booking.status === "CANCELLED") && (
                          <Link
                            href={`/bookings/${booking.id}`}
                            className="btn btn-outline text-sm text-center"
                          >
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-outline p-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn btn-outline p-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleModal}
        onClose={() => {
          setRescheduleModal(null);
          setRescheduleDate("");
          setRescheduleTime("");
        }}
        title="Reschedule Booking"
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">New Date</label>
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="input"
            />
          </div>
          <div>
            <label className="form-label">New Time</label>
            <select
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              className="input"
            >
              {timeSlots.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setRescheduleModal(null);
                setRescheduleDate("");
                setRescheduleTime("");
              }}
              className="flex-1 btn btn-outline"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={!rescheduleDate || !rescheduleTime || !!actionLoading}
              className="flex-1 btn btn-primary"
            >
              {actionLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
