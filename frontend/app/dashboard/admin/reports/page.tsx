"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  User,
  Briefcase,
  Star,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner, Modal } from "@/components";

interface Report {
  id: string;
  type: string;
  reason: string;
  description?: string;
  status: string;
  resolution?: string;
  createdAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  targetUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  targetService?: {
    id: string;
    title: string;
    category: string;
  };
  targetReview?: {
    id: string;
    rating: number;
    comment?: string;
  };
  targetBooking?: {
    id: string;
    status: string;
    service: {
      title: string;
    };
  };
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
  INVESTIGATING: {
    label: "Investigating",
    color: "bg-blue-100 text-blue-700",
    icon: Eye,
  },
  RESOLVED: {
    label: "Resolved",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
  },
  DISMISSED: {
    label: "Dismissed",
    color: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

const typeConfig = {
  USER: { icon: User, color: "text-blue-600" },
  SERVICE: { icon: Briefcase, color: "text-green-600" },
  REVIEW: { icon: Star, color: "text-yellow-600" },
  BOOKING: { icon: Calendar, color: "text-purple-600" },
};

type ReportStatus = keyof typeof statusConfig;
type ReportType = keyof typeof typeConfig;

export default function AdminReportsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/admin/reports");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchReports();
  }, [session, authStatus, router, page, statusFilter, typeFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const typeParam = typeFilter !== "all" ? `&type=${typeFilter}` : "";
      const response = await fetch(
        `/api/reports?page=${page}&limit=10${statusParam}${typeParam}`
      );
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setActionLoading(reportId);
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          resolution: resolution || undefined,
        }),
      });

      if (response.ok) {
        setReports(
          reports.map((r) =>
            r.id === reportId ? { ...r, status: newStatus, resolution } : r
          )
        );
        setSelectedReport(null);
        setResolution("");
      } else {
        alert("Failed to update report status");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReports = reports.filter(
    (report) =>
      report.reporter?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  const getTargetInfo = (report: Report) => {
    if (report.targetUser) {
      return `User: ${report.targetUser.name} (${report.targetUser.email})`;
    }
    if (report.targetService) {
      return `Service: ${report.targetService.title}`;
    }
    if (report.targetReview) {
      return `Review: ${report.targetReview.rating} stars - "${report.targetReview.comment?.slice(0, 50)}..."`;
    }
    if (report.targetBooking) {
      return `Booking: ${report.targetBooking.service.title} (${report.targetBooking.status})`;
    }
    return "Unknown target";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reports & Disputes
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Handle reported issues and disputes between users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = reports.filter((r) => r.status === key).length;
            const Icon = config.icon;
            return (
              <div key={key} className="card">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </p>
                    <p className="text-sm text-gray-500">{config.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
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
                placeholder="Search reports..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-40"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-40"
              >
                <option value="all">All Types</option>
                <option value="USER">User</option>
                <option value="SERVICE">Service</option>
                <option value="REVIEW">Review</option>
                <option value="BOOKING">Booking</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="card text-center py-16">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredReports.map((report) => {
                const statusInfo = statusConfig[report.status as ReportStatus];
                const typeInfo = typeConfig[report.type as ReportType];
                const StatusIcon = statusInfo?.icon || AlertTriangle;
                const TypeIcon = typeInfo?.icon || Flag;

                return (
                  <div key={report.id} className="card">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusInfo?.color || "bg-gray-100"}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo?.label || report.status}
                          </span>
                          <span className={`flex items-center gap-1 text-sm ${typeInfo?.color || "text-gray-600"}`}>
                            <TypeIcon className="w-4 h-4" />
                            {report.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(report.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>

                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {report.reason}
                        </h3>
                        
                        {report.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            {report.description}
                          </p>
                        )}

                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            <span className="font-medium">Reported by:</span>{" "}
                            {report.reporter.name} ({report.reporter.email})
                          </p>
                          <p>
                            <span className="font-medium">Target:</span>{" "}
                            {getTargetInfo(report)}
                          </p>
                          {report.resolution && (
                            <p>
                              <span className="font-medium">Resolution:</span>{" "}
                              {report.resolution}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="btn btn-outline text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="btn btn-outline p-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="btn btn-outline p-2"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Detail Modal */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => {
          setSelectedReport(null);
          setResolution("");
        }}
        title="Review Report"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {selectedReport.reason}
              </h4>
              {selectedReport.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedReport.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium">{selectedReport.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium">{selectedReport.status}</p>
              </div>
              <div>
                <p className="text-gray-500">Reporter</p>
                <p className="font-medium">{selectedReport.reporter.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Submitted</p>
                <p className="font-medium">
                  {format(new Date(selectedReport.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-1">Target</p>
              <p className="font-medium">{getTargetInfo(selectedReport)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resolution Notes
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Add resolution notes..."
                rows={3}
                className="input"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {selectedReport.status !== "INVESTIGATING" && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, "INVESTIGATING")}
                  disabled={!!actionLoading}
                  className="btn btn-primary"
                >
                  {actionLoading === selectedReport.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                  Mark as Investigating
                </button>
              )}
              {selectedReport.status !== "RESOLVED" && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, "RESOLVED")}
                  disabled={!!actionLoading}
                  className="btn btn-success"
                >
                  {actionLoading === selectedReport.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Mark as Resolved
                </button>
              )}
              {selectedReport.status !== "DISMISSED" && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, "DISMISSED")}
                  disabled={!!actionLoading}
                  className="btn btn-outline"
                >
                  {actionLoading === selectedReport.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Dismiss
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
