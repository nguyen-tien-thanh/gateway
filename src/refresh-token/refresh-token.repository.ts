import { Injectable } from '@nestjs/common';
import { RefreshToken, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async findOne(
    refreshTokenWhereUniqueInput: Prisma.RefreshTokenWhereUniqueInput,
    include?: Prisma.RefreshTokenInclude
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: refreshTokenWhereUniqueInput,
      include
    });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RefreshTokenWhereUniqueInput;
    where?: Prisma.RefreshTokenWhereInput;
    orderBy?: Prisma.RefreshTokenOrderByWithRelationInput;
    include?: Prisma.RefreshTokenInclude;
  }): Promise<RefreshToken[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.refreshToken.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include
    });
  }

  async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data
    });
  }

  async update(params: {
    where: Prisma.RefreshTokenWhereUniqueInput;
    data: Prisma.RefreshTokenUpdateInput;
  }): Promise<RefreshToken> {
    const { where, data } = params;
    return this.prisma.refreshToken.update({
      data,
      where
    });
  }

  async delete(
    where: Prisma.RefreshTokenWhereUniqueInput
  ): Promise<RefreshToken> {
    return this.prisma.refreshToken.delete({
      where
    });
  }

  async deleteMany(
    where: Prisma.RefreshTokenWhereInput
  ): Promise<{ count: number }> {
    return this.prisma.refreshToken.deleteMany({
      where
    });
  }

  async count(where?: Prisma.RefreshTokenWhereInput): Promise<number> {
    return this.prisma.refreshToken.count({ where });
  }
}
