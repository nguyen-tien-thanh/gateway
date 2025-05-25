import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/permission/dto/update-permission.dto';
import { PermissionPaginateFilterDto } from 'src/permission/dto/permission-paginate-filter.dto';
import { PermissionRepository } from 'src/permission/permission.repository';
import { PermissionSerializer } from 'src/permission/serializer/permission.serializer';
import { Pagination } from 'src/paginate';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';

@Injectable()
export class PermissionsService {
  constructor(private readonly repository: PermissionRepository) {}

  /**
   * Get paginated permissions
   * @param filter
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
      this.repository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' }
      }),
      this.repository.count(where)
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
   * @param name
   */
  async findByName(name: string): Promise<PermissionSerializer | null> {
    const permission = await this.repository.findByName(name);
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
   * @param id
   */
  async findById(id: number): Promise<PermissionSerializer> {
    const permission = await this.repository.findById(id);
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
   * @param createPermissionDto
   */
  async create(
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionSerializer> {
    // Check if permission with same name exists
    const existingPermission = await this.repository.findByName(
      createPermissionDto.name
    );
    if (existingPermission) {
      const errorPayload: ValidationPayloadInterface[] = [
        {
          property: 'name',
          constraints: { unique: 'already taken' }
        }
      ];
      throw new UnprocessableEntityException(errorPayload);
    }

    const permission = await this.repository.create({
      resource: 'general',
      description: createPermissionDto.name,
      path: '/unknown',
      method: 'GET',
      isDefault: false
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
   * @param id
   * @param updatePermissionDto
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionSerializer> {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    // Check if name is unique (excluding current permission)
    if (updatePermissionDto.name) {
      const existingPermission = await this.repository.findMany({
        where: {
          description: updatePermissionDto.name,
          NOT: { id }
        }
      });

      if (existingPermission.length > 0) {
        const errorPayload: ValidationPayloadInterface[] = [
          {
            property: 'name',
            constraints: { unique: 'already taken' }
          }
        ];
        throw new UnprocessableEntityException(errorPayload);
      }
    }

    const updateData: Prisma.PermissionUpdateInput = {};
    if (updatePermissionDto.name) {
      updateData.description = updatePermissionDto.name;
    }
    if (updatePermissionDto.description) {
      updateData.description = updatePermissionDto.description;
    }

    const updatedPermission = await this.repository.update({
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
   * @param id
   */
  async remove(id: number): Promise<void> {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    await this.repository.delete(id);
  }

  /**
   * Get permissions for role assignment
   */
  async getPermissionForRoleAssignment(): Promise<PermissionSerializer[]> {
    const permissions = await this.repository.findMany({
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
