import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateStatusDto, UpdateStatusDto } from './status.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class StatusService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.status.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createStatusDto: CreateStatusDto) {
    const existed = await this.prismaService.status.findFirst({
      where: { title: createStatusDto.title }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.status.create({
      data: createStatusDto
    });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [statuses, total] = await Promise.all([
      this.prismaService.status.findMany({
        orderBy: { id: 'desc' },
        ...filter
      }),
      this.prismaService.status.count({ where })
    ]);

    return new Pagination({
      results: statuses,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.status.findUnique({
      where: { id }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const existed = await this.prismaService.status.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for title conflicts if title is being updated
    if (updateStatusDto.title) {
      const titleExists = await this.prismaService.status.findFirst({
        where: { title: updateStatusDto.title, NOT: { id } }
      });
      if (titleExists) throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.status.update({
      where: { id },
      data: updateStatusDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.status.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.status.delete({ where: { id } });
    return res;
  }
}
