"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { LoadingSpinner, Modal } from "@/components";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    services?: number;
    bookings?: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<User | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/admin/users");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [session, authStatus, router, page, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const roleParam = roleFilter !== "all" ? `&role=${roleFilter.toUpperCase()}` : "";
      const response = await fetch(`/api/admin/users?page=${page}&limit=10${roleParam}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    setActionMenu(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, isActive: !currentStatus } : u
        ));
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setActionMenu(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setUsers(users.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ));
      } else {
        alert("Failed to update user role");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async () => {
    if (!deleteModal) return;
    setActionLoading(deleteModal.id);
    try {
      const response = await fetch(`/api/admin/users/${deleteModal.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== deleteModal.id));
        setDeleteModal(null);
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View and manage all platform users
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
                placeholder="Search by name or email..."
                className="input pl-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="input w-40"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="provider">Providers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading users..." />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                {user.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive !== false
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {user.isActive !== false ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(user.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                              disabled={actionLoading === user.id}
                            >
                              {actionLoading === user.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              )}
                            </button>
                            {actionMenu === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10">
                                <button
                                  onClick={() => toggleUserStatus(user.id, user.isActive !== false)}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  {user.isActive !== false ? (
                                    <>
                                      <Ban className="w-4 h-4 text-red-500" />
                                      Suspend User
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                      Activate User
                                    </>
                                  )}
                                </button>
                                {user.role !== "ADMIN" && (
                                  <button
                                    onClick={() =>
                                      changeUserRole(
                                        user.id,
                                        user.role === "PROVIDER" ? "CUSTOMER" : "PROVIDER"
                                      )
                                    }
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-700"
                                  >
                                    Change to {user.role === "PROVIDER" ? "Customer" : "Provider"}
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setDeleteModal(user);
                                    setActionMenu(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
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
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        size="sm"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Are you sure you want to delete{" "}
          <strong>{deleteModal?.name}</strong>?
        </p>
        <p className="text-sm text-red-600 mb-6">
          This action cannot be undone. All user data will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteModal(null)} className="flex-1 btn btn-outline">
            Cancel
          </button>
          <button
            onClick={deleteUser}
            disabled={!!actionLoading}
            className="flex-1 btn btn-danger"
          >
            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete User"}
          </button>
        </div>
      </Modal>

      {/* Click outside to close action menu */}
      {actionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenu(null)}
        />
      )}
    </div>
  );
}
