import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch single report
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

    const report = await prisma.report.findUnique({
      where: { id },
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
            isActive: true,
          },
        },
        targetService: {
          select: {
            id: true,
            title: true,
            category: true,
            isActive: true,
            provider: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        targetReview: {
          select: {
            id: true,
            rating: true,
            comment: true,
            customer: {
              select: {
                name: true,
              },
            },
            provider: {
              select: {
                name: true,
              },
            },
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
            customer: {
              select: {
                name: true,
              },
            },
            provider: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Non-admins can only see their own reports
    if (session.user.role !== "ADMIN" && report.reporterId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// PUT - Update report status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: true,
        targetUser: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const body = await request.json();
    const { status, resolution } = body;

    const validStatuses = ["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(resolution !== undefined && { resolution }),
      },
    });

    // Notify the reporter about the status change
    if (status && status !== report.status) {
      await prisma.notification.create({
        data: {
          userId: report.reporterId,
          title: "Report Status Updated",
          message: `Your report has been updated to: ${status}${resolution ? `. Resolution: ${resolution}` : ""}`,
          type: "report",
        },
      });
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}

// DELETE - Delete report (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.report.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    return NextResponse.json(
      { error: "Failed to delete report" },
      { status: 500 }
    );
  }
}
