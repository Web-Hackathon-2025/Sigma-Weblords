"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  Star,
  DollarSign,
  ArrowRight,
  Plus,
} from "lucide-react";
import { LoadingSpinner } from "@/components";

interface DashboardStats {
  totalServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  avgRating: number;
  totalReviews: number;
}

interface RecentBooking {
  id: string;
  status: string;
  scheduledAt: string;
  service: {
    title: string;
    category: string;
  };
  customer: {
    name: string;
    image?: string;
  };
}

export default function ProviderDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    avgRating: 0,
    totalReviews: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/provider");
      return;
    }

    if (session.user.role !== "PROVIDER") {
      router.push("/");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [bookingsRes, servicesRes, reviewsRes] = await Promise.all([
        fetch("/api/bookings?role=provider&limit=5"),
        fetch(`/api/services?providerId=${session?.user?.id}`),
        fetch(`/api/reviews?providerId=${session?.user?.id}`),
      ]);

      const [bookingsData, servicesData, reviewsData] = await Promise.all([
        bookingsRes.json(),
        servicesRes.json(),
        reviewsRes.json(),
      ]);

      setRecentBookings(bookingsData.bookings || []);

      // Calculate stats
      const bookings = bookingsData.bookings || [];
      const reviews = reviewsData.reviews || [];
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : 0;

      setStats({
        totalServices: servicesData.pagination?.total || 0,
        totalBookings: bookingsData.pagination?.total || 0,
        pendingBookings: bookings.filter((b: RecentBooking) =>
          ["REQUESTED", "CONFIRMED"].includes(b.status)
        ).length,
        completedBookings: bookings.filter((b: RecentBooking) =>
          b.status === "COMPLETED"
        ).length,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    REQUESTED: "badge-warning",
    CONFIRMED: "badge-primary",
    IN_PROGRESS: "badge-primary",
    COMPLETED: "badge-success",
    CANCELLED: "badge-danger",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Provider Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your services and bookings
            </p>
          </div>
          <Link href="/dashboard/provider/services/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Add Service
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalServices}
                </p>
                <p className="text-sm text-gray-500">Active Services</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingBookings}
                </p>
                <p className="text-sm text-gray-500">Pending Requests</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.completedBookings}
                </p>
                <p className="text-sm text-gray-500">Completed Jobs</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "N/A"}
                </p>
                <p className="text-sm text-gray-500">{stats.totalReviews} Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard/provider/services"
            className="card group hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                    My Services
                  </h3>
                  <p className="text-sm text-gray-500">Manage your offerings</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            href="/dashboard/provider/bookings"
            className="card group hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                    Bookings
                  </h3>
                  <p className="text-sm text-gray-500">View all requests</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>

          <Link
            href="/profile"
            className="card group hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                    Profile
                  </h3>
                  <p className="text-sm text-gray-500">Update your profile</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Booking Requests
            </h2>
            <Link
              href="/dashboard/provider/bookings"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No booking requests yet
              </h3>
              <p className="text-gray-500">
                Make sure to add services to start receiving bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/bookings/${booking.id}`}
                  className="block p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {booking.customer.image ? (
                        <img
                          src={booking.customer.image}
                          alt={booking.customer.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-medium">
                          {booking.customer.name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {booking.service.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.customer.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge ${statusColors[booking.status]}`}>
                        {booking.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {format(new Date(booking.scheduledAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
