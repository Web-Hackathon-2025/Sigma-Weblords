import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            address: true,
            bio: true,
            providerProfile: true,
            reviewsReceived: {
              include: {
                customer: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
        reviews: {
          include: {
            customer: {
              select: {
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Calculate average rating from service reviews
    const reviews = service.reviews || [];
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
        : service.provider.providerProfile?.averageRating || 0;

    return NextResponse.json({
      ...service,
      provider: {
        ...service.provider,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        completedJobs: service.provider.providerProfile?.completedJobs || 0,
        yearsExperience: service.provider.providerProfile?.yearsExperience || 0,
        isVerified: service.provider.providerProfile?.isVerified || false,
      },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

// PUT - Update service (Provider only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.providerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only edit your own services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, title, description, price, priceType, location, isActive } = body;

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(priceType && { priceType }),
        ...(location && { location }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service (Provider only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.providerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only delete your own services" },
        { status: 403 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
