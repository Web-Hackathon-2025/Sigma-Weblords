"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Camera,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  image: string;
}

interface ProviderProfile {
  businessName: string;
  experience: string;
  certifications: string;
  availability: string;
}

export default function ProfileSettingsPage() {
  const { data: session, status: authStatus, update } = useSession();
  const router = useRouter();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    image: "",
  });
  const [providerProfile, setProviderProfile] = useState<ProviderProfile>({
    businessName: "",
    experience: "",
    certifications: "",
    availability: "MON-FRI 9AM-5PM",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (authStatus === "loading") return;

    if (!session) {
      router.push("/auth/signin?callbackUrl=/dashboard/profile");
      return;
    }

    fetchProfile();
  }, [session, authStatus, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      const data = await response.json();

      if (response.ok) {
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          image: data.image || "",
        });
        if (data.providerProfile) {
          setProviderProfile({
            businessName: data.providerProfile.businessName || "",
            experience: data.providerProfile.experience?.toString() || "",
            certifications: data.providerProfile.certifications || "",
            availability: data.providerProfile.availability || "MON-FRI 9AM-5PM",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileData,
          providerProfile:
            session?.user?.role === "PROVIDER"
              ? {
                  ...providerProfile,
                  experience: parseInt(providerProfile.experience) || 0,
                }
              : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Update session with new name if changed
        if (profileData.name !== session?.user?.name) {
          await update({ name: profileData.name });
        }
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Failed to update profile");
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
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  const isProvider = session?.user?.role === "PROVIDER";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account settings and profile information
          </p>
        </div>

        {/* Tabs for Providers */}
        {isProvider && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab("business")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "business"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              Business Profile
            </button>
          </div>
        )}

        <form onSubmit={handleSaveProfile}>
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Info Tab */}
          {activeTab === "profile" && (
            <div className="card">
              {/* Profile Photo */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-slate-700">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden">
                    {profileData.image ? (
                      <img
                        src={profileData.image}
                        alt={profileData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {profileData.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="text-sm text-gray-500">
                    Update your profile photo
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="input"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="form-label flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="input bg-gray-100 dark:bg-slate-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="form-label flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div>
                  <label className="form-label flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    className="input"
                    placeholder="Your address"
                  />
                </div>

                <div>
                  <label className="form-label">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="input min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Profile Tab (Providers Only) */}
          {activeTab === "business" && isProvider && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Business Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    Information shown on your service listings
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    value={providerProfile.businessName}
                    onChange={(e) =>
                      setProviderProfile({
                        ...providerProfile,
                        businessName: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={providerProfile.experience}
                    onChange={(e) =>
                      setProviderProfile({
                        ...providerProfile,
                        experience: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="form-label">Certifications</label>
                  <textarea
                    value={providerProfile.certifications}
                    onChange={(e) =>
                      setProviderProfile({
                        ...providerProfile,
                        certifications: e.target.value,
                      })
                    }
                    className="input min-h-[100px]"
                    placeholder="List your certifications, licenses, or qualifications..."
                  />
                </div>

                <div>
                  <label className="form-label">Availability</label>
                  <input
                    type="text"
                    value={providerProfile.availability}
                    onChange={(e) =>
                      setProviderProfile({
                        ...providerProfile,
                        availability: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="e.g., MON-FRI 9AM-5PM"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary px-8"
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

        {/* Account Actions */}
        <div className="card mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <p className="font-medium text-gray-900 dark:text-white">
                Change Password
              </p>
              <p className="text-sm text-gray-500">
                Update your account password
              </p>
            </button>
            <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <p className="font-medium text-gray-900 dark:text-white">
                Notification Preferences
              </p>
              <p className="text-sm text-gray-500">
                Manage email and push notifications
              </p>
            </button>
            <button className="w-full text-left p-4 rounded-lg border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-red-500">
                Permanently delete your account and data
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
