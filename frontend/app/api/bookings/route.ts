import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role"); // customer or provider
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by user role
    if (session.user.role === "CUSTOMER" || role === "customer") {
      where.customerId = session.user.id;
    } else if (session.user.role === "PROVIDER" || role === "provider") {
      where.providerId = session.user.id;
    } else if (session.user.role === "ADMIN") {
      // Admin can see all bookings
    }

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
              address: true,
            },
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              phone: true,
              address: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
              category: true,
              price: true,
              priceType: true,
            },
          },
          review: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST - Create a new booking (Customer only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "Only customers can create bookings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { serviceId, scheduledDate, scheduledTime, notes, address } = body;

    // Validation
    if (!serviceId || !scheduledDate || !scheduledTime || !address) {
      return NextResponse.json(
        { error: "Service, scheduled date, scheduled time, and address are required" },
        { status: 400 }
      );
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Check if customer is not booking their own service
    if (service.providerId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot book your own service" },
        { status: 400 }
      );
    }

    // Parse the scheduled date
    const parsedDate = new Date(scheduledDate);

    // Check for scheduling conflicts (same provider, same date, same time)
    const existingBooking = await prisma.serviceRequest.findFirst({
      where: {
        providerId: service.providerId,
        status: { in: ["PENDING", "CONFIRMED", "IN_PROGRESS"] },
        scheduledDate: parsedDate,
        scheduledTime: scheduledTime,
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "The provider is not available at this time. Please choose a different slot." },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.serviceRequest.create({
      data: {
        customerId: session.user.id,
        providerId: service.providerId,
        serviceId,
        scheduledDate: parsedDate,
        scheduledTime,
        notes,
        address,
        totalPrice: service.price,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
          },
        },
      },
    });

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: service.providerId,
        title: "New Booking Request",
        message: `${session.user.name} has requested your service: ${service.title}`,
        type: "booking",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
