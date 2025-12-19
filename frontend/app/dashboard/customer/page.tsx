"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Star,
  ArrowRight,
} from "lucide-react";
import { LoadingSpinner } from "@/components";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

interface RecentBooking {
  id: string;
  status: string;
  scheduledAt: string;
  service: {
    title: string;
    category: string;
  };
  provider: {
    name: string;
    image?: string;
  };
}

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/customer");
      return;
    }

    if (session.user.role !== "CUSTOMER") {
      router.push("/");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/bookings?limit=5");
      const data = await response.json();

      if (response.ok) {
        setRecentBookings(data.bookings);
        
        // Calculate stats
        const bookings = data.bookings;
        setStats({
          totalBookings: data.pagination.total,
          pendingBookings: bookings.filter((b: RecentBooking) => 
            ["REQUESTED", "CONFIRMED"].includes(b.status)
          ).length,
          completedBookings: bookings.filter((b: RecentBooking) => 
            b.status === "COMPLETED"
          ).length,
          cancelledBookings: bookings.filter((b: RecentBooking) => 
            b.status === "CANCELLED"
          ).length,
        });
      }
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here&apos;s what&apos;s happening with your bookings
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href="/services"
            className="card group hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                  Find Services
                </h3>
                <p className="text-sm text-gray-500">Browse providers</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/customer/bookings"
            className="card group hover:border-blue-300 dark:hover:border-blue-600"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                  My Bookings
                </h3>
                <p className="text-sm text-gray-500">{stats.totalBookings} total</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Pending
                </h3>
                <p className="text-sm text-gray-500">{stats.pendingBookings} bookings</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Completed
                </h3>
                <p className="text-sm text-gray-500">{stats.completedBookings} bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Bookings
            </h2>
            <Link
              href="/dashboard/customer/bookings"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No bookings yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start by finding a service provider
              </p>
              <Link href="/services" className="btn btn-primary">
                Browse Services
              </Link>
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
                      {booking.provider.image ? (
                        <img
                          src={booking.provider.image}
                          alt={booking.provider.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-medium">
                          {booking.provider.name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {booking.service.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {booking.provider.name}
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
