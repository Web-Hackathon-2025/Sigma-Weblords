import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Fetch services with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const providerId = searchParams.get("providerId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: any = {};

    // Only filter by isActive if not fetching provider's own services
    if (!providerId) {
      where.isActive = true;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (providerId) {
      where.providerId = providerId;
    }

    if (location) {
      where.location = {
        contains: location,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
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
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.service.count({ where }),
    ]);

    // Calculate average ratings for each service
    const servicesWithRatings = services.map((service: any) => {
      const reviews = service.reviews;
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
          : service.provider.providerProfile?.averageRating || 0;
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        category: service.category,
        price: service.price,
        priceType: service.priceType,
        location: service.location,
        images: service.images,
        isActive: service.isActive,
        provider: {
          id: service.provider.id,
          name: service.provider.name,
          image: service.provider.image,
          phone: service.provider.phone,
          bio: service.provider.bio,
          address: service.provider.address,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          completedJobs: service.provider.providerProfile?.completedJobs || 0,
          yearsExperience: service.provider.providerProfile?.yearsExperience || 0,
          isVerified: service.provider.providerProfile?.isVerified || false,
        },
      };
    });

    return NextResponse.json({
      services: servicesWithRatings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PROVIDER") {
      return NextResponse.json(
        { error: "Only providers can create services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, price, priceType, location, images } = body;

    if (!title || !description || !category || !price || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        price: parseFloat(price),
        priceType: priceType || "FIXED",
        location,
        images,
        providerId: session.user.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
