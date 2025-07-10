import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateTypeDto, UpdateTypeDto } from './type.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class TypeService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.type.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createTypeDto: CreateTypeDto) {
    const existed = await this.prismaService.type.findFirst({
      where: { title: createTypeDto.title }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.type.create({
      data: createTypeDto
    });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [types, total] = await Promise.all([
      this.prismaService.type.findMany({
        orderBy: { id: 'desc' },
        ...filter
      }),
      this.prismaService.type.count({ where })
    ]);

    return new Pagination({
      results: types,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.type.findUnique({
      where: { id }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateTypeDto: UpdateTypeDto) {
    const existed = await this.prismaService.type.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for title conflicts if title is being updated
    if (updateTypeDto.title) {
      const titleExists = await this.prismaService.type.findFirst({
        where: { title: updateTypeDto.title, NOT: { id } }
      });
      if (titleExists) throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.type.update({
      where: { id },
      data: updateTypeDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.type.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.type.delete({ where: { id } });
    return res;
  }
}
