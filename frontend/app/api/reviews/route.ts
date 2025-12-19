import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get("providerId");
    const customerId = searchParams.get("customerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (providerId) {
      where.providerId = providerId;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          request: {
            select: {
              id: true,
              service: {
                select: {
                  title: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a review (Customer only, after service completion)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create reviews" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requestId, rating, comment } = body;

    // Validation
    if (!requestId || !rating) {
      return NextResponse.json(
        { error: "Request ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if booking exists and is completed
    const booking = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { review: true, service: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review your own bookings" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You can only review completed services" },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { error: "You have already reviewed this service" },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        customerId: session.user.id,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        requestId,
        rating,
        comment,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        title: "New Review",
        message: `${session.user.name} left a ${rating}-star review for your service`,
        type: "review",
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
