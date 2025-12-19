"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookingCard, LoadingSpinner } from "@/components";

interface Booking {
  id: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalPrice?: number;
  createdAt: string;
  service: {
    id: string;
    title: string;
    category: string;
    price: number;
    priceType: string;
  };
  provider: {
    id: string;
    name: string;
    image?: string;
  };
  review?: {
    rating: number;
  };
}

export default function CustomerBookingsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (authStatus === "loading") return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/customer/bookings");
      return;
    }

    if (session.user.role !== "CUSTOMER") {
      router.push("/");
      return;
    }

    fetchBookings();
  }, [session, authStatus, router]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings?limit=50");
      const data = await response.json();

      if (response.ok) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading bookings..." />
      </div>
    );
  }

  const filteredBookings = filter === "ALL" 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const statusFilters = [
    { value: "ALL", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Bookings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage all your service bookings
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilter(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === status.value
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500">
              {filter === "ALL"
                ? "You haven't made any bookings yet"
                : `No ${filter.toLowerCase()} bookings`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} viewAs="customer" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
