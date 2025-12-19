"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Briefcase,
  Calendar,
  Star,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { LoadingSpinner } from "@/components";

interface Stats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalServices: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  averageRating: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: string;
    status: string;
    createdAt: string;
    service: { title: string };
    customer: { name: string };
  }>;
}

export default function AdminDashboardPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/admin");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchStats();
  }, [session, authStatus, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Service Providers",
      value: stats?.totalProviders || 0,
      icon: Briefcase,
      color: "bg-green-500",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "bg-purple-500",
      change: "+23%",
      trend: "up",
    },
    {
      title: "Avg. Rating",
      value: stats?.averageRating?.toFixed(1) || "0.0",
      icon: Star,
      color: "bg-yellow-500",
      change: "+0.2",
      trend: "up",
    },
    {
      title: "Active Services",
      value: stats?.totalServices || 0,
      icon: Activity,
      color: "bg-indigo-500",
      change: "+15%",
      trend: "up",
    },
    {
      title: "Pending Requests",
      value: stats?.pendingBookings || 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: "-5%",
      trend: "down",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Platform overview and management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm ${
                          stat.trend === "up" ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-400">vs last month</span>
                    </div>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Users
              </h2>
              <Link
                href="/dashboard/admin/users"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentUsers?.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        {user.name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === "PROVIDER"
                        ? "bg-green-100 text-green-700"
                        : user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent users</p>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Bookings
              </h2>
              <Link
                href="/dashboard/admin/bookings"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentBookings?.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.service.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {booking.customer.name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No recent bookings</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/dashboard/admin/users"
              className="card hover:shadow-lg transition-shadow"
            >
              <Users className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Users
              </h3>
              <p className="text-sm text-gray-500">
                View and manage user accounts
              </p>
            </Link>
            <Link
              href="/dashboard/admin/services"
              className="card hover:shadow-lg transition-shadow"
            >
              <Briefcase className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Moderate Services
              </h3>
              <p className="text-sm text-gray-500">
                Review and moderate listings
              </p>
            </Link>
            <Link
              href="/dashboard/admin/reviews"
              className="card hover:shadow-lg transition-shadow"
            >
              <Star className="w-8 h-8 text-yellow-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Reviews
              </h3>
              <p className="text-sm text-gray-500">
                Moderate user reviews
              </p>
            </Link>
            <Link
              href="/dashboard/admin/reports"
              className="card hover:shadow-lg transition-shadow"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                View Reports
              </h3>
              <p className="text-sm text-gray-500">
                Platform analytics & reports
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
