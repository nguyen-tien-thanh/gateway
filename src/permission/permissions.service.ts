import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionPaginateFilterDto } from './dto/permission-paginate-filter.dto';
import { PermissionSerializer } from './serializer/permission.serializer';
import { PrismaService } from 'src/prisma/prisma.service';
import { Permission, Prisma } from '@prisma/client';
import { Pagination } from 'src/paginate';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated permissions
   */
  async findAll(
    filter: PermissionPaginateFilterDto
  ): Promise<Pagination<PermissionSerializer>> {
    const { page = 1, limit = 10, search } = filter;
    const skip = (page - 1) * limit;

    const where: Prisma.PermissionWhereInput = {};
    if (search) {
      where.OR = [
        { resource: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { path: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.permission.count({ where })
    ]);

    const serializedPermissions = permissions.map((permission) => ({
      id: permission.id,
      name: permission.description,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    }));

    return new Pagination({
      results: serializedPermissions,
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      next: page < Math.ceil(total / limit) ? page + 1 : null,
      previous: page > 1 ? page - 1 : null
    });
  }

  /**
   * Find permission by name
   */
  async findByName(name: string): Promise<PermissionSerializer | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { description: name }
    });
    if (!permission) return null;

    return {
      id: permission.id,
      name: permission.description,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    };
  }

  /**
   * Get permission by id
   */
  async findById(id: number): Promise<PermissionSerializer> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    return {
      id: permission.id,
      name: permission.description,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    };
  }

  /**
   * Create new permission
   */
  async create(
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionSerializer> {
    // Check if permission with same name exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: { description: createPermissionDto.name }
    });

    if (existingPermission) {
      throw new UnprocessableEntityException(
        `Permission with name '${createPermissionDto.name}' already exists`
      );
    }

    const permission = await this.prisma.permission.create({
      data: {
        resource: 'general',
        description: createPermissionDto.name,
        path: '/unknown',
        method: 'GET',
        isDefault: false
      }
    });

    return {
      id: permission.id,
      name: permission.description,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    };
  }

  /**
   * Update permission
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionSerializer> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    // Check if name is unique (excluding current permission)
    if (updatePermissionDto.name) {
      const existingPermission = await this.prisma.permission.findFirst({
        where: {
          description: updatePermissionDto.name,
          NOT: { id }
        }
      });

      if (existingPermission) {
        throw new UnprocessableEntityException(
          `Permission with name '${updatePermissionDto.name}' already exists`
        );
      }
    }

    const updateData: Prisma.PermissionUpdateInput = {};
    if (updatePermissionDto.name) {
      updateData.description = updatePermissionDto.name;
    }

    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updateData
    });

    return {
      id: updatedPermission.id,
      name: updatedPermission.description,
      description: updatedPermission.description,
      createdAt: updatedPermission.createdAt,
      updatedAt: updatedPermission.updatedAt
    };
  }

  /**
   * Delete permission
   */
  async remove(id: number): Promise<void> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    await this.prisma.permission.delete({ where: { id } });
  }

  /**
   * Get permissions for role assignment
   */
  async getPermissionForRoleAssignment(): Promise<PermissionSerializer[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { description: 'asc' }
    });

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.description,
      description: permission.description,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt
    }));
  }
}
