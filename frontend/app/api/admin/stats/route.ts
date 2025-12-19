import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Admin stats and metrics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalServices,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalReviews,
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "PROVIDER" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.serviceRequest.count(),
      prisma.serviceRequest.count({ where: { status: "REQUESTED" } }),
      prisma.serviceRequest.count({ where: { status: "COMPLETED" } }),
      prisma.review.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.serviceRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { name: true } },
          provider: { select: { name: true } },
          service: { select: { title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalServices,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalReviews,
      },
      recentUsers,
      recentBookings,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
