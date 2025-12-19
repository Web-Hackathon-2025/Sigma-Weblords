import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Fetch single provider profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const provider = await prisma.user.findUnique({
      where: { id, role: "PROVIDER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        address: true,
        bio: true,
        createdAt: true,
        providerProfile: true,
        services: {
          where: { isActive: true },
          select: {
            id: true,
            category: true,
            title: true,
            description: true,
            price: true,
            priceType: true,
            location: true,
          },
        },
        reviewsReceived: {
          include: {
            customer: {
              select: {
                name: true,
                image: true,
              },
            },
            request: {
              select: {
                service: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const reviews = provider.reviewsReceived;
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : provider.providerProfile?.averageRating || 0;

    // Get unique categories
    const categories = [...new Set(provider.services.map((s: { category: string }) => s.category))];

    return NextResponse.json({
      ...provider,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length,
      completedJobs: provider.providerProfile?.completedJobs || 0,
      yearsExperience: provider.providerProfile?.yearsExperience || 0,
      isVerified: provider.providerProfile?.isVerified || false,
      categories,
    });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}
