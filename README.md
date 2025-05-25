## Features

- 🔐 **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (RBAC)
  - Two-factor authentication (2FA)
  - Password reset functionality

- 👥 **User Management**

  - User registration and profile management
  - Role and permission management
  - User activity tracking

- 📧 **Email System**

  - Email templates with Pug
  - Queue-based email sending
  - Multiple email templates for different purposes

- 🔒 **Security**

  - Rate limiting
  - Request throttling
  - CORS protection
  - Helmet security headers

- 📊 **Logging & Monitoring**
  - Winston logger integration
  - CloudWatch integration
  - Request logging

## Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Queue:** Bull
- **Email:** Nodemailer
- **Authentication:** JWT, Passport
- **API Documentation:** Swagger
- **Logging:** Winston
- **Testing:** Jest

## Prerequisites

- Node.js (v16 or later)
- PostgreSQL
- Redis
- Yarn package manager

<div align="center">
<img src="./public/images/erd.png" alt="ERD" width="700">
</div><br>

## Installation

1. Install dependencies:

```bash
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration.

3. Set up the database:

```bash
# Generate Prisma client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# Seed the database
yarn prisma:seed

# Default account
- Admin: `admin@agb.com` | `admin123`
- User: `user@agb.com` | `user123`
```

## Running the Application

### Development

```bash
yarn start:dev
```

The application will be available at `http://localhost:7777`

### Production

```bash
yarn build
yarn start:prod
```

## API Documentation

When running in development mode, you can access the Swagger API documentation at:

```
http://localhost:7777/api-docs
```

## Available Scripts

- `yarn start:dev` - Start development server
- `yarn build` - Build the application
- `yarn start:prod` - Start production server
- `yarn lint` - Run ESLint
- `yarn format` - Format code with Prettier
- `yarn prisma:generate` - Generate Prisma client
- `yarn prisma:migrate` - Run database migrations
- `yarn prisma:seed` - Seed the database
- `yarn prisma:studio` - Open Prisma Studio

## Project Structure

```
agb
├── config/                 # Configuration files
├── prisma/                # Database schema and migrations
├── public/                # Static files
├── src/
│   ├── auth/             # Authentication module
│   ├── common/           # Common utilities and guards
│   ├── config/           # Application configuration
│   ├── mail/             # Email templates and services
│   ├── user/             # User management
│   └── main.ts           # Application entry point
├── .env                   # Environment variables
├── .env.example          # Example environment variables
└── package.json          # Project dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
