import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.serviceRequest.findUnique({
      where: { id },
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
            city: true,
          },
        },
        service: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if user has access to this booking
    if (
      session.user.role !== "ADMIN" &&
      booking.customerId !== session.user.id &&
      booking.providerId !== session.user.id
    ) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

// PUT - Update booking status
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

    const booking = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: true,
        customer: true,
        provider: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, scheduledAt, notes } = body;

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      REQUESTED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    };

    // Provider can confirm, start progress, complete, or cancel
    // Customer can cancel
    // Admin can do anything
    if (session.user.role === "ADMIN") {
      // Admin can update anything
    } else if (booking.providerId === session.user.id) {
      if (status && !["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
        return NextResponse.json(
          { error: "Invalid status update for provider" },
          { status: 400 }
        );
      }
    } else if (booking.customerId === session.user.id) {
      if (status && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Customers can only cancel bookings" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Validate status transition
    if (status && !validTransitions[booking.status].includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${booking.status} to ${status}` },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.serviceRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        customer: true,
        provider: true,
        service: true,
      },
    });

    // Create notifications based on status change
    if (status) {
      const notificationMessages: Record<string, { title: string; message: string; userId: string }> = {
        CONFIRMED: {
          title: "Booking Confirmed",
          message: `Your booking for ${booking.service.title} has been confirmed by ${booking.provider.name}`,
          userId: booking.customerId,
        },
        IN_PROGRESS: {
          title: "Service Started",
          message: `${booking.provider.name} has started working on your service: ${booking.service.title}`,
          userId: booking.customerId,
        },
        COMPLETED: {
          title: "Service Completed",
          message: `Your service ${booking.service.title} has been completed. Please leave a review!`,
          userId: booking.customerId,
        },
        CANCELLED: {
          title: "Booking Cancelled",
          message: `The booking for ${booking.service.title} has been cancelled`,
          userId: booking.customerId === session.user.id ? booking.providerId : booking.customerId,
        },
      };

      const notification = notificationMessages[status];
      if (notification) {
        await prisma.notification.create({
          data: {
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            type: "booking",
          },
        });
      }
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking (Admin only)
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only admins can delete bookings" },
        { status: 403 }
      );
    }

    await prisma.serviceRequest.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
