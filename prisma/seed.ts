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
      name: 'OWNER',
      description: 'Chủ nhà / Owner'
    },
    {
      id: 3,
      name: 'STAFF',
      description: 'Nhân viên / Staff'
    },
    {
      id: 4,
      name: 'PARTNER',
      description: 'Đối tác / Partner'
    },
    {
      id: 5,
      name: 'TENANT',
      description: 'Người thuê nhà / Tenant'
    },
    {
      id: 6,
      name: 'USER',
      description: 'Người dùng / User'
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
      description: 'user-index',
      path: '/users',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'user-show',
      path: '/users/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'user-store',
      path: '/users',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'user-update',
      path: '/users/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'users',
      description: 'user-delete',
      path: '/users/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'role-index',
      path: '/roles',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'role-show',
      path: '/roles/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'role-store',
      path: '/roles',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'role-update',
      path: '/roles/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'roles',
      description: 'role-delete',
      path: '/roles/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'permission-index',
      path: '/permissions',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'permission-show',
      path: '/permissions/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'permission-store',
      path: '/permissions',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'permission-update',
      path: '/permissions/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'permissions',
      description: 'permission-delete',
      path: '/permissions/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'house',
      description: 'house-index',
      path: '/house',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'house',
      description: 'house-show',
      path: '/house/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'house',
      description: 'house-store',
      path: '/house',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'house',
      description: 'house-update',
      path: '/house/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'house',
      description: 'house-delete',
      path: '/house/:id',
      method: 'DELETE',
      isDefault: true
    },
    {
      resource: 'room',
      description: 'room-index',
      path: '/room',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'room',
      description: 'room-show',
      path: '/room/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'room',
      description: 'room-store',
      path: '/room',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'room',
      description: 'room-update',
      path: '/room/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'room',
      description: 'room-delete',
      path: '/room/:id',
      method: 'DELETE',
      isDefault: true
    },
    //

    {
      resource: 'asset',
      description: 'asset-index',
      path: '/asset',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'asset',
      description: 'asset-show',
      path: '/asset/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'asset',
      description: 'asset-store',
      path: '/asset',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'asset',
      description: 'asset-update',
      path: '/asset/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'asset',
      description: 'asset-delete',
      path: '/asset/:id',
      method: 'DELETE',
      isDefault: true
    },
    //

    {
      resource: 'asset-category',
      description: 'asset-category-index',
      path: '/asset-category',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'asset-category',
      description: 'asset-category-show',
      path: '/asset-category/:id',
      method: 'GET',
      isDefault: true
    },
    {
      resource: 'asset-category',
      description: 'asset-category-store',
      path: '/asset-category',
      method: 'POST',
      isDefault: true
    },
    {
      resource: 'asset-category',
      description: 'asset-category-update',
      path: '/asset-category/:id',
      method: 'PATCH',
      isDefault: true
    },
    {
      resource: 'asset-category',
      description: 'asset-category-delete',
      path: '/asset-category/:id',
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
    const hashedPassword = await bcrypt.hash('Sota@123', salt);
    const dump = role.name.toLowerCase();
    const randomVietnamPhone = () =>
      '0' + Math.floor(100000000 + Math.random() * 900000000);
    const randomAddress = () =>
      ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng'][
        Math.floor(Math.random() * 5)
      ];

    await prisma.user.upsert({
      where: { email: `${dump}@sota.com` },
      update: {},
      create: {
        email: `${dump}@sota.com`,
        password: hashedPassword,
        salt,
        name: role.name,
        address: randomAddress(),
        contact: randomVietnamPhone(),
        avatar: `https://i.pravatar.cc/150?u=${dump}@sota.com`,
        status: UserStatus.ACTIVE,
        roleId: role.id,
        token: '',
        username: dump
      }
    });
  }

  const adminRole = await prisma.role.findFirst({ where: { name: 'ADMIN' } });
  const ownerRole = await prisma.role.findFirst({ where: { name: 'OWNER' } });
  const staffRole = await prisma.role.findFirst({ where: { name: 'STAFF' } });
  const partRole = await prisma.role.findFirst({ where: { name: 'PARTNER' } });
  const tenantRole = await prisma.role.findFirst({ where: { name: 'TENANT' } });
  const userRole = await prisma.role.findFirst({ where: { name: 'USER' } });

  for (const permissionData of permissions) {
    console.log(`Creating permission ${permissionData.description}...`);
    const permission = await prisma.permission.upsert({
      where: { description: permissionData.description },
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

    if (
      !permission.resource.includes('*') &&
      !permission.resource.includes('house')
    ) {
      console.log(`Assigning ${permission.resource} to owner role...`);
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: ownerRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: { roleId: ownerRole.id, permissionId: permission.id }
      });
    }

    if (
      !permission.resource.includes('*') &&
      !permission.resource.includes('house')
    ) {
      console.log(`Assigning ${permission.resource} to staff role...`);
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: staffRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: { roleId: staffRole.id, permissionId: permission.id }
      });

      console.log(`Assigning ${permission.resource} to partner role...`);
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: partRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: { roleId: partRole.id, permissionId: permission.id }
      });
    }

    if (
      permission.resource.includes('tenant') ||
      permission.resource.includes('contract') ||
      permission.resource.includes('payment')
    ) {
      console.log(`Assigning ${permission.resource} to tenant role...`);
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: tenantRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: { roleId: tenantRole.id, permissionId: permission.id }
      });
    }

    if (
      permission.resource.includes('read') ||
      permission.resource.includes('view')
    ) {
      console.log(`Assigning ${permission.resource} to user role...`);
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: { roleId: userRole.id, permissionId: permission.id }
      });
    }
  }

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
