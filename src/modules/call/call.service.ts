import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateCallDto, UpdateCallDto } from './call.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class CallService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.call.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createCallDto: CreateCallDto) {
    const existed = await this.prismaService.call.findFirst({
      where: { id: createCallDto.id }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.call.create({ data: createCallDto });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [calls, total] = await Promise.all([
      this.prismaService.call.findMany({
        orderBy: { updatedDate: 'desc' },
        ...filter
      }),
      this.prismaService.call.count({ where })
    ]);

    return new Pagination({
      results: calls,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.call.findUnique({
      where: { id },
      include: {
        user: true,
        transcription: true,
        summary: true,
        status: true,
        queue: true,
        callType: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateCallDto: UpdateCallDto) {
    const existed = await this.prismaService.call.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.call.update({
      where: { id },
      data: updateCallDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.call.findFirst({ where: { id } });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.call.delete({ where: { id } });
    return res;
  }
}
