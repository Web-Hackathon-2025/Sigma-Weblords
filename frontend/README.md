# Karigar - Hyperlocal Services Marketplace

A full-stack web application that connects customers with local service providers such as plumbers, electricians, cleaners, tutors, and technicians.

## 🚀 Features

### For Customers
- 🔍 **Browse & Search Services** - Find services by category, location, or keyword
- 📅 **Book Appointments** - Schedule services with preferred date and time
- 📊 **Track Bookings** - View status updates for all your bookings
- ⭐ **Rate & Review** - Leave feedback for completed services
- 🔔 **Notifications** - Get updates on booking status changes

### For Service Providers
- 📝 **Create Service Listings** - Add, edit, and manage your services
- 📋 **Manage Bookings** - Accept, decline, or reschedule requests
- 📈 **Dashboard Analytics** - View earnings, ratings, and performance
- 👤 **Business Profile** - Showcase experience and certifications

### For Administrators
- 👥 **User Management** - View, suspend, or delete user accounts
- 🛠️ **Service Moderation** - Review and moderate service listings
- ⭐ **Review Moderation** - Manage user reviews
- 📊 **Platform Analytics** - Monitor key metrics and statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Authentication**: NextAuth.js v5 (Google OAuth + Credentials)
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials (optional, for Google sign-in)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Sigma-Weblords/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/karigar?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"

   # Google OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev --name init

   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Test Accounts

After seeding the database, you can use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@karigar.com | admin123 |
| Customer | john@example.com | customer123 |
| Provider | ahmed@karigar.com | provider123 |

## 📁 Project Structure

```
frontend/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── admin/              # Admin endpoints
│   │   ├── bookings/           # Booking CRUD
│   │   ├── services/           # Service CRUD
│   │   └── reviews/            # Review CRUD
│   ├── auth/                   # Auth pages (signin, signup)
│   ├── dashboard/              # Role-based dashboards
│   │   ├── admin/              # Admin dashboard
│   │   ├── customer/           # Customer dashboard
│   │   ├── provider/           # Provider dashboard
│   │   └── profile/            # Profile settings
│   ├── services/               # Service browsing & details
│   ├── bookings/               # Booking details
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── components/                 # Reusable UI components
├── lib/                        # Utilities & configurations
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeder
├── types/                      # TypeScript type definitions
└── public/                     # Static assets
```

## 🗄️ Database Schema

### Models
- **User** - User accounts with role-based access
- **Service** - Service listings created by providers
- **ServiceRequest** - Booking requests from customers
- **Review** - Customer reviews for services
- **ProviderProfile** - Extended profile for service providers
- **Notification** - User notifications

## 🎨 UI Components

- `Navbar` - Responsive navigation with role-based links
- `Footer` - Site-wide footer
- `ServiceCard` - Service listing card
- `BookingCard` - Booking summary card
- `StarRating` - Interactive/display star ratings
- `Modal` - Reusable modal component
- `LoadingSpinner` - Loading state indicator
- `CategoryFilter` - Service category filters

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

### Services
- `GET /api/services` - List services (with filters)
- `POST /api/services` - Create service (provider)
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service
- `DELETE /api/services/[id]` - Delete service

### Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status

### Reviews
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review
- `DELETE /api/reviews/[id]` - Delete review

### Admin
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
Build the application and start the production server:
```bash
npm run build
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

**Sigma Weblords** - Web Hackathon 2025

---

Made with ❤️ for connecting communities with skilled professionals.
