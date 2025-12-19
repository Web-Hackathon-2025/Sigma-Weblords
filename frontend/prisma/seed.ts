import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create providers
  const provider1 = await prisma.user.upsert({
    where: { email: "ahmed.plumber@karigar.pk" },
    update: {},
    create: {
      name: "Ahmed Khan",
      email: "ahmed.plumber@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-321-1234567",
      address: "Gulberg III, Lahore",
      bio: "Professional plumber with 10+ years experience in residential and commercial plumbing.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Ahmed Plumbing Services",
          yearsExperience: 10,
          serviceAreas: "Lahore, Gulberg, DHA, Model Town",
          certifications: "Licensed Master Plumber",
          availability: "Mon-Sat 8AM-8PM",
          isVerified: true,
          completedJobs: 156,
          averageRating: 4.8,
        },
      },
    },
  });

  const provider2 = await prisma.user.upsert({
    where: { email: "ali.electrician@karigar.pk" },
    update: {},
    create: {
      name: "Ali Hassan",
      email: "ali.electrician@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-333-9876543",
      address: "DHA Phase 5, Karachi",
      bio: "Certified electrician specializing in home wiring, repairs, and installations.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Ali Electric Works",
          yearsExperience: 8,
          serviceAreas: "Karachi, DHA, Clifton, PECHS",
          certifications: "Certified Electrical Technician",
          availability: "Mon-Sun 9AM-9PM",
          isVerified: true,
          completedJobs: 203,
          averageRating: 4.9,
        },
      },
    },
  });

  const provider3 = await prisma.user.upsert({
    where: { email: "fatima.cleaner@karigar.pk" },
    update: {},
    create: {
      name: "Fatima Bibi",
      email: "fatima.cleaner@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-300-5551234",
      address: "F-10, Islamabad",
      bio: "Professional home cleaning services with eco-friendly products.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Sparkle Clean Services",
          yearsExperience: 5,
          serviceAreas: "Islamabad, Rawalpindi",
          certifications: "Professional Cleaning Certified",
          availability: "Mon-Sat 7AM-6PM",
          isVerified: true,
          completedJobs: 89,
          averageRating: 4.7,
        },
      },
    },
  });

  const provider4 = await prisma.user.upsert({
    where: { email: "usman.carpenter@karigar.pk" },
    update: {},
    create: {
      name: "Usman Malik",
      email: "usman.carpenter@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-312-7778899",
      address: "Johar Town, Lahore",
      bio: "Master carpenter crafting custom furniture and home repairs for 15 years.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Malik Carpentry Works",
          yearsExperience: 15,
          serviceAreas: "Lahore, Johar Town, Bahria Town",
          certifications: "Master Craftsman",
          availability: "Mon-Sat 9AM-7PM",
          isVerified: true,
          completedJobs: 278,
          averageRating: 4.9,
        },
      },
    },
  });

  const provider5 = await prisma.user.upsert({
    where: { email: "sara.painter@karigar.pk" },
    update: {},
    create: {
      name: "Sara Ahmed",
      email: "sara.painter@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-345-1112233",
      address: "Bahria Town, Islamabad",
      bio: "Professional painter specializing in interior and exterior painting.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Color Dreams Painting",
          yearsExperience: 7,
          serviceAreas: "Islamabad, Rawalpindi, Bahria Town",
          certifications: "Professional Painter Certified",
          availability: "Mon-Sun 8AM-6PM",
          isVerified: true,
          completedJobs: 134,
          averageRating: 4.6,
        },
      },
    },
  });

  const provider6 = await prisma.user.upsert({
    where: { email: "bilal.plumber@karigar.pk" },
    update: {},
    create: {
      name: "Bilal Hussain",
      email: "bilal.plumber@karigar.pk",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-322-4445566",
      address: "Saddar, Karachi",
      bio: "Expert plumber specializing in water heaters and bathroom renovations.",
      role: "PROVIDER",
      providerProfile: {
        create: {
          businessName: "Bilal Plumbing Solutions",
          yearsExperience: 12,
          serviceAreas: "Karachi, Saddar, North Nazimabad",
          certifications: "Licensed Plumber",
          availability: "Mon-Sat 8AM-7PM",
          isVerified: true,
          completedJobs: 189,
          averageRating: 4.7,
        },
      },
    },
  });

  // Create Services
  const services = [
    // Plumbing Services - Ahmed
    {
      title: "Pipe Repair & Replacement",
      description: "Expert pipe repair and replacement services for leaky, burst, or corroded pipes. We handle all types of pipes including PVC, copper, and galvanized steel.",
      category: "Plumbing",
      price: 1500,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider1.id,
    },
    {
      title: "Bathroom Fitting Installation",
      description: "Complete bathroom fitting installation including taps, showers, toilets, and sinks. Professional installation with warranty.",
      category: "Plumbing",
      price: 3000,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider1.id,
    },
    {
      title: "Water Heater Installation",
      description: "Installation and repair of electric and gas water heaters. All brands supported with 6-month service warranty.",
      category: "Plumbing",
      price: 2500,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider1.id,
    },
    {
      title: "Drain Cleaning Service",
      description: "Professional drain cleaning to remove blockages and restore proper flow. Using modern equipment for thorough cleaning.",
      category: "Plumbing",
      price: 1200,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider1.id,
    },
    // Plumbing Services - Bilal
    {
      title: "Emergency Plumbing Repair",
      description: "24/7 emergency plumbing services for burst pipes, severe leaks, and flooding. Quick response guaranteed.",
      category: "Plumbing",
      price: 2000,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider6.id,
    },
    {
      title: "Toilet Repair & Installation",
      description: "Complete toilet repair and new installation services. Fixing leaks, clogs, and replacing old toilets.",
      category: "Plumbing",
      price: 1800,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider6.id,
    },
    {
      title: "Kitchen Sink Plumbing",
      description: "Kitchen sink installation, repair, and unclogging services. Garbage disposal installation available.",
      category: "Plumbing",
      price: 1400,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider6.id,
    },
    // Electrical Services
    {
      title: "Home Wiring & Rewiring",
      description: "Complete home electrical wiring and rewiring services. Safe, up-to-code installations for new constructions and renovations.",
      category: "Electrical",
      price: 500,
      priceType: "HOURLY",
      location: "Karachi",
      providerId: provider2.id,
    },
    {
      title: "Ceiling Fan Installation",
      description: "Professional ceiling fan installation and replacement. Includes mounting, wiring, and testing.",
      category: "Electrical",
      price: 800,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider2.id,
    },
    {
      title: "Electrical Panel Upgrade",
      description: "Upgrade your electrical panel to handle modern power demands. Certified electrician ensuring safety compliance.",
      category: "Electrical",
      price: 15000,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider2.id,
    },
    {
      title: "LED Light Installation",
      description: "Energy-efficient LED light installation for homes and offices. Recessed lights, chandeliers, and outdoor lighting.",
      category: "Electrical",
      price: 600,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider2.id,
    },
    {
      title: "AC Installation & Wiring",
      description: "Air conditioner installation with proper electrical wiring. Split AC and window AC installation available.",
      category: "Electrical",
      price: 3500,
      priceType: "FIXED",
      location: "Karachi",
      providerId: provider2.id,
    },
    // Cleaning Services
    {
      title: "Deep Home Cleaning",
      description: "Thorough deep cleaning of your entire home including kitchen, bathrooms, bedrooms, and living areas. Eco-friendly products used.",
      category: "Cleaning",
      price: 5000,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider3.id,
    },
    {
      title: "Kitchen Deep Clean",
      description: "Intensive kitchen cleaning including appliances, cabinets, countertops, and floors. Grease and grime removal guaranteed.",
      category: "Cleaning",
      price: 2000,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider3.id,
    },
    {
      title: "Sofa & Carpet Cleaning",
      description: "Professional sofa and carpet cleaning using steam cleaning technology. Removes stains, odors, and allergens.",
      category: "Cleaning",
      price: 3500,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider3.id,
    },
    {
      title: "Office Cleaning Service",
      description: "Regular office cleaning services for businesses. Flexible scheduling available.",
      category: "Cleaning",
      price: 4000,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider3.id,
    },
    // Carpentry Services
    {
      title: "Custom Furniture Making",
      description: "Handcrafted custom furniture made to your specifications. Beds, wardrobes, tables, and more using premium wood.",
      category: "Carpentry",
      price: 1000,
      priceType: "HOURLY",
      location: "Lahore",
      providerId: provider4.id,
    },
    {
      title: "Door & Window Repair",
      description: "Repair and replacement of doors and windows. Fixing hinges, locks, frames, and glass fitting.",
      category: "Carpentry",
      price: 1500,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider4.id,
    },
    {
      title: "Kitchen Cabinet Installation",
      description: "Custom kitchen cabinet design and installation. Modern and traditional styles available.",
      category: "Carpentry",
      price: 25000,
      priceType: "FIXED",
      location: "Lahore",
      providerId: provider4.id,
    },
    {
      title: "Wood Flooring Installation",
      description: "Professional hardwood and laminate flooring installation. Includes floor preparation and finishing.",
      category: "Carpentry",
      price: 800,
      priceType: "HOURLY",
      location: "Lahore",
      providerId: provider4.id,
    },
    // Painting Services
    {
      title: "Interior Wall Painting",
      description: "Professional interior painting services. Includes wall preparation, primer, and premium paint application.",
      category: "Painting",
      price: 25,
      priceType: "SQFT",
      location: "Islamabad",
      providerId: provider5.id,
    },
    {
      title: "Exterior House Painting",
      description: "Weather-resistant exterior painting for homes. Proper surface preparation and quality paints for lasting results.",
      category: "Painting",
      price: 35,
      priceType: "SQFT",
      location: "Islamabad",
      providerId: provider5.id,
    },
    {
      title: "Texture & Decorative Painting",
      description: "Specialty texture and decorative painting techniques. Create unique wall finishes and accent walls.",
      category: "Painting",
      price: 4000,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider5.id,
    },
    {
      title: "Wood Polish & Varnish",
      description: "Professional wood polishing and varnishing for furniture and doors. Restores shine and protects wood.",
      category: "Painting",
      price: 2500,
      priceType: "FIXED",
      location: "Islamabad",
      providerId: provider5.id,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  // Create test customer
  await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      password: await bcrypt.hash("password123", 12),
      phone: "+92-300-1234567",
      address: "Gulberg, Lahore",
      role: "CUSTOMER",
    },
  });

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@karigar.pk" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@karigar.pk",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Test Accounts:");
  console.log("Customer: customer@test.com / password123");
  console.log("Provider: ahmed.plumber@karigar.pk / password123");
  console.log("Admin: admin@karigar.pk / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
