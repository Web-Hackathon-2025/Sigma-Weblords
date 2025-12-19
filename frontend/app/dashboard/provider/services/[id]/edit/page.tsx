"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const categories = [
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

const priceUnits = ["per hour", "per job", "per day", "per session"];

export default function EditServicePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PLUMBER",
    price: "",
    priceUnit: "per hour",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/dashboard/provider/services/${serviceId}/edit`);
      return;
    }

    if (session.user.role !== "PROVIDER") {
      router.push("/");
      return;
    }

    fetchService();
  }, [session, authStatus, router, serviceId]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}`);
      const data = await response.json();

      if (response.ok) {
        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          price: data.price.toString(),
          priceUnit: data.priceUnit,
          location: data.location,
        });
      } else {
        setError("Service not found");
      }
    } catch (error) {
      setError("Failed to load service");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    if (!formData.title || !formData.description || !formData.price || !formData.location) {
      setError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard/provider/services");
      } else {
        setError(data.error || "Failed to update service");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard/provider/services"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Services
        </Link>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Service
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Service Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="input"
                placeholder="e.g., Home Plumbing Repair"
                required
              />
            </div>

            <div>
              <label className="form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0) + cat.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input min-h-[120px]"
                placeholder="Describe your service in detail..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="input pl-7"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Price Unit *</label>
                <select
                  value={formData.priceUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, priceUnit: e.target.value })
                  }
                  className="input"
                  required
                >
                  {priceUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Service Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input"
                placeholder="e.g., Downtown Chicago, IL"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Link
                href="/dashboard/provider/services"
                className="flex-1 btn btn-outline text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 btn btn-primary"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
