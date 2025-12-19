import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch reports (Admin only, or user's own reports)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Non-admins can only see their own reports
    if (session.user.role !== "ADMIN") {
      where.reporterId = session.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          targetUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          targetService: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          targetReview: {
            select: {
              id: true,
              rating: true,
              comment: true,
            },
          },
          targetBooking: {
            select: {
              id: true,
              status: true,
              service: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST - Create a new report
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, reason, description, targetUserId, targetServiceId, targetReviewId, targetBookingId } = body;

    // Validation
    if (!type || !reason) {
      return NextResponse.json(
        { error: "Type and reason are required" },
        { status: 400 }
      );
    }

    const validTypes = ["USER", "SERVICE", "REVIEW", "BOOKING"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Check that at least one target is provided
    if (!targetUserId && !targetServiceId && !targetReviewId && !targetBookingId) {
      return NextResponse.json(
        { error: "A target must be specified" },
        { status: 400 }
      );
    }

    // Prevent self-reporting
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot report yourself" },
        { status: 400 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        type,
        reason,
        description,
        targetUserId,
        targetServiceId,
        targetReviewId,
        targetBookingId,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin: { id: string }) => ({
        userId: admin.id,
        title: "New Report Submitted",
        message: `A new ${type.toLowerCase()} report has been submitted: ${reason}`,
        type: "report",
      })),
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
