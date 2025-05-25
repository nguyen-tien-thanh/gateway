import { Injectable } from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PermissionRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(args: Prisma.PermissionFindManyArgs): Promise<Permission[]> {
    return this.prisma.permission.findMany(args);
  }

  async count(where?: Prisma.PermissionWhereInput): Promise<number> {
    return this.prisma.permission.count({ where });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { description: name } });
  }

  async findById(id: number): Promise<Permission | null> {
    return this.prisma.permission.findUnique({ where: { id } });
  }

  async create(data: Prisma.PermissionCreateInput): Promise<Permission> {
    return this.prisma.permission.create({ data });
  }

  async update(args: Prisma.PermissionUpdateArgs): Promise<Permission> {
    return this.prisma.permission.update(args);
  }

  async delete(id: number): Promise<Permission> {
    return this.prisma.permission.delete({ where: { id } });
  }
}
