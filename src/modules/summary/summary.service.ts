import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CreateSummaryDto, UpdateSummaryDto } from './summary.dto';
import { IFilter } from 'src/common/decorators/filter.decorator';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { Pagination } from 'src/shared/paginate/pagination';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';

@Injectable()
export class SummaryService {
  constructor(private readonly prismaService: PrismaService) {}

  async count(filter: IFilter) {
    const res = await this.prismaService.summary.count({
      where: filter.where
    });

    return { results: res };
  }

  async create(createSummaryDto: CreateSummaryDto) {
    const existed = await this.prismaService.summary.findFirst({
      where: { callId: createSummaryDto.callId }
    });
    if (existed) throw new ConflictException(ExceptionTitleList.Conflict);

    const res = await this.prismaService.summary.create({
      data: createSummaryDto
    });
    return res;
  }

  async findAll(filter: IFilter) {
    const { take = 10, skip = 0, where } = filter;

    const [summaries, total] = await Promise.all([
      this.prismaService.summary.findMany({
        orderBy: { id: 'desc' },
        include: {
          call: true
        },
        ...filter
      }),
      this.prismaService.summary.count({ where })
    ]);

    return new Pagination({
      results: summaries,
      currentPage: skip,
      pageSize: take,
      totalItems: total,
      next: skip < Math.ceil(total / take) ? skip + 1 : null,
      previous: skip > 1 ? skip - 1 : null
    });
  }

  async findOne(id: number) {
    const res = await this.prismaService.summary.findUnique({
      where: { id },
      include: {
        call: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async findByCallId(callId: number) {
    const res = await this.prismaService.summary.findUnique({
      where: { callId },
      include: {
        call: true
      }
    });
    if (!res) throw new NotFoundException(ExceptionTitleList.NotFound);
    return res;
  }

  async update(id: number, updateSummaryDto: UpdateSummaryDto) {
    const existed = await this.prismaService.summary.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    // Check for callId conflicts if callId is being updated
    if (updateSummaryDto.callId) {
      const callIdExists = await this.prismaService.summary.findFirst({
        where: { callId: updateSummaryDto.callId, NOT: { id } }
      });
      if (callIdExists)
        throw new ConflictException(ExceptionTitleList.Conflict);
    }

    const res = await this.prismaService.summary.update({
      where: { id },
      data: updateSummaryDto
    });
    return res;
  }

  async remove(id: number) {
    const existed = await this.prismaService.summary.findFirst({
      where: { id }
    });
    if (!existed) throw new NotFoundException(ExceptionTitleList.NotFound);

    const res = await this.prismaService.summary.delete({ where: { id } });
    return res;
  }
}
