import Link from "next/link";
import { Star, MapPin, BadgeCheck, Briefcase } from "lucide-react";

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    priceType: string;
    location: string;
    provider: {
      id: string;
      name: string;
      image?: string;
      address?: string;
      bio?: string;
      avgRating: number;
      reviewCount: number;
      completedJobs?: number;
      yearsExperience?: number;
      isVerified?: boolean;
    };
  };
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const categoryColors: Record<string, string> = {
    Plumbing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Electrical: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    Cleaning: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    Carpentry: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    Painting: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    Gardening: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  };

  const priceLabels: Record<string, string> = {
    FIXED: "fixed",
    HOURLY: "/hour",
    SQFT: "/sq.ft",
  };

  return (
    <Link href={`/services/${service.id}`}>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 group cursor-pointer hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all">
        <div className="flex items-start gap-4">
          {/* Provider Avatar */}
          <div className="flex-shrink-0">
            {service.provider.image ? (
              <img
                src={service.provider.image}
                alt={service.provider.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl font-semibold">
                {service.provider.name?.[0] || "?"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Category Badge & Verified */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${
                  categoryColors[service.category] || categoryColors.OTHER
                }`}
              >
                {service.category}
              </span>
              {service.provider.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <BadgeCheck className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
              {service.title}
            </h3>

            {/* Provider Name */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              by <span className="font-medium">{service.provider.name}</span>
            </p>

            {/* Description */}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {service.description}
            </p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Rating */}
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {service.provider.avgRating > 0
                      ? service.provider.avgRating.toFixed(1)
                      : "New"}
                  </span>
                  {service.provider.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">
                      ({service.provider.reviewCount})
                    </span>
                  )}
                </div>

                {/* Completed Jobs */}
                {service.provider.completedJobs && service.provider.completedJobs > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    {service.provider.completedJobs} jobs
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {service.location}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  Rs. {service.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {priceLabels[service.priceType] || service.priceType}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
