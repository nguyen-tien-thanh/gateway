import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateCallTypeDto, UpdateCallTypeDto } from './call-type.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class CallTypeService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.callType.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createCallTypeDto: CreateCallTypeDto) {
    const existed = await this.prismaService.callType.findFirst({
      where: { title: createCallTypeDto.title }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.callType.create({
      data: createCallTypeDto
    });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [callTypes, total] = await Promise.all([
      this.prismaService.callType.findMany({
        orderBy: { id: 'desc' },
        ...filter
      }),
      this.prismaService.callType.count({ where })
    ]);

    return new Pagination({
      results: callTypes,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.callType.findUnique({
      where: { id }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateCallTypeDto: UpdateCallTypeDto) {
    const existed = await this.prismaService.callType.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for title conflicts if title is being updated
    if (updateCallTypeDto.title) {
      const titleExists = await this.prismaService.callType.findFirst({
        where: { title: updateCallTypeDto.title, NOT: { id } }
      });
      if (titleExists) throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.callType.update({
      where: { id },
      data: updateCallTypeDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.callType.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.callType.delete({ where: { id } });
    return res;
  }
}
