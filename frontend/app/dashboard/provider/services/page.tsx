"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import { LoadingSpinner, Modal } from "@/components";

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceType: string;
  location: string;
  isActive: boolean;
}

export default function ProviderServicesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;
    
    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/provider/services");
      return;
    }

    if (session.user.role !== "PROVIDER") {
      router.push("/");
      return;
    }

    fetchServices();
  }, [session, authStatus, router]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`/api/services?providerId=${session?.user?.id}&limit=50`);
      const data = await response.json();

      if (response.ok) {
        setServices(data.services);
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
        setServices(services.map(s =>
          s.id === serviceId ? { ...s, isActive: !currentStatus } : s
        ));
      }
    } catch (error) {
      alert("Failed to update service");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteService = async (serviceId: string) => {
    setActionLoading(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServices(services.filter(s => s.id !== serviceId));
        setDeleteModal(null);
      }
    } catch (error) {
      alert("Failed to delete service");
    } finally {
      setActionLoading(null);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading services..." />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    Plumbing: "bg-blue-100 text-blue-700",
    Electrical: "bg-yellow-100 text-yellow-700",
    Cleaning: "bg-green-100 text-green-700",
    Carpentry: "bg-amber-100 text-amber-700",
    Painting: "bg-pink-100 text-pink-700",
    Gardening: "bg-emerald-100 text-emerald-700",
    Tutoring: "bg-purple-100 text-purple-700",
    Mechanic: "bg-red-100 text-red-700",
    Other: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Services
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your service offerings
            </p>
          </div>
          <Link href="/dashboard/provider/services/new" className="btn btn-primary">
            <Plus className="w-5 h-5" />
            Add Service
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add your first service to start receiving bookings
            </p>
            <Link href="/dashboard/provider/services/new" className="btn btn-primary">
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className={`card ${!service.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-lg ${
                          categoryColors[service.category] || categoryColors.OTHER
                        }`}
                      >
                        {service.category}
                      </span>
                      {!service.isActive && (
                        <span className="px-2 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 mt-1 line-clamp-2">
                      {service.description}
                    </p>
                    <p className="mt-2 text-orange-600 font-semibold">
                      Rs. {service.price.toLocaleString()} {service.priceType === "HOURLY" ? "/hour" : service.priceType === "SQFT" ? "/sq.ft" : "fixed"}
                    </p>
                    <p className="text-sm text-gray-400">{service.location}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleServiceStatus(service.id, service.isActive)}
                      disabled={actionLoading === service.id}
                      className="btn btn-outline p-2"
                      title={service.isActive ? "Deactivate" : "Activate"}
                    >
                      {actionLoading === service.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : service.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <Link
                      href={`/dashboard/provider/services/${service.id}/edit`}
                      className="btn btn-outline p-2"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setDeleteModal(service.id)}
                      className="btn btn-outline p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Service"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this service? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="flex-1 btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteModal && deleteService(deleteModal)}
            disabled={!!actionLoading}
            className="flex-1 btn btn-danger"
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
