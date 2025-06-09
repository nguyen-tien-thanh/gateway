import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default permissions
  const permissions = [
    {
      resource: 'user',
      description: 'user-index',
      path: '/api/v1/user',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'user',
      description: 'user-show',
      path: '/api/v1/user/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'user',
      description: 'user-store',
      path: '/api/v1/user',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'user',
      description: 'user-update',
      path: '/api/v1/user/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'user',
      description: 'user-delete',
      path: '/api/v1/user/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'role',
      description: 'role-index',
      path: '/api/v1/role',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'role',
      description: 'role-show',
      path: '/api/v1/role/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'role',
      description: 'role-store',
      path: '/api/v1/role',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'role',
      description: 'role-update',
      path: '/api/v1/role/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'role',
      description: 'role-delete',
      path: '/api/v1/role/:id',
      method: 'DELETE',
      isDefault: true
    }
  ];

  console.log('Creating permissions...');
  for (const permissionData of permissions) {
    await prisma.permission.upsert({
      where: { description: permissionData.description },
      update: {},
      create: permissionData
    });
  }

  // Create admin role
  console.log('Creating admin role...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator role with full access'
    }
  });

  // Create user role
  console.log('Creating user role...');
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user role with limited access'
    }
  });

  // Assign all permissions to admin role
  console.log('Assigning permissions to admin role...');
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id
      }
    });
  }

  // Create admin user
  console.log('Creating admin user...');
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sota.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@sota.com',
      password: hashedPassword,
      salt,
      name: 'Administrator',
      address: 'System',
      contact: '+1234567890',
      avatar: '',
      status: UserStatus.ACTIVE,
      token: '',
      isTwoFAEnabled: false,
      roleId: adminRole.id
    }
  });

  // Create test user
  console.log('Creating test user...');
  const testSalt = await bcrypt.genSalt();
  const testHashedPassword = await bcrypt.hash('user123', testSalt);

  const user = await prisma.user.upsert({
    where: { email: 'user@sota.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@sota.com',
      password: testHashedPassword,
      salt: testSalt,
      name: 'Test User',
      address: 'Test Address',
      contact: '+9876543210',
      avatar: '',
      status: UserStatus.ACTIVE,
      token: '',
      isTwoFAEnabled: false,
      roleId: userRole.id
    }
  });

  // Create default email templates
  console.log('Creating default email templates...');
  const emailTemplates = [
    {
      title: 'System Notification',
      slug: 'system-notification',
      sender: 'noreply@sota.com',
      subject: 'System Notification',
      body: `
        <html>
          <body>
            <h2>System Notification</h2>
            <p>Hello {{username}},</p>
            <p>This is a system notification from SOTA.</p>
            <p>{{message}}</p>
            <p>Best regards,<br>SOTA Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'Welcome',
      slug: 'welcome',
      sender: 'noreply@sota.com',
      subject: 'Welcome to SOTA',
      body: `
        <html>
          <body>
            <h2>Welcome to SOTA!</h2>
            <p>Hello {{username}},</p>
            <p>Thank you for registering with SOTA. Please click the link below to activate your account:</p>
            <p>{{link}}</p>
            <p>Best regards,<br>SOTA Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'New User',
      slug: 'new-user',
      sender: 'noreply@sota.com',
      subject: 'Welcome to SOTA',
      body: `
        <html>
          <body>
            <h2>Welcome to SOTA!</h2>
            <p>Hello {{username}},</p>
            <p>An account has been created for you on SOTA. Please click the link below to set your password:</p>
            <p>{{link}}</p>
            <p>Best regards,<br>SOTA Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'Two Factor Authentication Enabled',
      slug: 'two-fa-enabled',
      sender: 'noreply@sota.com',
      subject: 'Two-Factor Authentication Enabled',
      body: `
        <html>
          <body>
            <h2>Two-Factor Authentication Enabled</h2>
            <p>Hello {{username}},</p>
            <p>Two-factor authentication has been successfully enabled for your SOTA account.</p>
            <p>Your account is now more secure with an additional layer of protection.</p>
            <p>If you didn't enable this feature, please contact support immediately.</p>
            <p>Best regards,<br>SOTA Team</p>
          </body>
        </html>
      `,
      isDefault: true
    }
  ];

  for (const templateData of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: templateData.slug },
      update: {},
      create: templateData
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
