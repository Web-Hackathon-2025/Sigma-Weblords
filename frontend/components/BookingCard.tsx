"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";

interface BookingCardProps {
  booking: {
    id: string;
    status: string;
    scheduledAt: string;
    address: string;
    totalPrice?: number;
    createdAt: string;
    service: {
      id: string;
      title: string;
      category: string;
      price: number;
      priceUnit: string;
    };
    provider?: {
      id: string;
      name: string;
      image?: string;
    };
    customer?: {
      id: string;
      name: string;
      image?: string;
    };
    review?: {
      rating: number;
    };
  };
  viewAs: "customer" | "provider";
}

export default function BookingCard({ booking, viewAs }: BookingCardProps) {
  const statusColors: Record<string, string> = {
    REQUESTED: "badge-warning",
    CONFIRMED: "badge-primary",
    IN_PROGRESS: "badge-primary",
    COMPLETED: "badge-success",
    CANCELLED: "badge-danger",
  };

  const statusLabels: Record<string, string> = {
    REQUESTED: "Pending",
    CONFIRMED: "Confirmed",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const person = viewAs === "customer" ? booking.provider : booking.customer;

  return (
    <Link href={`/bookings/${booking.id}`}>
      <div className="card group cursor-pointer hover:border-blue-300 dark:hover:border-blue-600">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {person?.image ? (
              <img
                src={person.image}
                alt={person.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                {person?.name?.[0] || "?"}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {booking.service.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {viewAs === "customer" ? "Provider" : "Customer"}: {person?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`badge ${statusColors[booking.status]}`}>
              {statusLabels[booking.status]}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(booking.scheduledAt), "MMM d, yyyy")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(booking.scheduledAt), "h:mm a")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{booking.address}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {booking.service.category}
          </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            ${booking.totalPrice || booking.service.price}
          </span>
        </div>
      </div>
    </Link>
  );
}
