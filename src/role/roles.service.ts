import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { NotFoundException } from 'src/exception/not-found.exception';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/role/dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleFilterDto } from 'src/role/dto/role-filter.dto';
import { Pagination } from 'src/paginate';
import { RoleSerializer } from 'src/role/serializer/role.serializer';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';

export type RoleWithPermissions = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: Array<{
    id: number;
    permission: {
      id: number;
      resource: string;
      description: string;
      path: string;
      method: string;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transform role to serializer format
   * @param role
   */
  private transformRole(role: any): RoleSerializer {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permission:
        role.permissions?.map((rp: any) => ({
          id: rp.permission.id,
          resource: rp.permission.resource,
          description: rp.permission.description,
          path: rp.permission.path,
          method: rp.permission.method,
          isDefault: rp.permission.isDefault,
          createdAt: rp.permission.createdAt,
          updatedAt: rp.permission.updatedAt
        })) || []
    };
  }

  /**
   * Get paginated roles list
   * @param filter
   */
  async findAll(filter: RoleFilterDto): Promise<Pagination<RoleSerializer>> {
    const { page = 1, limit = 10, keywords } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.RoleWhereInput = {};
    if (keywords) {
      where.OR = [
        { name: { contains: keywords, mode: 'insensitive' } },
        { description: { contains: keywords, mode: 'insensitive' } }
      ];
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }),
      this.prisma.role.count({ where })
    ]);

    const serializedRoles = roles.map((role) => this.transformRole(role));

    return new Pagination({
      results: serializedRoles,
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      next: page < Math.ceil(total / limit) ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    });
  }

  /**
   * Create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    // Check if role with same name exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      const errorPayload: ValidationPayloadInterface[] = [
        {
          property: 'name',
          constraints: { unique: 'already taken' }
        }
      ];
      throw new UnprocessableEntityException(errorPayload);
    }

    const roleData: Prisma.RoleCreateInput = {
      name: createRoleDto.name,
      description: createRoleDto.description
    };

    const role = await this.prisma.role.create({
      data: roleData,
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    // If permissions are provided, assign them
    if (createRoleDto.permissions && createRoleDto.permissions.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: createRoleDto.permissions.map((permissionId) => ({
          roleId: role.id,
          permissionId
        }))
      });

      // Fetch the role with permissions
      const roleWithPermissions = await this.prisma.role.findUnique({
        where: { id: role.id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });

      return this.transformRole(roleWithPermissions);
    }

    return this.transformRole(role);
  }

  /**
   * Find role by id
   * @param id
   */
  async findOne(id: number): Promise<RoleSerializer> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.transformRole(role);
  }

  /**
   * Update role by id
   * @param id
   * @param updateRoleDto
   */
  async update(
    id: number,
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleSerializer> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if name is unique (excluding current role)
    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: updateRoleDto.name,
          NOT: { id }
        }
      });

      if (existingRole) {
        const errorPayload: ValidationPayloadInterface[] = [
          {
            property: 'name',
            constraints: { unique: 'already taken' }
          }
        ];
        throw new UnprocessableEntityException(errorPayload);
      }
    }

    // Use transaction to ensure data consistency
    const updatedRole = await this.prisma.$transaction(async (prisma) => {
      // Update role basic info
      await prisma.role.update({
        where: { id },
        data: {
          name: updateRoleDto.name,
          description: updateRoleDto.description
        }
      });

      // If permission IDs provided, update permissions
      if (updateRoleDto.permissions !== undefined) {
        // Remove existing permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: id }
        });

        // Add new permissions
        if (updateRoleDto.permissions.length > 0) {
          await prisma.rolePermission.createMany({
            data: updateRoleDto.permissions.map((permissionId) => ({
              roleId: id,
              permissionId
            }))
          });
        }
      }

      // Return updated role with permissions
      return prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
    });

    return this.transformRole(updatedRole);
  }

  /**
   * Remove role by id
   * @param id
   */
  async remove(id: number): Promise<void> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Delete role permissions first (cascade should handle this, but being explicit)
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id }
    });

    await this.prisma.role.delete({ where: { id } });
  }
}
