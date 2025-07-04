import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { Pagination } from 'src/shared/paginate';
import { IFilter } from 'src/common/decorators/filter.decorator';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionDto
} from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated permissions
   */
  async findAll(filter: IFilter): Promise<Pagination<PermissionDto>> {
    const { take = 10, skip = 0, where } = filter;

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({ ...filter }),
      this.prisma.permission.count({ where })
    ]);

    return new Pagination({
      results: permissions,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  /**
   * Find permission by name
   */
  async findByName(name: string): Promise<PermissionDto | null> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        resource_description: {
          resource: name,
          description: name
        }
      }
    });
    if (!permission) return null;

    return permission;
  }

  /**
   * Get permission by id
   */
  async findById(id: number): Promise<PermissionDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    return permission;
  }

  /**
   * Create new permission
   */
  async create(
    createPermissionDto: CreatePermissionDto
  ): Promise<PermissionDto> {
    // Check if permission with same name exists
    const existingPermission = await this.prisma.permission.findUnique({
      where: {
        resource_description: {
          resource: createPermissionDto.resource,
          description: createPermissionDto.description
        }
      }
    });

    if (existingPermission) {
      throw new UnprocessableEntityException(
        `Permission with name '${createPermissionDto.description}' already exists`
      );
    }

    const permission = await this.prisma.permission.create({
      data: {
        resource: createPermissionDto.resource,
        description: createPermissionDto.description,
        path: createPermissionDto.path,
        method: createPermissionDto.method,
        isDefault: createPermissionDto.isDefault
      }
    });

    return permission;
  }

  /**
   * Update permission
   */
  async update(
    id: number,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionDto> {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new UnprocessableEntityException('Permission not found');
    }

    // Check if name is unique (excluding current permission)
    // if (updatePermissionDto.description) {
    //   const existingPermission = await this.prisma.permission.findFirst({
    //     where: {
    //       description: updatePermissionDto.description,
    //       NOT: { id }
    //     }
    //   });

    //   if (existingPermission) {
    //     throw new UnprocessableEntityException(
    //       `Permission with name '${updatePermissionDto.description}' already exists`
    //     );
    //   }
    // }

    const updateData: Prisma.PermissionUpdateInput = {
      ...(updatePermissionDto.resource && {
        resource: updatePermissionDto.resource
      }),
      ...(updatePermissionDto.description && {
        description: updatePermissionDto.description
      }),
      ...(updatePermissionDto.path && { path: updatePermissionDto.path }),
      ...(updatePermissionDto.method && { method: updatePermissionDto.method }),
      ...(updatePermissionDto.isDefault !== undefined && {
        isDefault: updatePermissionDto.isDefault
      })
    };

    const updatedPermission = await this.prisma.permission.update({
      where: { id },
      data: updateData
    });

    return updatedPermission;
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
  async getPermissionForRoleAssignment(): Promise<PermissionDto[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: { description: 'asc' }
    });

    return permissions;
  }
}
