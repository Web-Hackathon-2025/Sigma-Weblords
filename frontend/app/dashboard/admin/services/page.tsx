"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
} from "lucide-react";
import { LoadingSpinner, Modal } from "@/components";

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  priceUnit: string;
  location: string;
  isActive: boolean;
  createdAt: string;
  provider: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    reviews: number;
    requests: number;
  };
}

export default function AdminServicesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Service | null>(null);

  const categories = [
    "all",
    "PLUMBER",
    "ELECTRICIAN",
    "CLEANER",
    "TUTOR",
    "TECHNICIAN",
    "CARPENTER",
    "PAINTER",
    "GARDENER",
    "MECHANIC",
    "OTHER",
  ];

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/admin/services");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchServices();
  }, [session, authStatus, router, page, categoryFilter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const categoryParam =
        categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const response = await fetch(
        `/api/services?page=${page}&limit=10${categoryParam}`
      );
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => {
    setActionLoading(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setServices(
          services.map((s) =>
            s.id === serviceId ? { ...s, isActive: !currentStatus } : s
          )
        );
      } else {
        alert("Failed to update service status");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteService = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id);
    try {
      const response = await fetch(`/api/services/${deleteModal.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServices(services.filter((s) => s.id !== deleteModal.id));
        setDeleteModal(null);
      } else {
        alert("Failed to delete service");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredServices = services.filter(
    (service) =>
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.provider?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Moderation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Review and moderate service listings
          </p>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by service or provider name..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-40"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all"
                      ? "All Categories"
                      : cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading services..." />
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-500">No services found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className={`card ${!service.isActive ? "opacity-60" : ""}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-lg ${
                        categoryColors[service.category] || categoryColors.OTHER
                      }`}
                    >
                      {service.category}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-3">
                    by {service.provider.name}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>{service.location}</span>
                    <span className="font-semibold text-blue-600">
                      ${service.price} {service.priceUnit}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {service._count?.reviews || 0} reviews
                    </span>
                    <span>{service._count?.requests || 0} bookings</span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/services/${service.id}`}
                      className="flex-1 btn btn-outline text-sm text-center"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <button
                      onClick={() =>
                        toggleServiceStatus(service.id, service.isActive)
                      }
                      disabled={actionLoading === service.id}
                      className="flex-1 btn btn-outline text-sm"
                    >
                      {actionLoading === service.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : service.isActive ? (
                        <>
                          <Ban className="w-4 h-4" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setDeleteModal(service)}
                      className="btn btn-outline text-red-600 text-sm p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Service"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete{" "}
          <strong>{deleteModal?.title}</strong>?
        </p>
        <p className="text-sm text-red-600 mb-6">
          This action cannot be undone. All associated reviews and bookings will
          be affected.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="flex-1 btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={deleteService}
            disabled={!!actionLoading}
            className="flex-1 btn btn-danger"
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Delete Service"
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
