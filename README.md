# SOTA API

A robust NestJS application with authentication, user management, and email capabilities.

## Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- MySQL (v8.0 or later)
- Redis
- RabbitMQ
- Yarn package manager

### Database Schema

<div align="center">
<img src="./public/images/erd.png" alt="ERD" width="700">
</div><br>

### Installation Steps

1. **Install Dependencies**

   ```bash
   yarn install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your MySQL configuration settings:

   ```
   DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   yarn prisma:generate

   # Run database migrations
   yarn prisma:migrate

   # Seed the database with initial data
   yarn prisma:seed
   ```

### Starting the Application

#### Development Mode

```bash
yarn start:dev
```

The application will be available at `http://localhost:7777`

#### Production Mode

```bash
# Build the application
yarn build

# Start the production server
yarn start:prod
```

### Default Accounts

After seeding the database, you can use these accounts:

- Admin: `admin@sota.com` | `admin123`
- User: `user@sota.com` | `user123`

### API Documentation

Access the Swagger API documentation at:

```
http://localhost:7777/api-docs
```

### Available Scripts

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
cis
├── config/               # Configuration files
├── prisma/               # Database schema and migrations
├── public/               # Static files
├── src/
│   ├── auth/             # Authentication module
│   ├── common/           # Common utilities and guards
│   ├── config/           # Application configuration
│   ├── mail/             # Email templates and services
│   ├── user/             # User management
│   └── main.ts           # Application entry point
├── .env                  # Environment variables
├── .env.example          # Example environment variables
└── package.json          # Project dependencies
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
