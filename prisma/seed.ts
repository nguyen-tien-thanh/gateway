import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const roles = [
    {
      id: 1,
      name: 'ADMIN',
      description: 'Administrator'
    },
    {
      id: 2,
      name: 'USER',
      description: 'User'
    },
    {
      id: 3,
      name: 'CS',
      description: 'Chăm sóc khách hàng'
    }
  ];

  const permissions = [
    {
      resource: '*',
      description: '*',
      path: '*',
      method: '*',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'findAll',
      path: '/users',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'findOne',
      path: '/users/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'create',
      path: '/users',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'update',
      path: '/users/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'remove',
      path: '/users/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'findAll',
      path: '/roles',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'findOne',
      path: '/roles/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'create',
      path: '/roles',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'update',
      path: '/roles/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'remove',
      path: '/roles/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'findAll',
      path: '/permissions',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'findOne',
      path: '/permissions/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'create',
      path: '/permissions',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'update',
      path: '/permissions/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'remove',
      path: '/permissions/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'calls',
      description: 'findAll',
      path: '/calls',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'calls',
      description: 'findOne',
      path: '/calls/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'calls',
      description: 'create',
      path: '/calls',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'calls',
      description: 'update',
      path: '/calls/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'calls',
      description: 'remove',
      path: '/calls/:id',
      method: 'DELETE',
      isDefault: true
    }
  ];

  // Create roles first
  for (const roleData of roles) {
    console.log(`Creating role ${roleData.name}...`);
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: roleData
    });

    // Create default user for each role
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash('dx@123', salt);
    const dump = role.name.toLowerCase();
    const randomVietnamPhone = () =>
      '0' + Math.floor(100000000 + Math.random() * 900000000);
    const randomAddress = () =>
      ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'][
        Math.floor(Math.random() * 5)
      ];

    await prisma.user.upsert({
      where: { email: `${dump}@dx.com` },
      update: {},
      create: {
        email: `${dump}@dx.com`,
        password: hashedPassword,
        salt,
        name: role.name,
        address: randomAddress(),
        contact: randomVietnamPhone(),
        avatar: `https://i.pravatar.cc/150?u=${dump}@dx.com`,
        status: UserStatus.ACTIVE,
        roleId: role.id,
        token: '',
        username: dump
      }
    });
  }

  const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });

  for (const permissionData of permissions) {
    console.log(`Creating permission ${permissionData.description}...`);
    const permission = await prisma.permission.upsert({
      where: {
        resource_description: {
          resource: permissionData.resource,
          description: permissionData.description
        }
      },
      update: {},
      create: permissionData
    });

    console.log(`Assigning ${permission.description} to admin role...`);
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id }
    });
  }

  console.log('Creating default email templates...');
  const emailTemplates = [
    {
      title: 'System Notification',
      slug: 'system-notification',
      sender: 'noreply@dx.com',
      subject: 'System Notification',
      body: `
        <html>
          <body>
            <h2>System Notification</h2>
            <p>Hello {{username}},</p>
            <p>This is a system notification from dx.</p>
            <p>{{message}}</p>
            <p>Best regards,<br>dx Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'Welcome',
      slug: 'welcome',
      sender: 'noreply@dx.com',
      subject: 'Welcome to dx',
      body: `
        <html>
          <body>
            <h2>Welcome to dx!</h2>
            <p>Hello {{username}},</p>
            <p>Thank you for registering with dx. Please click the link below to activate your account:</p>
            <p>{{link}}</p>
            <p>Best regards,<br>dx Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'New User',
      slug: 'new-user',
      sender: 'noreply@dx.com',
      subject: 'Welcome to dx',
      body: `
        <html>
          <body>
            <h2>Welcome to dx!</h2>
            <p>Hello {{username}},</p>
            <p>An account has been created for you on dx. Please click the link below to set your password:</p>
            <p>{{link}}</p>
            <p>Best regards,<br>dx Team</p>
          </body>
        </html>
      `,
      isDefault: true
    },
    {
      title: 'Two Factor Authentication Enabled',
      slug: 'two-fa-enabled',
      sender: 'noreply@dx.com',
      subject: 'Two-Factor Authentication Enabled',
      body: `
        <html>
          <body>
            <h2>Two-Factor Authentication Enabled</h2>
            <p>Hello {{username}},</p>
            <p>Two-factor authentication has been successfully enabled for your dx account.</p>
            <p>Your account is now more secure with an additional layer of protection.</p>
            <p>If you didn't enable this feature, please contact support immediately.</p>
            <p>Best regards,<br>dx Team</p>
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
