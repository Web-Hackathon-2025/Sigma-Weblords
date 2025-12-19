"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
  Flag,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner, Modal, StarRating } from "@/components";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  isFlagged?: boolean;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  service: {
    id: string;
    title: string;
  };
  provider: {
    id: string;
    name: string;
  };
}

export default function AdminReviewsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<Review | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/admin/reviews");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchReviews();
  }, [session, authStatus, router, page, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const ratingParam = ratingFilter !== "all" ? `&rating=${ratingFilter}` : "";
      const response = await fetch(`/api/reviews?page=${page}&limit=10${ratingParam}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id);
    try {
      const response = await fetch(`/api/reviews/${deleteModal.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(reviews.filter((r) => r.id !== deleteModal.id));
        setDeleteModal(null);
      } else {
        alert("Failed to delete review");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.service?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Review Moderation
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and moderate user reviews
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
                placeholder="Search reviews..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-40"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading reviews..." />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="card text-center py-16">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className={`card ${review.isFlagged ? "border-l-4 border-red-500" : ""}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), "MMM d, yyyy")}
                        </span>
                        {review.isFlagged && (
                          <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            <Flag className="w-3 h-3" />
                            Flagged
                          </span>
                        )}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {review.comment}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Reviewer:</span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.customer?.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Service:</span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.service?.title}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Provider:</span>{" "}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {review.provider?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setDeleteModal(review)}
                        className="btn btn-outline text-red-600 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
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
        title="Delete Review"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete this review?
        </p>
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg mb-4">
          <StarRating rating={deleteModal?.rating || 0} size="sm" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
            &quot;{deleteModal?.comment}&quot;
          </p>
        </div>
        <p className="text-sm text-red-600 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setDeleteModal(null)}
            className="flex-1 btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={deleteReview}
            disabled={!!actionLoading}
            className="flex-1 btn btn-danger"
          >
            {actionLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Delete Review"
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}
