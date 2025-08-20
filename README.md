# Wander Studios

A modern web application for managing fitness classes, bookings, and packages.

## Features

### Virtual Classes
- **Virtual Class Support**: Classes can be marked as virtual with Zoom/meeting links
- **Email Notifications**: Automatic email notifications with virtual class links
- **Calendar Integration**: Virtual links included in calendar events
- **Admin Interface**: Easy management of virtual class settings

### Core Features
- User registration and authentication
- Class booking system
- Package management
- Payment processing (Square, Bitcoin)
- Waiver management
- Admin dashboard
- Calendar integration (Apple/Google)

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Square API credentials
- Resend API key (for email notifications)

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/wander_studios"

# Square API
SQUARE_APPLICATION_ID="your_square_app_id"
SQUARE_ACCESS_TOKEN="your_square_access_token"
SQUARE_LOCATION_ID="your_square_location_id"

# Resend API (for virtual class emails)
RESEND_API_KEY="your_resend_api_key"

# Bitcoin (optional)
BITCOIN_API_KEY="your_bitcoin_api_key"
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Virtual Class Setup

### Email Configuration
1. Sign up for a [Resend](https://resend.com) account
2. Add your domain or use the provided subdomain
3. Add the `RESEND_API_KEY` to your environment variables

### Creating Virtual Classes
1. Log in as an admin
2. Go to the admin dashboard
3. Create a new class
4. Check "Virtual Class" checkbox
5. Add the virtual meeting link (Zoom, Google Meet, etc.)
6. Save the class

### Email Templates
Virtual class emails include:
- Class details and timing
- Virtual meeting link
- Pre-class preparation tips
- Contact information

## Sales Tax

The application includes a basic sales tax calculation system based on customer location. For production use, consider integrating with a comprehensive tax service like:
- TaxJar
- Avalara
- Stripe Tax

## API Endpoints

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create a new class
- `PUT /api/classes/[id]` - Update a class
- `DELETE /api/classes/[id]` - Archive a class

### Bookings
- `GET /api/bookings` - List all bookings
- `POST /api/bookings` - Create a booking
- `GET /api/bookings?classId=[id]` - Get bookings for a class

### Packages
- `GET /api/packages` - List all packages
- `POST /api/packages/purchase` - Purchase a package
- `POST /api/packages/redeem` - Redeem a package class

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
